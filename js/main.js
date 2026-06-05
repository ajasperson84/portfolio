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
        <span class="work__year">${p.role} · ${p.year}</span>
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
  function openProject(id) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;

    transition(() => {
      const idx = PROJECTS.indexOf(p) + 1;
      document.getElementById("detail-index").textContent   = String(idx).padStart(2, "0");
      document.getElementById("detail-title").textContent   = p.title;
      document.getElementById("detail-role").textContent    = p.role;
      document.getElementById("detail-year").textContent    = p.year;
      document.getElementById("detail-tagline").textContent = p.tagline;
      document.getElementById("detail-desc").textContent    = p.description;
      document.getElementById("detail-media").innerHTML     = renderMedia(p.media);
      showView("detail");
    });
    setHash(p.id);
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

  list.addEventListener("pointerover", (e) => {
    const row = e.target.closest(".work__row");
    if (!row) return;
    const p = PROJECTS.find((x) => x.id === row.dataset.project);
    if (!p) return;
    previewMedia.style.backgroundColor = p.fill || "#161614";
    previewMedia.style.backgroundImage = p.poster ? `url("${p.poster}")` : "none";
    preview.classList.add("is-visible");
  });

  list.addEventListener("pointerout", (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest(".work__row")) {
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
      const p = PROJECTS.find((x) => x.id === initial);
      document.getElementById("detail-index").textContent   = String(PROJECTS.indexOf(p) + 1).padStart(2, "0");
      document.getElementById("detail-title").textContent   = p.title;
      document.getElementById("detail-role").textContent    = p.role;
      document.getElementById("detail-year").textContent    = p.year;
      document.getElementById("detail-tagline").textContent = p.tagline;
      document.getElementById("detail-desc").textContent    = p.description;
      document.getElementById("detail-media").innerHTML     = renderMedia(p.media);
      showView("detail");
    } else {
      showView(initial);
    }
  }
})();
