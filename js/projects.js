/* =====================================================================
   PROJECT DATA  —  this is your content. Edit freely.
   ---------------------------------------------------------------------
   Each project:
     id          unique, url-safe slug (becomes #slug in the address bar)
     title       display name
     role        "Director" / "Creative Director" / etc.
     year        string
     tagline     one bold line
     description longer paragraph
     fill        color shown in the CRT hover preview (used until a poster
                 image is set, and as the fallback behind it)
     poster      OPTIONAL preview image URL. For a Vimeo thumbnail, open the
                 video, Settings → or use https://vumbnail.com/<VIDEO_ID>.jpg
                 e.g. poster: "https://vumbnail.com/76979871.jpg"
     media[]     the work itself, shown on the project page. Item types:

        VIDEO (Vimeo) — just paste the numeric ID from the Vimeo URL
          { type: "vimeo", id: "76979871", label: "Director's cut" }

        AUDIO — a file in assets/ or any direct URL
          { type: "audio", src: "assets/score.mp3", label: "Original score" }

        IMAGE — a file in assets/ or any URL
          { type: "image", src: "assets/still-01.jpg", label: "Still 01" }

        PLACEHOLDER — colored block (no type), handy before real assets exist
          { fill: "#1d1d22", label: "Coming soon", tall: true }
   ===================================================================== */

const PROJECTS = [
  {
    id: "nocturne",
    title: "Nocturne",
    role: "Director",
    year: "2025",
    tagline: "A film about the hours no one else is awake for.",
    fill: "#1d1d22",
    poster: "", // e.g. "https://vumbnail.com/76979871.jpg"
    description:
      "A short film shot entirely between 1am and 5am across an emptied city. " +
      "Direction, edit, and grade. Built around a single rule: never cut on motion, " +
      "always cut on stillness.",
    media: [
      { type: "vimeo", id: "76979871", label: "Nocturne — full film" },
      { fill: "#23232a", label: "Still 01" },
      { fill: "#15151a", label: "Still 02", tall: true }
    ]
  },
  {
    id: "monolith",
    title: "Monolith",
    role: "Creative Director",
    year: "2024",
    tagline: "Brand identity built on a single, unbreakable mark.",
    fill: "#2a2118",
    poster: "",
    description:
      "Full creative direction for a launch campaign — naming, type system, art " +
      "direction, and film. The whole identity hangs off one heavy grotesque set " +
      "at impossible scale.",
    media: [
      { type: "vimeo", id: "76979871", label: "Launch film" },
      { fill: "#33291d", label: "Key art" },
      { fill: "#1c160f", label: "System", tall: true }
    ]
  },
  {
    id: "static",
    title: "Static",
    role: "Director",
    year: "2024",
    tagline: "Music video. One take. No edit. No mercy.",
    fill: "#101a16",
    poster: "",
    description:
      "A single-take performance film. Choreographed camera, practical lighting, " +
      "and a band that only got one shot. We printed the second take.",
    media: [
      { type: "vimeo", id: "76979871", label: "Static — music video" },
      { type: "audio", src: "", label: "Original score (add an mp3 in assets/)" }
    ]
  },
  {
    id: "afterimage",
    title: "Afterimage",
    role: "Creative Director",
    year: "2023",
    tagline: "An exhibition you remember more than you saw.",
    fill: "#221016",
    poster: "",
    description:
      "Concept and creative direction for a gallery installation pairing large-format " +
      "stills with sound. Visitors left with a residue, not a recap.",
    media: [
      { fill: "#2c141c", label: "Install 01" },
      { fill: "#180a0f", label: "Install 02", tall: true }
    ]
  }
];
