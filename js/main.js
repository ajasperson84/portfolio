/* =====================================================================
   INTERACTION + TRANSITIONS
   ---------------------------------------------------------------------
   - View state lives on <body data-view="…"> (landing | work | detail | about)
   - Every view change runs through transition(): a bold full-screen WIPE
     covers the screen, the DOM swaps at the midpoint, then the wipe lifts.
   - On hover over the work list, a preview tile follows the cursor.
   ===================================================================== */

(() => {
  "use strict";

  const body   = document.body;
  const wipe   = document.querySelector(".wipe");

  const views = {
    landing: document.getElementById("landing"),
    work:    document.getElementById("work"),
    detail:  document.getElementById("detail"),
    about:   document.getElementById("about"),
    contact: document.getElementById("contact")
  };

  const contactForm    = document.getElementById("contact-form");
  const contactSuccess = document.getElementById("contact-success");
  const contactNext    = document.getElementById("contact-next");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -----------------------------------------------------------------
     RENDER: build the work index from PROJECTS
     ----------------------------------------------------------------- */
  const list = document.getElementById("work-list");

  PROJECTS.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "work__item";
    li.innerHTML = `
      <button class="work__row" type="button" data-project="${p.id}"
              aria-label="Open project: ${p.title}">
        <span class="work__num">${String(i + 1).padStart(2, "0")}</span>
        <span class="work__title">${p.title}</span>
        <span class="work__year">${p.role}</span>
      </button>`;
    list.appendChild(li);
  });

  /* -----------------------------------------------------------------
     TRANSITION: the wipe
     ----------------------------------------------------------------- */
  function transition(swap) {
    if (prefersReduced || !wipe.animate) { swap(); return; }

    const cover = wipe.animate(
      [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
      { duration: 450, easing: "cubic-bezier(0.76,0,0.24,1)", fill: "forwards" }
    );
    wipe.style.transformOrigin = "bottom";

    cover.onfinish = () => {
      swap();                                   // DOM swap while screen is covered
      window.scrollTo(0, 0);
      wipe.style.transformOrigin = "top";       // lift upward — feels like a reveal
      const reveal = wipe.animate(
        [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
        { duration: 550, easing: "cubic-bezier(0.76,0,0.24,1)", fill: "forwards" }
      );
      reveal.onfinish = () => { wipe.style.transform = "scaleY(0)"; };
    };
  }

  /* -----------------------------------------------------------------
     VIEW SWITCHING
     ----------------------------------------------------------------- */
  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
    body.dataset.view = name;

    // Contact defaults to the form; the success state is shown only by
    // revealContactSuccess() after a submission returns.
    if (name === "contact") {
      contactForm.hidden = false;
      contactSuccess.hidden = true;
    }

    // retrigger entrance animations
    const el = views[name];
    if (el && !prefersReduced) {
      el.classList.remove("is-entering");
      void el.offsetWidth;                       // force reflow
      el.classList.add("is-entering");
    }

    // Touch: the pinned preview belongs to the Work view only.
    if (coarse) {
      if (name === "work") requestAnimationFrame(updateMobileActive);
      else clearMobileActive();
    }
  }

  function goTo(name) {
    if (body.dataset.view === name) return;
    transition(() => showView(name));
    if (name !== "detail") setHash(name);
  }

  /* -----------------------------------------------------------------
     PROJECT DETAIL
     ----------------------------------------------------------------- */
  let currentProjectId = null;
  const prevBtn = document.getElementById("detail-prev");
  const nextBtn = document.getElementById("detail-next");

  // Populate the detail view from a project. Empty tagline/description hide.
  function fillDetail(p) {
    currentProjectId = p.id;
    const idx = PROJECTS.indexOf(p);
    document.getElementById("detail-index").textContent = String(idx + 1).padStart(2, "0");
    document.getElementById("detail-title").textContent = p.title;
    document.getElementById("detail-role").textContent  = p.role;

    const tagline = document.getElementById("detail-tagline");
    tagline.textContent = p.tagline || "";
    tagline.hidden = !p.tagline;

    const desc = document.getElementById("detail-desc");
    desc.textContent = p.description || "";
    desc.hidden = !p.description;

    document.getElementById("detail-media").innerHTML = renderMedia(p.media);

    // Prev / next project (wraps around the list)
    const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
    const next = PROJECTS[(idx + 1) % PROJECTS.length];
    prevBtn.dataset.project = prev.id;
    nextBtn.dataset.project = next.id;
    document.getElementById("detail-prev-title").textContent = prev.title;
    document.getElementById("detail-next-title").textContent = next.title;

    attachAutoAdvance(p);
  }

  // When the project's main video ends, advance to the next project.
  let currentVimeo = null;
  function advanceToNext(fromId) {
    if (body.dataset.view !== "detail" || currentProjectId !== fromId) return;
    const idx = PROJECTS.findIndex((x) => x.id === fromId);
    if (idx < 0) return;
    openProject(PROJECTS[(idx + 1) % PROJECTS.length].id);
  }

  function attachAutoAdvance(p) {
    // Tear down any previous Vimeo listener.
    if (currentVimeo) {
      try { currentVimeo.off("ended"); currentVimeo.destroy(); } catch (_) {}
      currentVimeo = null;
    }
    const mediaEl = document.getElementById("detail-media");

    const vimeoIframe = mediaEl.querySelector('iframe[src*="player.vimeo.com"]');
    if (vimeoIframe && window.Vimeo) {
      try {
        currentVimeo = new Vimeo.Player(vimeoIframe);
        currentVimeo.on("ended", () => advanceToNext(p.id));
      } catch (_) {}
    }

    const ytIframe = mediaEl.querySelector('iframe[src*="youtube"]');
    if (ytIframe) attachYouTubeEnd(ytIframe, p.id);
  }

  // YouTube end detection via the lazily-loaded IFrame API.
  let ytApiLoading = false;
  const ytPending = [];
  function attachYouTubeEnd(iframe, projectId) {
    if (!iframe.id) iframe.id = "yt-" + projectId;
    const make = () => {
      try {
        new YT.Player(iframe.id, {
          events: { onStateChange: (e) => { if (e.data === 0) advanceToNext(projectId); } }
        });
      } catch (_) {}
    };
    if (window.YT && window.YT.Player) { make(); return; }
    ytPending.push(make);
    if (!ytApiLoading) {
      ytApiLoading = true;
      window.onYouTubeIframeAPIReady = () => { ytPending.splice(0).forEach((fn) => fn()); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  }

  function openProject(id) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;

    transition(() => {
      fillDetail(p);
      showView("detail");
    });
    setHash(p.id);
  }

  // Preview thumbnail resolution.
  // Vimeo's vumbnail.com sometimes serves a generic placeholder, so we ask
  // Vimeo's official oEmbed API for the real frame and fall back gracefully:
  //   explicit poster -> oEmbed (vimeo) -> vumbnail -> fill color
  // Results are cached as promises so each video is resolved at most once.
  const posterCache = new Map();

  function getPoster(p) {
    if (posterCache.has(p.id)) return posterCache.get(p.id);

    const resolve = (async () => {
      if (p.poster) return p.poster;
      const v = p.media.find((m) => m.type === "vimeo" || m.type === "youtube");
      if (!v) return "";
      if (v.type === "youtube") {
        return `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;
      }
      // Vimeo: official oEmbed gives the true thumbnail (also for unlisted).
      try {
        const r = await fetch(
          `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${v.id}&width=640`
        );
        if (r.ok) {
          const data = await r.json();
          if (data && data.thumbnail_url) return data.thumbnail_url;
        }
      } catch (_) {
        /* network/CORS — fall through to vumbnail */
      }
      return `https://vumbnail.com/${v.id}.jpg`;
    })();

    posterCache.set(p.id, resolve);
    return resolve;
  }

  // Build a project's media. Each item has a `type`:
  //   vimeo | audio | image | (omit type) -> placeholder color block
  function renderMedia(media) {
    return media
      .map((m) => {
        switch (m.type) {
          case "vimeo": {
            // Stripped-down Vimeo chrome: no title/byline/portrait, do-not-track on.
            const src =
              `https://player.vimeo.com/video/${m.id}` +
              `?title=0&byline=0&portrait=0&dnt=1`;
            return `<div class="embed">
              <iframe src="${src}" loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen title="${m.label || "Video"}"></iframe>
            </div>`;
          }
          case "youtube": {
            const src =
              `https://www.youtube-nocookie.com/embed/${m.id}` +
              `?rel=0&modestbranding=1&enablejsapi=1`;
            return `<div class="embed">
              <iframe src="${src}" loading="lazy"
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowfullscreen title="${m.label || "Video"}"></iframe>
            </div>`;
          }
          case "audio":
            return `<div class="audio">
              ${m.label ? `<span class="audio__label">${m.label}</span>` : ""}
              ${
                m.src
                  ? `<audio controls preload="none" src="${m.src}"></audio>`
                  : ""
              }
            </div>`;
          case "image":
            return `<img src="${m.src}" alt="${m.label || ""}" loading="lazy" />`;
          default:
            return `<div class="block ${m.tall ? "block--tall" : ""}" data-fill
                      style="--fill:${m.fill}" data-label="${m.label || ""}"></div>`;
        }
      })
      .join("");
  }

  /* -----------------------------------------------------------------
     PREVIEW
     - Desktop (fine pointer): the CRT preview follows the cursor and
       shows on hover.
     - Touch (coarse pointer): there's no cursor, so the preview is pinned
       in the corner and tracks whichever project is centered as you
       scroll the Work list (see updateMobileActive below).
     ----------------------------------------------------------------- */
  const preview      = document.getElementById("preview");
  const previewMedia = document.getElementById("preview-media");
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  let rafId = null;
  let target = { x: 0, y: 0 };
  let pos    = { x: 0, y: 0 };
  let hoveredId = null;

  // Show a project's thumbnail in the preview (shared by hover + scroll).
  function setPreviewFor(p) {
    hoveredId = p.id;
    previewMedia.style.backgroundColor = p.fill || "#161614";
    previewMedia.style.backgroundImage = "none";   // fill shows until frame loads
    preview.classList.add("is-visible");

    getPoster(p).then((url) => {
      if (!url || hoveredId !== p.id) return;       // changed before it resolved
      const img = new Image();
      img.onload = () => {
        if (hoveredId === p.id) previewMedia.style.backgroundImage = `url("${url}")`;
      };
      img.src = url;
    });
  }

  // ---- Desktop: hover + cursor-follow (fine pointers only) ----
  // Works for any container with [data-project] children: the Work list and
  // the prev/next project nav on a detail page.
  function enableHoverPreview(container) {
    container.addEventListener("pointerover", (e) => {
      const el = e.target.closest("[data-project]");
      if (!el || !el.dataset.project) return;
      const p = PROJECTS.find((x) => x.id === el.dataset.project);
      if (p) setPreviewFor(p);
    });
    container.addEventListener("pointerout", (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest("[data-project]")) {
        hoveredId = null;
        preview.classList.remove("is-visible");
      }
    });
  }

  if (!coarse) {
    enableHoverPreview(list);
    enableHoverPreview(document.getElementById("detail-nav"));

    window.addEventListener("pointermove", (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(follow);
    });
  }

  function follow() {
    pos.x += (target.x - pos.x) * 0.15;          // easing trail
    pos.y += (target.y - pos.y) * 0.15;
    preview.style.left = pos.x + "px";
    preview.style.top  = pos.y + "px";
    if (Math.abs(target.x - pos.x) > 0.5 || Math.abs(target.y - pos.y) > 0.5) {
      rafId = requestAnimationFrame(follow);
    } else {
      rafId = null;
    }
  }

  // ---- Touch: highlight the centered project while scrolling ----
  let mobileRaf = null;
  function scheduleMobileActive() {
    if (!coarse || mobileRaf) return;
    mobileRaf = requestAnimationFrame(() => { mobileRaf = null; updateMobileActive(); });
  }

  function updateMobileActive() {
    if (!coarse || body.dataset.view !== "work") return;
    const rows = Array.from(list.querySelectorAll(".work__row"));
    if (!rows.length) return;

    const mid = window.innerHeight * 0.5;
    let best = null, bestDist = Infinity;
    for (const row of rows) {
      const r = row.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - mid);
      if (dist < bestDist) { bestDist = dist; best = row; }
    }

    rows.forEach((row) => row.classList.toggle("is-active", row === best));
    list.classList.toggle("has-active", !!best);

    if (best) {
      const p = PROJECTS.find((x) => x.id === best.dataset.project);
      if (p) setPreviewFor(p);
      positionMobilePreview(best);
    }
  }

  // Float the preview just above or below the active row, whichever keeps
  // it on screen and closest to the project the viewer is looking at.
  function positionMobilePreview(row) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.min(vw * 0.44, 240);
    const h = w * 3 / 4;                 // matches the 4:3 aspect ratio
    const pad = 16, gap = 14;
    const r = row.getBoundingClientRect();
    const rowCenter = r.top + r.height / 2;

    // top half of screen -> drop below the row; bottom half -> sit above it
    let top = rowCenter < vh / 2 ? r.bottom + gap : r.top - gap - h;
    top = Math.max(pad, Math.min(top, vh - h - pad));

    preview.style.left = (vw - w - pad) + "px";   // right-aligned with a margin
    preview.style.top = top + "px";
  }

  function clearMobileActive() {
    preview.classList.remove("is-visible");
    hoveredId = null;
    list.classList.remove("has-active");
    list.querySelectorAll(".work__row.is-active")
      .forEach((r) => r.classList.remove("is-active"));
  }

  if (coarse) {
    window.addEventListener("scroll", scheduleMobileActive, { passive: true });
    window.addEventListener("resize", scheduleMobileActive);
  }

  /* -----------------------------------------------------------------
     EVENT DELEGATION
     ----------------------------------------------------------------- */
  document.addEventListener("click", (e) => {
    const projectBtn = e.target.closest("[data-project]");
    if (projectBtn) { openProject(projectBtn.dataset.project); return; }

    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      goTo(action === "home" ? "landing" : action);
    }
  });

  // Scroll / wheel from landing -> work
  window.addEventListener(
    "wheel",
    (e) => {
      if (body.dataset.view === "landing" && e.deltaY > 8) goTo("work");
    },
    { passive: true }
  );

  // Keyboard: Escape closes overlays back to work; Enter on landing enters
  document.addEventListener("keydown", (e) => {
    const view = body.dataset.view;
    if (e.key === "Escape" && (view === "detail" || view === "about" || view === "contact")) goTo("work");
    if (e.key === "Enter" && view === "landing" && document.activeElement === body) goTo("work");
  });

  /* -----------------------------------------------------------------
     ROUTING via hash (shareable links + back button)
     ----------------------------------------------------------------- */
  let suppressHash = false;
  function setHash(name) {
    suppressHash = true;
    location.hash = name === "landing" ? "" : name;
    setTimeout(() => (suppressHash = false), 0);
  }

  // FormSubmit redirects here after a successful send; show the thank-you.
  function revealContactSuccess() {
    showView("contact");
    contactForm.hidden = true;
    contactSuccess.hidden = false;
  }

  function routeFromHash() {
    if (suppressHash) return;
    const h = location.hash.replace("#", "");
    if (!h) { showView("landing"); return; }
    if (h === "contact-sent") { revealContactSuccess(); return; }
    if (PROJECTS.some((p) => p.id === h)) { openProject(h); return; }
    if (views[h]) { showView(h); return; }
    showView("landing");
  }

  window.addEventListener("hashchange", routeFromHash);

  // Tell FormSubmit where to return after a submission (current page + flag).
  contactNext.value = location.origin + location.pathname + "#contact-sent";

  // Initial state from URL (deep link support)
  const initial = location.hash.replace("#", "");
  if (initial === "contact-sent") {
    revealContactSuccess();
  } else if (initial && (views[initial] || PROJECTS.some((p) => p.id === initial))) {
    if (PROJECTS.some((p) => p.id === initial)) {
      fillDetail(PROJECTS.find((x) => x.id === initial));
      showView("detail");
    } else {
      showView(initial);
    }
  }
})();
