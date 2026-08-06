# Graphic Miles — Portfolio

A product-design and engineering portfolio for Raji Farouq Adewunmi, based in Lagos.

## Direction

A quiet, editorial portfolio built around a clear homepage, three curated live products, real project context, and a restrained scroll-linked work timeline. The layout is responsive-first and uses no external fonts, generated noise, animation libraries, or UI-kit scaffolding.

## Stack

- React 19 + TypeScript
- Vite 7
- Native CSS design tokens and responsive layout
- Local portrait and static product visuals

## Run locally

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Project content lives in `src/content.ts`. Product visuals live in `src/components/ProjectVisuals.tsx`.

## Standalone file

`graphic-miles-standalone.html` is a self-contained version of the site. It includes inline CSS, JavaScript, SVG product previews, and embedded portrait images, so it can be opened directly without a build step or external assets.
