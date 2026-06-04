# Andrew Jasperson — Portfolio

Stark, bold, typographic portfolio for a Director & Creative Director.
Plain HTML / CSS / JS — **no build step, no dependencies.**

## Run it

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## How it's built

| File              | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `index.html`      | All views (landing, work index, project detail, about) in one page  |
| `css/styles.css`  | Design tokens + all styling. Stark monochrome, big grotesque type    |
| `js/projects.js`  | **Your content.** Edit this to add / change / reorder projects       |
| `js/main.js`      | View switching, the transition wipe, cursor preview, hash routing    |

### Navigation flow
The landing is just the name **ANDREW JASPERSON**. Clicking it (or scrolling)
wipes into the **work index**. Hovering a project shows a preview that trails the
cursor; clicking it wipes open the **project detail**. `Esc` or *Close* returns.

## Editing content

Open `js/projects.js` and edit the `PROJECTS` array. Each entry:

```js
{
  id: "nocturne",          // used in the URL (#nocturne) — keep it unique + url-safe
  title: "Nocturne",
  role: "Director",
  year: "2025",
  tagline: "One bold line about the work.",
  fill: "#1d1d22",         // placeholder/preview color until real media is added
  description: "Longer paragraph…",
  media: [
    { label: "Still 01", fill: "#23232a" },
    { label: "Still 02", fill: "#15151a", tall: true }
  ]
}
```

### Swapping placeholder blocks for real images/video
Media is rendered by `renderMedia()` in `js/main.js`. Right now it outputs colored
`.block` divs. To use real assets, drop files in `assets/` and change `renderMedia`
to emit `<img src="assets/…">` / `<video>` instead of the placeholder block.

## Theming

All colors and fonts are CSS variables at the top of `css/styles.css`
(`:root`). Change `--accent`, `--bg`, `--fg`, or the font stacks in one place.

Fonts are **Anton** (display) and **Space Grotesk** (text), loaded from Google
Fonts. To use your own grotesque, drop the `.woff2` files in `assets/`, add an
`@font-face` block, and point `--font-display` at it.

## Deploy

It's static — host anywhere:
- **GitHub Pages**: push and enable Pages on the branch.
- **Netlify / Vercel**: drag the folder in, or connect the repo (no build command).
