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
    about:   document.getElementById("about")
  };

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

    // retrigger entrance animations
    const el = views[name];
    if (el && !prefersReduced) {
      el.classList.remove("is-entering");
      void el.offsetWidth;                       // force reflow
      el.classList.add("is-entering");
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
  // Populate the detail view from a project. Empty tagline/description hide.
  function fillDetail(p) {
    const idx = PROJECTS.indexOf(p) + 1;
    document.getElementById("detail-index").textContent = String(idx).padStart(2, "0");
    document.getElementById("detail-title").textContent = p.title;
    document.getElementById("detail-role").textContent  = p.role;

    const tagline = document.getElementById("detail-tagline");
    tagline.textContent = p.tagline || "";
    tagline.hidden = !p.tagline;

    const desc = document.getElementById("detail-desc");
    desc.textContent = p.description || "";
    desc.hidden = !p.description;

    document.getElementById("detail-media").innerHTML = renderMedia(p.media);
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
              `?rel=0&modestbranding=1`;
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
     CURSOR-FOLLOWING PREVIEW
     ----------------------------------------------------------------- */
  const preview      = document.getElementById("preview");
  const previewMedia = document.getElementById("preview-media");
  let rafId = null;
  let target = { x: 0, y: 0 };
  let pos    = { x: 0, y: 0 };

  let hoveredId = null;

  list.addEventListener("pointerover", (e) => {
    const row = e.target.closest(".work__row");
    if (!row) return;
    const p = PROJECTS.find((x) => x.id === row.dataset.project);
    if (!p) return;

    hoveredId = p.id;
    previewMedia.style.backgroundColor = p.fill || "#161614";
    previewMedia.style.backgroundImage = "none";  // fill shows until the frame loads
    preview.classList.add("is-visible");

    getPoster(p).then((url) => {
      if (!url || hoveredId !== p.id) return;      // moved on before it resolved
      // Verify the image actually loads before swapping it in.
      const img = new Image();
      img.onload = () => {
        if (hoveredId === p.id) previewMedia.style.backgroundImage = `url("${url}")`;
      };
      img.src = url;
    });
  });

  list.addEventListener("pointerout", (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest(".work__row")) {
      hoveredId = null;
      preview.classList.remove("is-visible");
    }
  });

  window.addEventListener("pointermove", (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(follow);
  });

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
    if (e.key === "Escape" && (view === "detail" || view === "about")) goTo("work");
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

  function routeFromHash() {
    if (suppressHash) return;
    const h = location.hash.replace("#", "");
    if (!h) { showView("landing"); return; }
    if (PROJECTS.some((p) => p.id === h)) { openProject(h); return; }
    if (views[h]) { showView(h); return; }
    showView("landing");
  }

  window.addEventListener("hashchange", routeFromHash);

  // Initial state from URL (deep link support)
  const initial = location.hash.replace("#", "");
  if (initial && (views[initial] || PROJECTS.some((p) => p.id === initial))) {
    if (PROJECTS.some((p) => p.id === initial)) {
      fillDetail(PROJECTS.find((x) => x.id === initial));
      showView("detail");
    } else {
      showView(initial);
    }
  }
})();
