# 🐇 Rabbit Garden

A single-page interactive encyclopedia of rabbit breeds, built with vanilla HTML/CSS/JS. Click any rabbit to learn about their origin, temperament, and care requirements.

---

## Features

- **6 rabbit breeds** — Flemish Giant, Lionhead, Holland Lop, Angora, Harlequin, Netherland Dwarf
- **Hero section** — rabbits peek up from behind a ledge; staggered entrance animation on load
- **Breed detail sections** — click any rabbit to smooth-scroll to a full profile with 3 photos, stats, and a fun fact
- **Animated photo blobs** — each photo sits in a slowly morphing organic blob shape
- **Curtain transition** — a two-tone sage/cream curtain sweeps in when returning to the top
- **AI-generated imagery** — all rabbit photos generated with Google Imagen 4, background-removed with a BFS flood-fill algorithm

---

## Project Structure

```
rabbit_garden/
├── index.html              # Entire site — HTML + CSS + JS, no build step
├── assets/
│   └── rabbits/            # AI-generated PNG images
│       ├── <breed>.png         # Hero "peek" portrait (transparent background)
│       ├── <breed>-a.png       # 3:4  full body, colour variant 1
│       ├── <breed>-b.png       # 1:1  relaxed pose, colour variant 2
│       └── <breed>-c.png       # 1:1  close-up or angle, colour variant 3
├── gen-peek.mjs            # Generate hero peek portraits via Imagen 4
├── gen-breed-detail.mjs    # Generate 3 detail images per breed via Imagen 4
├── preprocess-images.mjs   # BFS flood-fill background removal (uses sharp)
├── package.json
└── .gitignore
```

---

## Image Generation

All images are generated using the [Google Imagen 4](https://deepmind.google/technologies/imagen/) model via the `@google/genai` SDK.

### Prerequisites

```bash
npm install
```

Set your Gemini API key:

```bash
export GEMINI_KEY=your_api_key_here
```

### Generate hero portraits

Tight head-and-paws crop, pure white background, 1:1 aspect ratio:

```bash
node gen-peek.mjs
```

### Generate breed detail images

3 images per breed (3:4 full body + two 1:1 variants), each with a solid background matched to the CSS bubble colour:

```bash
node gen-breed-detail.mjs
```

### Remove backgrounds

BFS flood-fill from all four edges, matched to the sampled background colour. Writes transparent PNGs in-place:

```bash
node preprocess-images.mjs
```

> **Note:** Three images (`angora-a.png`, `angora-c.png`, `netherland-dwarf-a.png`) are intentionally skipped by the preprocessor and displayed with their original backgrounds, as their dark or low-contrast fur made clean separation impossible.

---

## Running Locally

No build step required — just open `index.html` in a browser:

```bash
open index.html
```

Or serve with any static file server:

```bash
npx serve .
```

---

## Tech Stack

| Concern | Solution |
|---|---|
| Layout & animation | Vanilla CSS (grid, custom properties, keyframes) |
| Interactivity | Vanilla JS (IntersectionObserver, smooth scroll) |
| Fonts | Cormorant Garamond (display) + Jost (body) via Google Fonts |
| Image generation | Google Imagen 4 via `@google/genai` |
| Background removal | `sharp` + custom BFS flood-fill |

---

## License

MIT — feel free to use, adapt, or take inspiration.

---

*Made by [Jiazheng Tian](https://github.com/jz-tian) · 2026*
