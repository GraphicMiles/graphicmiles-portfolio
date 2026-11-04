# graphicmiles-portfolio

Portfolio site for Raji Farouq Adewunmi — product design and engineering.
Static HTML, CSS and a little JavaScript. No framework, no bundler, no runtime
dependencies.

Live: [designedbymiles.vercel.app](https://designedbymiles.vercel.app)

## What is here

```
index.html              home page
projects/index.html     project index and case study cards
404.html                not-found page
css/styles.css          the whole stylesheet
js/main.js              navigation, reveal, sort menu, scroll spy
fonts/                  Inter Tight and Fraunces, self-hosted woff2
images/                 photography, project logos, resume-adjacent assets
works/                  one folder per case study, each self-contained
works/cala/             Cala — a house on the caldera
works/cirrus/           Cirrus — receivables for finance teams
works/drop/             Drop — send something worth keeping (concept)
works/demos/            concept gallery
works/ilee/             ilee — verified long-term rentals in Lagos
works/middleground/     Okavango Marsh
works/quarry/           Quarry — a design studio for startups
works/rewind/           Rewind — streaming concept
works/tessera/          Tessera — agentic workflows
Raji_Adewunmi_Farouq_Resume.pdf
```

Each folder under `works/` is a complete static build of its own case study.
They share nothing with the root site — no common CSS or JS — so a case study can
make its own design decisions and be lifted out on its own.

## Build

```sh
npm run build
```

`static-build.js` copies the root site into `dist/` and each `works/<slug>`
folder to `dist/<slug>/`, which is how the case studies are served at
`/<slug>/` in production. There are no npm dependencies; the build is a plain
Node script.

## Local preview

```sh
npm run build && npx --yes serve dist
```

Or serve the root directly with `python3 -m http.server 8080` — the pages are
written with root-absolute paths (`/css/styles.css`), so serve from the project
root, not from a subfolder.

## Deploy

Vercel. `vercel.json` sets `buildCommand` to `node static-build.js` and
`outputDirectory` to `dist`. Nothing else is needed.

## Notes

- Fonts and every image are served from this repository; no third-party CDN.
- The case studies under `works/` are design and front-end work. Where a product
  has a separate codebase, the case study links to it.
