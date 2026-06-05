/* =====================================================================
   PROJECT DATA  —  this is your content. Edit freely.
   ---------------------------------------------------------------------
   Each project:
     id          unique, url-safe slug (becomes #slug in the address bar)
     title       display name
     role        e.g. "Director, Writer"
     tagline     OPTIONAL one bold line (hidden if empty)
     description OPTIONAL paragraph (hidden if empty)
     fill        fallback color for the CRT hover preview (shown if there's
                 no video thumbnail, e.g. on projects with no link yet)
     poster      OPTIONAL override for the preview image. Normally leave
                 blank — the preview auto-pulls the thumbnail from the first
                 video (Vimeo via vumbnail.com, YouTube via img.youtube.com).
     media[]     the work itself. Item types:
        { type: "vimeo",   id: "253713068", label: "…" }
        { type: "youtube", id: "apVeSc8HC9I", label: "…" }
        { type: "audio",   src: "assets/x.mp3", label: "…" }
        { type: "image",   src: "assets/x.jpg", label: "…" }
        { fill: "#1d1d22", label: "Coming soon" }   // placeholder block
   ===================================================================== */

const PROJECTS = [
  {
    id: "squarespace-keanu-reeves",
    title: "Squarespace — Keanu Reeves",
    role: "Concept",
    fill: "#1d1d22",
    media: [{ type: "vimeo", id: "253713068", label: "Squarespace — Keanu Reeves" }]
  },
  {
    id: "fancy-dan",
    title: "Fancy Dan",
    role: "Director, Writer",
    fill: "#221a12",
    media: [{ type: "vimeo", id: "780426029", label: "Fancy Dan" }]
  },
  {
    id: "jordan-trial-of-luka-doncic",
    title: "Jordan — Trial of Luka Dončić",
    role: "Concept, Co-Director",
    fill: "#101418",
    media: [{ type: "vimeo", id: "1077008061", label: "Jordan — Trial of Luka Dončić" }]
  },
  {
    id: "jose-cuervo-last-days",
    title: "Jose Cuervo — Last Days",
    role: "Concept",
    fill: "#241a10",
    media: [{ type: "vimeo", id: "242854602", label: "Jose Cuervo — Last Days" }]
  },
  {
    id: "truly-world-cup-anthem",
    title: "Truly — World Cup Anthem",
    role: "Director",
    fill: "#101a16",
    media: [{ type: "vimeo", id: "1182847421", label: "Truly — World Cup Anthem" }]
  },
  {
    id: "jeff-bridges-sleeping-tapes",
    title: "Jeff Bridges — Sleeping Tapes Album",
    role: "Concept, Writer, Collaborator",
    fill: "#1a1620",
    media: [{ type: "youtube", id: "apVeSc8HC9I", label: "Sleeping Tapes" }]
  },
  {
    id: "pinglr",
    title: "Pinglr",
    role: "Director, Writer",
    fill: "#101820",
    media: [{ type: "vimeo", id: "235652247", label: "Pinglr" }]
  },
  {
    id: "mack-weldon-whistle",
    title: "Mack Weldon — Whistle",
    role: "Director",
    fill: "#16161a",
    media: [{ type: "vimeo", id: "1044437382", label: "Mack Weldon — Whistle" }]
  },
  {
    id: "mack-weldon-negotiation",
    title: "Mack Weldon — Negotiation",
    role: "Director",
    fill: "#1a1616",
    media: [{ type: "vimeo", id: "1044437268", label: "Mack Weldon — Negotiation" }]
  },
  {
    id: "important-nonsense",
    title: "Important Nonsense",
    role: "Director, Writer",
    fill: "#201018",
    media: [{ type: "vimeo", id: "283805366", label: "Important Nonsense" }]
  },
  {
    id: "the-cowboys-hat",
    title: "The Cowboy's Hat",
    role: "Director, Writer",
    fill: "#221610",
    media: [{ type: "vimeo", id: "283805712", label: "The Cowboy's Hat" }]
  },
  {
    id: "truly-monkey-pong",
    title: "Truly — Monkey Pong",
    role: "Director",
    fill: "#14201a",
    media: [{ type: "vimeo", id: "1156146463", label: "Truly — Monkey Pong" }]
  },
  {
    id: "curry-putt",
    title: "Curry — Putt",
    role: "Director",
    fill: "#101820",
    media: [{ type: "vimeo", id: "888066814", label: "Curry — Putt" }]
  },
  {
    id: "curry-massage",
    title: "Curry — Massage",
    role: "Director",
    fill: "#141a20",
    media: [{ type: "vimeo", id: "873866316", label: "Curry — Massage" }]
  },
  {
    id: "cisco-drowning-in-tickets",
    title: "Cisco — Drowning in Tickets",
    role: "Director, Writer",
    fill: "#101a1c",
    media: [{ type: "vimeo", id: "907684610", label: "Cisco — Drowning in Tickets" }]
  }
];
