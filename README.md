# Raji Farouq Adewunmi, portfolio

A personal site for Raji Farouq Adewunmi, a junior full-stack and AI engineer in
Ogun, Nigeria. One page introduces him, a second page lists the shipped work and
interface studies in one place, and each self-contained study opens at its own URL.

Live: [designedbymiles.vercel.app](https://designedbymiles.vercel.app)

## Why it exists

A junior application usually arrives as a CV and a GitHub profile, and the reader
has to reconstruct what the person can actually do. This site is the other way
round: each project states what the hard part was, names the stack and links
straight to the running build or the public repository. A claim on this site has
to survive a click.

## Who it is for

Hiring managers and engineers reviewing a junior full-stack or AI engineering
application, and anyone who wants to see the work before talking.

## What you can find here

- **The home page.** Who he is, how to reach him, and a feed of all 28 entries
  across three tabs: 5 shipped apps, 9 experiments and 14 demo projects. Each
  entry states the hard part of the build, names the stack and links to the live
  app, the public repository, or the technical documentation where one exists.
- **The archive at `/projects/`.** Four sections: shipped products and developer
  tools (5), experiments and lab builds (9), interface and storefront studies
  (14), and a card for the demo hub.
- **Self-contained studies**, each a complete build of its own: `/trace`,
  `/bragsheet`, `/atelier-drop-case-study`, `/sixhours`, `/sportybet-demo`,
  `/ilee`, `/tessera`, `/cirrus`, `/drop`, `/rewind`, `/cala`, `/quarry`,
  `/demos/03-saas.html` and `/demos/04-media.html`. `/middleground` is listed with
  the experiments. The demo hub at `/demos/` lists five interactive concept
  builds.
- **Atelier Drop at `/atelier-drop/`.** A self-contained static clone of a
  password-gated Shopify streetwear store (Horizon theme): home, collection,
  nine product pages, cart, search, 404 and four concept templates, with a
  `localStorage` bag, no checkout and every page `noindex`. Case study at
  `/atelier-drop-case-study`, asset terms in `works/atelier-drop/README.md`.
- **Sixhours at `/sixhours/`.** A responsive gadget-store demo with 20 products, eight component-backed sets, local bag and delivery-area checks. No real payments, orders or deliveries.
- **Tessera at `/tessera/`.** A dark product page for an agent-workflow service: a
  hero pixel field drawn on a canvas, a matter-js word pile, a scroll-driven
  workflow timeline, six service cards, a story carousel, an FAQ and an access
  request that validates before it prints a copyable brief. One HTML file with
  its fonts and brand marks embedded, so it makes no request after the document.
  Build notes at `/tessera-product-page`. Nothing is sent anywhere.
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
tessera-product-page.html  build notes for the Tessera product page
404.html                not-found page
css/styles.css          stylesheet for the root pages
js/main.js              accordion, reveal choreography
fonts/                  Inter Tight and Caveat, self-hosted woff2
images/                 photography, project logos, thumbnails
works/<slug>/           fourteen self-contained builds
Raji_Adewunmi_Farouq_CV.pdf
```

Fonts, icons and photography are served from this repository. The pages make no
third-party requests; the only external URLs are links out to GitHub, the live
apps and demos, and asset credits.

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

### Deployment

Vercel. `vercel.json` sets `buildCommand` to `node static-build.js` and
`outputDirectory` to `dist`. Pushes to `main` deploy, and
`.github/workflows/ci.yml` runs the build and checks its output on every push and
pull request.

## Atelier Drop clone

`works/atelier-drop/` is a self-contained static site: 18 pages, 16
stylesheets and 17 vanilla-JS modules, its own fonts, photography and story
videos, and no request outside its folder. It recreates a Shopify Horizon
storefront - sticky header, mega menu, search overlay, cart drawer and page,
scene rail with a measured catenary, runway with pinned looks and a bundle add,
shoe shelf with a size picker, product pages, filters, sort and 404.

Measured against the live store at 1440 and 390 pixels while a Playwright suite
was still in the repository: page heights within 0-19 px, band-by-band screenshot
diffs of 1-4 mean error on the measured sections, zero console errors or failed
requests across 36 page runs, and a 27/27 click-path suite. That suite was later
removed to cut clone weight, so these figures record how the build measured at
the time rather than something a reader can re-run from here.
`works/atelier-drop/README.md` lists the paths to walk by hand instead.
Photography was recompressed from 36 MB to 8.2 MB at 46 dB PSNR; the folder is
17.1 MB.

The store's own quirks are reproduced on purpose (four `page-` templates with no
`<h1>`, six product pages sharing one SEO title), and every page ships
`noindex, nofollow` because the brand, copy and photography belong to the
original store. Details and asset terms: `works/atelier-drop/README.md`.

## Sixhours demo

The deployable app is in `works/sixhours/`. Fonts and retail photography have
separate rights; this is a design demonstration, not a commercial retailer. See
`works/sixhours/README.md` for asset-rights limitations.
