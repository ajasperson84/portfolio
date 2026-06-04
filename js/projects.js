/* =====================================================================
   PROJECT DATA
   ---------------------------------------------------------------------
   This is your content. Edit / add / reorder freely.
   Each project's `media` blocks are placeholders for now — swap the
   colored blocks for real <img> or <video> when you have the assets
   (see js/main.js -> renderMedia for the markup it generates).
   ===================================================================== */

const PROJECTS = [
  {
    id: "nocturne",
    title: "Nocturne",
    role: "Director",
    year: "2025",
    tagline: "A film about the hours no one else is awake for.",
    fill: "#1d1d22",
    description:
      "A short film shot entirely between 1am and 5am across an emptied city. " +
      "Direction, edit, and grade. Built around a single rule: never cut on motion, " +
      "always cut on stillness.",
    media: [
      { label: "Still 01", fill: "#23232a" },
      { label: "Still 02", fill: "#15151a", tall: true },
      { label: "Still 03", fill: "#2d2d34" }
    ]
  },
  {
    id: "monolith",
    title: "Monolith",
    role: "Creative Director",
    year: "2024",
    tagline: "Brand identity built on a single, unbreakable mark.",
    fill: "#2a2118",
    description:
      "Full creative direction for a launch campaign — naming, type system, art " +
      "direction, and film. The whole identity hangs off one heavy grotesque set " +
      "at impossible scale.",
    media: [
      { label: "Key art", fill: "#33291d" },
      { label: "System", fill: "#1c160f", tall: true },
      { label: "Film frame", fill: "#3d2f1f" }
    ]
  },
  {
    id: "static",
    title: "Static",
    role: "Director",
    year: "2024",
    tagline: "Music video. One take. No edit. No mercy.",
    fill: "#101a16",
    description:
      "A single-take performance film. Choreographed camera, practical lighting, " +
      "and a band that only got one shot. We printed the second take.",
    media: [
      { label: "Frame 01", fill: "#16241e" },
      { label: "Frame 02", fill: "#0c130f" }
    ]
  },
  {
    id: "afterimage",
    title: "Afterimage",
    role: "Creative Director",
    year: "2023",
    tagline: "An exhibition you remember more than you saw.",
    fill: "#221016",
    description:
      "Concept and creative direction for a gallery installation pairing large-format " +
      "stills with sound. Visitors left with a residue, not a recap.",
    media: [
      { label: "Install 01", fill: "#2c141c" },
      { label: "Install 02", fill: "#180a0f", tall: true }
    ]
  }
];
