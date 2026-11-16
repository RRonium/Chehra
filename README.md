# Chehra · चेहरा

Indian fashion discovery, sizing and virtual trial room assistant. Everything runs in the browser: no accounts, no server, and photos never leave the device.

## Flow

1. **Measure** – sliders and inputs for chest, waist, hip, shoulder width and height, with an India / US / UK unit toggle. Optional **Scan from photo** runs MediaPipe Pose in the browser, uses the entered height as the pixel-to-cm scale, and pre-fills estimated measurements (clearly labelled as an estimate) with a skeleton overlay.
2. **Occasion** – a five-step questionnaire: occasion, time of day, formality, budget and preferred categories.
3. **Discover** – outfit cards ranked by match, each with a fit-confidence badge computed against that brand's size chart.
4. **Trial room** – a stylized Three.js mannequin built from the user's measurements, dressed in a 3D version of the chosen outfit. Drag to rotate.

## About the data

The catalog (`src/data/catalog.ts`) is a **curated demo dataset** of 170 synthetic listings. Brands, prices, ratings and size charts are fictional. "Source" tags name the kind of store an item would come from, and outbound links open that store's homepage, not a real listing. Product illustrations are generated SVGs.

The trial room is a **stylized fit preview**, not a photoreal try-on.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
```

Stack: Vite, React, TypeScript, Three.js, `@mediapipe/tasks-vision`. The pose model lives in `public/mediapipe/models`; the WASM runtime is copied from `node_modules` into `public/mediapipe/wasm` on install, dev and build.

## Layout

- `src/lib/avatar.ts` – mannequin and garment geometry
- `src/lib/pose.ts` – photo scan and landmark-to-measurement estimates
- `src/lib/fit.ts`, `src/lib/recommend.ts` – size matching and ranking
- `src/data/` – brands with size charts, catalog generator
- `src/components/` – the four screens
