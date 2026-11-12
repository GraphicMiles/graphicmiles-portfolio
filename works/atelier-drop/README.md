# Atelier Drop

A static clone of a password-gated Shopify streetwear store running the Horizon
theme. Eighteen pages rebuilt by hand in HTML, CSS and vanilla JavaScript from
the rendered output of the live store, with no theme files and no design
handoff. Nothing is fetched at runtime: fonts, photography and video sit in
`assets/`, and the bag is `localStorage`.

Deployed at `/atelier-drop/` as part of the portfolio, case study at
`/atelier-drop-case-study`. Not affiliated with the original store or with Nike.
The brand, product photography, copy and typefaces belong to their owners; the
demo is published `noindex, nofollow` as an engineering study, has no checkout
and takes no orders.

## Pages

Home and collection:

- `index.html` — home: header, story circles, catenary garment rail, runway
  teaser, shoe shelf, lookbook bands, magazine grid, footer
- `collection.html` — collection grid with sort and filter
- `search.html` — search overlay page, results filtered in the browser

Nine product pages, all sharing `product.js` and `data.js`:
`product-tatum-5-orbit.html`, `product-tatum-5-orbit-copy.html`,
`product-air-jordan-12-retro-copy.html`, `product-blazzer.html`,
`product-hoodie.html`, `product-hoodie-black.html`, `product-sweatshirt.html`,
`product-sweatshirt-plus.html`, `product-tshirt.html`.

Bag and utility:

- `cart.html` — bag page: lines, quantities, removal, subtotal
- `404.html`

Four concept templates, each a different treatment of the same catalog:

- `page-nike-orbit.html` — products orbiting a hero, add-to-bag from the orbit
- `page-runway.html` — six pinned looks, each pinning its own product list, with
  an add-full-look bundle at the foot
- `page-scene-rail.html` — rail of garments hanging from a sampled catenary
- `page-shoe-atelier.html` — shelf wall of shoes with a detail view

## Run it

The folder is plain files; any static server works.

```sh
# from the repository root
node static-build.js
node scripts/serve-dist.js    # http://127.0.0.1:4173/atelier-drop/
```

Opening the files directly also works, because every path inside the folder is
relative. The repository's Playwright tests cover the demo:

```sh
npx playwright test tests/smoke.spec.js
```

`tests/smoke.spec.js` opens the demo, asserts the `noindex` meta and the
JavaScript-built header, adds a product to the bag, and fails if any request
leaves `127.0.0.1`.

## The bag

`assets/js/cart.js` keeps the bag in `localStorage` under `nikey.cart.v1` as
`{ handle, size, qty, bundle }` lines, renders the drawer and the header badge,
and dispatches `cart:add` events. Handles come from `data.js`; nothing is
posted anywhere. Checkout is a dead end by design — there is no store, no
account and no order.

## Editing

- `assets/js/data.js` — the nine products: handle, title, price, sizes, imagery
- `assets/js/lumina-data.js` — the magazine and lookbook entries
- `assets/css/tokens.css` — colour, type and spacing variables; every other
  stylesheet is scoped to one section (`orbit.css`, `runway.css`,
  `shoe-atelier.css`, `cart.css`, …)
- `assets/js/<section>.js` — one module per section, no build step and no
  framework
- product links use the local filenames (`product-<handle>.html`); the bag
  derives its handle by stripping the `product-` prefix and `.html` suffix, so
  a renamed product page and a changed `data-url` have to move together

## Deliberate differences from the live store

These were measured, kept on purpose, and should not be "fixed" as bugs:

- Five pages carry no `<h1>`: the home page and the four concept templates.
- Six of the nine product pages share one `<title>`, and that title still ends
  with the store's password-screen suffix, `Password: 1`.
- The theme scrolls `.page-wrapper`, not the window, so scroll-linked
  measurements target the container.
- One section the theme renders with WebGL is reproduced as a CSS cross-fade.
  It matches the still frames, not the shader.
- A handful of hidden accessibility layers differ from the store by a few
  pixels.

## Known gap

`page-nike-orbit.html` and the home page both render a "View" control
(`[data-so-view]`), but neither page ships the product view it opens
(`[data-so-modal]`). `assets/js/orbit.js` looks for that element, gets `null`, and
every route into the product view returns early, so the button does nothing and
clicking a shoe only turns the orbit. The product-view code in `orbit.js` also
carries the store's CDN image URLs; if the markup is ever added back it will fetch
from `nike-makknzjs.myshopify.com` until those URLs point at local files. The
markup is left as it is: the missing view cannot be reconstructed from this
repository.

## Assets

`assets/img/` is 8.4 MB, `assets/video/` is 7.5 MB and the folder totals 18 MB.
Typefaces are GT Standard, Instrument Serif and Inter. Photography, brand marks
and type all came from the public storefront and are included to show the
reconstruction, not licensed for reuse.
