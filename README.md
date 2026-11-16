<p align="center">
  <img src="docs/banner.svg" alt="Chehra: Indian fashion, sized for you" width="100%" />
</p>

<p align="center">
  <b>Indian fashion discovery, sizing and a virtual trial room, all in your browser.</b><br />
  <sub>शादी से दफ़्तर तक, हर मौक़े का अंदाज़, आपके नाप का.</sub>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-7A1F2B?style=for-the-badge&logo=react&logoColor=F6E3B4" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-7A1F2B?style=for-the-badge&logo=typescript&logoColor=F6E3B4" />
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-3D%20trial%20room-C9993A?style=for-the-badge&logo=threedotjs&logoColor=3A0A14" />
  <img alt="MediaPipe" src="https://img.shields.io/badge/MediaPipe-pose%20scan-C9993A?style=for-the-badge&logoColor=3A0A14" />
  <img alt="No server" src="https://img.shields.io/badge/Server-none-5A1220?style=for-the-badge" />
</p>

<p align="center">
  <img src="docs/chehra-demo.gif" alt="Animated walkthrough: home page, occasion questions, ranked outfits and the rotating 3D trial room" width="88%" />
</p>

<p align="center"><img src="docs/divider.svg" alt="" width="100%" /></p>

## ✦ What Chehra does

Tell Chehra your measurements and the occasion. It ranks outfits that suit the day, scores how well each brand's sizing fits you, and dresses a 3D figure shaped like you in the one you pick.

| | Step | What happens |
|:-:|---|---|
| 🪡 | **Measure** | Sliders and inputs for height, chest, waist, hip and shoulder width, with an India / US / UK toggle. An optional photo scan estimates them on your device. |
| 🪔 | **Occasion** | Five quick questions: occasion, time of day, formality, budget and the styles you lean towards. |
| 🛍️ | **Discover** | 170 outfits ranked for you, each with a fit-confidence badge from that brand's size chart. Search, filter and save favourites. |
| 👗 | **Trial room** | A stylized Three.js mannequin built from your measurements, wearing the outfit. Drag to rotate, switch backdrops, save the look. |

<p align="center"><img src="docs/divider.svg" alt="" width="100%" /></p>

## ✦ A closer look

<table>
  <tr>
    <td width="50%"><img src="docs/home.jpg" alt="Home page with a wedding photograph hero" /></td>
    <td width="50%"><img src="docs/trial-room.jpg" alt="Trial room with a lehenga on the 3D mannequin" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Home</b> · festive hero, occasion tiles, measurement form</sub></td>
    <td align="center"><sub><b>Trial room</b> · 3D figure shaped from your measurements</sub></td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/discover.jpg" alt="Outfit cards with fit badges" /></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><sub><b>Discover</b> · ranked outfits with fit confidence, sources and saved favourites</sub></td>
  </tr>
</table>

<p align="center"><img src="docs/divider.svg" alt="" width="100%" /></p>

## ✦ Features

- **Sizing that travels**: one set of measurements, shown in centimetres or inches with India, US and UK size labels.
- **Scan from photo**: MediaPipe Pose runs in the browser, uses your height as the scale and pre-fills estimates with a skeleton overlay. Nothing is uploaded.
- **Made for Indian wardrobes**: kurta, sherwani, lehenga and langa, saree, western and fusion, across weddings, festivals and puja, sangeet, office, casual and date night.
- **Fit confidence**: every outfit is matched against its brand's own size chart, with notes on where it runs snug or roomy.
- **3D trial room**: mannequin proportions follow your shoulder, chest, waist, hip and height. Three backdrops, five mannequin tones and a "Save look" image.
- **Little luxuries**: saved outfits, search, a top-pick spotlight and "Complete the look" styling notes.

<p align="center"><img src="docs/divider.svg" alt="" width="100%" /></p>

## ✦ Honest labels

> [!NOTE]
> **The catalog is a curated demo dataset.** Its 170 listings, brands, prices, ratings and size charts are fictional, and the pictures are generated illustrations. "Source" tags name the kind of store an item would come from, and each outbound link opens that store's search results for the same colour and style rather than a real product page.

> [!NOTE]
> **The trial room is a stylized fit preview**, not a photoreal try-on of you or your photo. Photo-scan measurements are estimates from a single front view, so adjust them before trusting a size.

<p align="center"><img src="docs/divider.svg" alt="" width="100%" /></p>

## ✦ Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
```

There is no backend and no sign-in. Saved outfits live in `localStorage`.

## ✦ Under the hood

| Path | Role |
|---|---|
| `src/lib/avatar.ts` | Mannequin and garment geometry |
| `src/lib/pose.ts` | Photo scan and landmark-to-measurement estimates |
| `src/lib/fit.ts`, `src/lib/recommend.ts` | Size matching and ranking |
| `src/lib/productImage.ts` | Generated outfit illustrations |
| `src/data/` | Brands with size charts, catalog generator, store search links |
| `src/components/` | Home, occasion, discover and trial room screens |
| `public/mediapipe/models` | Pose model, served from the app's own origin |

Built with Vite, React, TypeScript, Three.js and `@mediapipe/tasks-vision`. The MediaPipe WASM runtime is copied from `node_modules` into `public/mediapipe/wasm` on install, dev and build.

<p align="center"><img src="docs/divider.svg" alt="" width="100%" /></p>

<p align="center"><sub>चेहरा · Made for India's festive, formal and everyday wardrobes.</sub></p>
