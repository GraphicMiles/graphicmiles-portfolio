# Atelier Drop — storefront clone

**Portfolio demo:** `/atelier-drop/`

A static, pixel-measured rebuild of a password-gated Shopify streetwear store
running the Horizon theme: 18 pages, every section, every control, no network
outside this folder.

This is a **reverse-engineering study**. The design, photography, type and
copy belong to the original store; this folder exists to show the rebuild work,
not to redistribute a brand.

No real products, payments, orders, accounts or deliveries exist. The bag is
`localStorage`, checkout is a dead link, and the pages are `noindex`.

## What is in it

| File | Store route |
|---|---|
| `index.html` | `/` |
| `collection.html` | `/collections/all` |
| `product-<handle>.html` × 9 | `/products/<handle>` |
| `cart.html` | `/cart` |
| `search.html` | `/search?q=…` |
| `page-nike-orbit.html` | `/pages/nike-orbit` |
| `page-scene-rail.html` | `/pages/scene-rail` |
| `page-runway.html` | `/pages/runway` |
| `page-shoe-atelier.html` | `/pages/shoe-atelier` |
| `404.html` | any unknown path |

Interactions that actually run: mega header and mobile menu, search overlay
with live filtering, cart drawer + cart page (add, quantity, remove, totals),
nine product pages with size pills and an add-to-bag flow, the scene rail
(drag, hover-widen, swing tags, focus overlay), the runway (six looks, pins,
per-look product list, "add full look" bundle), shoe atelier (4/6/8 grid,
shuffle, detail popup with size picker), collection filters and sort, and the
story viewer with its videos.

## Fidelity

Every page was measured against the live store at 1440 px and 390 px:

| Page | Live height | Clone height |
|---|---|---|
| home | 5669 | 5650 |
| runway | 1410 | 1410 |
| shoe atelier | 1057 | 1057 |
| 404 | 1293 | 1293 |
| products | 1749–1923 | 1749–1923 |

Band-by-band screenshot diffs against the live pages land at 1–4 mean pixel
error on the measured sections (0–255 scale), and the whole site passes a
two-width audit with **zero** console errors, failed requests, broken images or
unlabelled controls.

The clone also reproduces the store's own quirks on purpose — five products
share the same SEO title, four page templates ship no `<h1>`, the home
`<h1>` is a visually hidden password-page title — because the brief was an
exact recreation, not a cleanup.

## Files

```
index.html …            18 hand-composed pages
assets/css/             16 stylesheets, one per section, plus tokens
assets/js/              17 vanilla-JS modules (cart, layout, rail, runway, …)
assets/img/             61 optimised WebP/PNG shots (8.4 MB, recompressed from 36 MB)
assets/video/           2 story videos
assets/fonts/           Inter, Instrument Serif, GT Standard (woff2)
```

No framework, no build step, no runtime dependency: open `index.html` through
any static server. Fonts and imagery are served from this folder; the pages
make no third-party requests.

## Asset rights

The photographs, typefaces and brand marks are the original store's. This
build is published as a design and engineering study with `noindex, nofollow`
on every page. Do not reuse the assets commercially, and do not treat this
folder as permission to launch a store with them.
