# Raji Farouq Adewunmi, portfolio

A personal site for Raji Farouq Adewunmi, a junior fullstack developer in Lagos,
Nigeria. One page introduces him, a second page holds every build in a single
list, and each build opens as its own case study.

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

- **The home page.** Who he is, how to reach him, and four featured projects
  (Legally Unbullied, Scout, Nearspace, Luna) with the hard part of each build,
  the stack, the test evidence and links to the live demo, the code and the docs.
- **The archive at `/projects`.** Every build in one list: what it is, one line
  about it, one link.
- **Nine case studies**, each a complete page of its own at `/cala`, `/cirrus`,
  `/demos`, `/drop`, `/ilee`, `/middleground`, `/quarry`, `/rewind` and
  `/tessera`.
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
404.html                not-found page
css/styles.css          stylesheet for the root pages
js/main.js              accordion, reveal choreography
fonts/                  Inter Tight, Fraunces, self-hosted woff2
images/                 photography, project logos, thumbnails
works/<slug>/           nine self-contained case studies
Raji_Adewunmi_Farouq_CV.pdf
```

Fonts, icons and photography are served from this repository. The pages make no
third-party requests; the only external URLs are links out to GitHub, the live
demos and asset credits.

### Build and preview

```sh
npm run build          # node static-build.js, writes dist/
npx --yes serve dist   # or: python3 -m http.server 8080, served from the repo root
```

`static-build.js` copies the root site into `dist/` and each `works/<slug>`
folder to `dist/<slug>/`, which is how the case studies are served at `/<slug>/`
in production. There are no runtime dependencies; the build is a plain Node
script. The pages use root-absolute paths (`/css/styles.css`), so serve from the
project root.

### Tests

```sh
npm install
npx playwright install chromium
npm run build
npm test
```

Playwright drives the built site over a local static server and checks the
journeys that matter: the home page, the archive, a case study, the 404 page, the
mobile navigation, and that no page reports a console error or a failed request.

### Deployment

Vercel. `vercel.json` sets `buildCommand` to `node static-build.js` and
`outputDirectory` to `dist`. Pushes to `main` deploy, and
`.github/workflows/ci.yml` runs the build and the Playwright suite on every push
and pull request.
