# Raji Farouq Adewunmi, portfolio

A personal site for Raji Farouq Adewunmi, a junior fullstack developer in Lagos,
Nigeria. One page introduces him, a second page lists the shipped work and live
links in one place, and each build opens as its own case study.

Live: [designedbymiles.vercel.app](https://designedbymiles.vercel.app)

## Why it exists

A junior application usually arrives as a CV and a GitHub profile, and the reader
has to reconstruct what the person can actually do. This site is the other way
round: each project states what the hard part was, names the stack, quotes the
test count, and links straight to the running build or the repository. A claim on
this site has to survive a click.

## Who it is for

Hiring managers and engineers reviewing a junior fullstack or AI engineering
application, and anyone who wants to see the work before talking.

## What you can find here

- **The home page.** Who he is, how to reach him, and five featured projects
  (Legally Unbullied, Scout, Nearspace, Luna, Atelier Drop) with the hard part of each build,
  the stack, the test evidence and links to the live demo, the code and the docs.
- **The archive at `/projects`.** The shipped work and live links in one list:
  what it is, one line about it, one link.
- **Eleven case studies**, each a complete page of its own: `/atelier-drop-case-study`,
  `/cala`, `/cirrus`, `/drop`, `/ilee`, `/middleground`, `/quarry`, `/rewind`,
  `/sportybet-demo`, `/tessera` and `/sixhours`. The demo hub at `/demos` lists
  nine concept builds: five single-page studies under `/demos`, plus Sixhours,
  Tessera, Rewind and Atelier Drop.
- **Atelier Drop at `/atelier-drop/`.** A self-contained static clone of a
  password-gated Shopify streetwear store (Horizon theme): home, collection,
  nine product pages, cart, search, 404 and four concept templates, with a
  `localStorage` bag, no checkout and every page `noindex`. Case study at
  `/atelier-drop-case-study`, asset terms in `works/atelier-drop/README.md`.
- **Sixhours at `/sixhours/`.** A responsive gadget-store demo with 20 products, eight component-backed sets, local bag and delivery-area checks. No real payments, orders or deliveries.
- **The CV.** A single page PDF, linked from the home page.

## Using it

Open [designedbymiles.vercel.app](https://designedbymiles.vercel.app). There is
no account, no cookie banner, no analytics script and no newsletter. Contact is
by email, WhatsApp, GitHub or X, all linked from the page.

## Limitations

- The site is static. Copy and project entries live in the HTML, so updating the
  site means editing a file and pushing.
- The case studies are design and front-end work. Most are interface concepts
  rather than running products; where a product does have a real codebase, the
  case study links to it.
- Nothing is submitted to the site. Every call to action is a link: email,
  WhatsApp, a repository or a live demo.

## Technical notes

Plain HTML, CSS and a small amount of JavaScript. No framework, no client-side
router and no runtime service. Every page ships its own stylesheet, and each
folder under `works/` is a self-contained build that shares nothing with the root
site, so a case study can be lifted out on its own.

```
index.html              home page
projects/index.html     the archive
atelier-drop-case-study.html  case study for the storefront clone
404.html                not-found page
css/styles.css          stylesheet for the root pages
js/main.js              accordion, reveal choreography
fonts/                  Inter Tight, Fraunces, self-hosted woff2
images/                 photography, project logos, thumbnails
works/<slug>/           eleven self-contained case studies and demos
Raji_Adewunmi_Farouq_CV.pdf
```

Fonts, icons and photography are served from this repository. The pages make no
third-party requests; the only external URLs are links out to GitHub, the live
demos and asset credits.

### Build and preview

```sh
npm run build   # node static-build.js, writes dist/
npm run serve   # node scripts/serve-dist.js, http://127.0.0.1:4173
```

`static-build.js` copies the root site into `dist/` and each `works/<slug>`
folder to `dist/<slug>/`, which is how the case studies are served at `/<slug>/`
in production. There are no runtime dependencies; the build and the server are
plain Node scripts. Serve `dist/`, not the repository root: the pages use
root-absolute paths (`/css/styles.css`) and the demos only exist at their built
paths.

### Tests

```sh
npm ci
npx playwright install chromium
npm run build
npm test
```

The same four steps run in CI (`.github/workflows/ci.yml`) on Node 20 on every
push and pull request.

Playwright drives the built site over a local static server and checks the
journeys that matter: the home page, the archive, a case study, the 404 page, the
mobile navigation, the Atelier Drop clone (its own pages, its bag, its `noindex`
and that it makes no off-site request), and that no page reports a console error
or a failed request.

### Deployment

Vercel. `vercel.json` sets `buildCommand` to `node static-build.js` and
`outputDirectory` to `dist`. Pushes to `main` deploy, and
`.github/workflows/ci.yml` runs the build and the Playwright suite on every push
and pull request.

## Atelier Drop clone

`works/atelier-drop/` is a self-contained static site: 18 pages, 16
stylesheets and 17 vanilla-JS modules, its own fonts, photography and story
videos, and no request outside its folder. It recreates a Shopify Horizon
storefront — sticky header, mega menu, search overlay, cart drawer and page,
scene rail with a measured catenary, runway with pinned looks and a bundle add,
shoe shelf with a size picker, product pages, filters, sort and 404.

Measured against the live store at 1440 and 390 pixels: page heights within
0–19 px, band-by-band screenshot diffs of 1–4 mean error on the measured
sections, zero console errors or failed requests across 36 page runs, and a
27/27 click-path suite. Photography was recompressed from 36 MB to 8.4 MB at
46 dB PSNR; the whole demo is 18 MB.

The store's own quirks are reproduced on purpose (four templates with no `<h1>`,
five products sharing one SEO title), and every page ships
`noindex, nofollow` because the brand, copy and photography belong to the
original store. Details and asset terms: `works/atelier-drop/README.md`.

## Sixhours demo source

The generated, deployable app is in `works/sixhours/`. Editable HTML/CSS/vanilla-JavaScript source and its 22 domain tests are in `demo-sources/sixhours/`, which is excluded from the static deployment. See that directory's README for build/export commands and asset-rights limitations. `tests/sixhours-demo.spec.js` covers its portfolio links and local shopping flow on desktop/mobile. Fonts and retail photography have separate rights; this is a design demonstration, not a commercial retailer.
