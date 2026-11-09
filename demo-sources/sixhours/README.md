# Sixhours: editable HTML demo source

Version 2.0.1. A reference-led gadget-store design preview with 20 product models, eight component-backed sets and illustrative six-hour delivery for selected Lagos and Abuja areas. HTML, CSS and modular vanilla JavaScript, not React.

The deployed files are in [`../../works/sixhours/`](../../works/sixhours/), served by the portfolio at **`/sixhours/`**. This source directory is deliberately excluded from the portfolio's static deployment. Do not edit the generated `works/sixhours/app.js` by hand.

## Build and export

Node 20.11 or newer:

```sh
cd demo-sources/sixhours
npm ci
npm test
npm run build
npm run export:portfolio
cd ../..
npm run build
```

`npm run build` produces a modular `site/` and a self-contained `six-preview.html` for local use. Neither is committed here. `npm run export:portfolio` exports the modular build to `works/sixhours/`, adds a `/sixhours/` base URL so both slash/no-slash deployment entry points resolve assets, and marks the public design demo noindex. The portfolio's existing static build copies that directory into `dist/sixhours/`.

For the source's standalone local preview, run `npm run preview` from this directory and open port 4173. It uses root-relative local hosting without the portfolio prefix. Do not run both local preview servers on the same port.

## Structure

- `src/data/`: catalogue, set definitions and clearly labeled preview guides.
- `src/domain/`: pure cart, inventory, delivery and checkout rules.
- `src/state/`: sanitized browser persistence and subscriptions.
- `src/features/`: catalogue, product, bag, delivery, checkout, search, navigation and forms.
- `src/ui/`: shared cards, icons, overlays, selects and per-entry navigation state.
- `src/styles/`: tokens, base, layout, shared components, commerce and views.
- `public/`: prepared local photography, fonts, brand assets and license notices.
- `research/`: image provenance and generated-editorial disclosures, not a live price feed.
- `verification/`: evidence retained from the local design and UI-fix audit.

## Verification

The domain suite contains 22 tests, including shared stock across variants, remaining-to-add availability, atomic set additions and safe reductions after a city-stock change.

The repository-level `tests/sixhours-demo.spec.js` checks portfolio links, prefix-safe assets, local shopping/coverage and the honest demo checkout on desktop and mobile. The original source-level browser checks are also retained. To run those, install Python dependencies from `requirements-verification.txt`, install Playwright Chromium, build the source and run its preview on 4173:

```sh
python tests/browser_check.py
python tests/edge_check.py
python tests/ui_regressions.py
python tests/rebuild_visual.py
python tests/rebuild_idle.py
```

Reports describe the states actually checked. They are not a claim of exhaustive device certification or production readiness.

## Demo and privacy boundaries

There is no real payment, order, subscription, dispatch, live stock or support backend. Prices, stars, inventory, coverage, fees and delivery windows are sample data. Use the included example contact details. Checkout contact details remain in tab memory; persisted data contains the bag, selected area and a demo summary without contact/address PII. Denied browser storage falls back to in-tab memory.

The proposed WAT window is 09:00 up to but not including 15:00 for six-hour confirmations. Before 09:00, the window starts at 09:00 that day; at/after 15:00, it starts at 09:00 the next day. This is not verified courier serviceability.

## Asset rights

Original storefront source is ISC, with its license included. Public Sans, Poppins and Bree Serif retain their OFL notices; Lucide retains its ISC notice. The own-brand wordmark is not the Hingees logotype.

Domaine is the supplied reference's actual display face. Downloadability does not establish production/redistribution permission; that permission remains unverified. Retail product photos also require permission before commercial use. Provenance and the explicit Domaine notice are included in `public/licenses/` and `research/`. Editorial images are AI-generated and illustrative. This portfolio publication remains a design demo, not a licensed, operational retailer.
