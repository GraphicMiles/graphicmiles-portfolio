# Implemented reference adaptation

**Status: actual store rebuilt.** This document describes the implementation and its verification, not another reference-only study or an approval claim.

## Primary 980px calibration

Measurements below are from the rendered rebuild. The paired reference values come from the completed measured reference study.

| Element | Reference | Rebuild |
|---|---:|---:|
| Hero top / height | 136.594 / 500px | 136.594 / 500px |
| Hero heading x / y / width / height | 40 / 249 / 517 / 116px | 40 / 249 / 517 / 116px |
| Hero copy type | Domaine 50 / 58, 400 | Same face, size, leading and weight |
| Hero body y / width / height | 381 / 460 / 61.188px | Same |
| Hero action | 283.19 × 58px | Same |
| Three-category band top / height | 660.594 / 222px | Same |
| Campaign top / height | 946.594 / 400px | Same |
| Campaign heading x / y / height | 370.55 / 1104.594 / 112px | Same within subpixel rounding |
| Top-picks heading y | 1410.594px | Same |
| First product image y | 1522.594px | Same |
| First product canvas | 313.297 × 375.953px | 313.328 × 375.984px |
| Product columns / density | 3 / 20 entries | Same |
| Bundle density | 8 entries | Same |
| Drawer width / Shop submenu height | 470 / 262px | Same |

At 1440px, the hero starts at 130.594px and is 750px high, the campaign starts at 1190.594px and is 400px high, and the first product canvas is at x80/y1766.594 and measures 297.5 × 357px. These match the measured reference geometry.

At native 390px, the hero is 500px, categories stack, the campaign is 540px and the first product canvas is x16/y2043.203 and 171.5 × 205.797px. Native mobile is not a scaled screenshot-width layout.

## Typography, palette and geometry

- Domaine Display regular is the actual display webfont, not DM Serif Display or a family-name-only substitute. CDP confirms `DomaineDisp-Regular` rendering.
- Public Sans is the primary sans at the measured role weights. Poppins Medium renders newsletter input text. The internal Public Sans name containing “Thin” is font metadata, not a CSS instruction to use a thin weight.
- The page is white. Body #525252; display #555555; strong text #111111; prices #767676; announcement #FFF1DA; editorial actions #2C2C2C; commerce actions #1F1F1F; stars #F7B600; expanded navigation #FF6F61; footer #EFEFED.
- Warm hero and campaign color is carried by prepared photographs. It is not a global cream page token. The campaign photo matches the reference paper sample #FDFBEF.
- The native-mobile hero alone uses the source-confirmed functional readability gradient. There are no decorative gradients, card shadows, glows, glass surfaces or idle status animations.
- Product frames are 5:6 with square corners. Compact commerce buttons are rectangular. Editorial and signup actions retain the reference's pill treatment.
- Band widths are distinct: 1170px header/hero relationships, 1280px merchandise and wide photographic promotions. This is not one universal container.

## Deliberate, explicit adaptations

- Real gadget models replace clothing; the original clothing photos, Hingees brand asset, contact details and commerce endpoints are not reused as a gadget business.
- The own-brand SVG wordmark retains the measured image footprint and heavy serif character, using licensed Bree Serif paths. It is not claimed to be the reference's unidentified logotype typeface.
- Product-copy wrapping naturally differs with model/configuration names. The final document heights are approximately 11,981px at 980, 9,621px at 1440 and 12,863px at 390, rather than forcing fake merchandise text to reproduce an exact clothing document height.
- The small information text uses #767676 rather than source #858585 for readable contrast. Muted text on light-gray commerce surfaces uses #6E6E6E. Main reference palette roles remain intact.
- The source's slight negative-margin overflow is not reproduced. The rebuilt page has no horizontal overflow across the tested 24 widths.
- Stars are visibly labeled Sample. Preview guides replace genuine-looking customer testimonials and the unsupported 12,000-customer claim. Their layout, manual slide density, outlines, stars, product strips and pagination preserve the relationship of the reference review section.
- The signup fields validate locally and say that no subscription is created. A disclosure occupies the reserved verification area; there is no fake CAPTCHA, discount entitlement or backend success.
- The floating help button opens a truthful local guide. Header icon positions are retained with working search, area, help and bag actions instead of unsupported accounts/wishlists.
- The footer payment footprint contains an explicit demo-only notice, not an unconnected payment-provider endorsement.
- Collection filtering and sorting are local, shareable hash states in this HTML-first preview, not a copied reference GET endpoint.

## Motion and interaction

- Menu/search/bag: 500ms transform, matching directions and #1F1F1F/0.5 scrim.
- Nested navigation: approximately 400ms inline height expansion, including multi-level branches, keyboard controls and Escape.
- Product alternate images: 400ms opacity crossfade; desktop actions reveal over 100ms with the measured 10px translation. No image zoom or card lift.
- Hero editorial hover uses the reference's float behavior; it is not an idle animation.
- Experience carousel: manual, infinite, one step per advance, 500ms, three/two/one visible items at the source breakpoints; no autoplay.
- Signup preview: three-second load scheduling and 90-second inactivity scheduling, once dismissed per session. It avoids interrupting another dialog, checkout or active input editing.
- The separate actual-store idle test lasted 95.206 seconds after dismissal with a visible tab. Hero pixels and carousel transform stayed identical; the popup did not return; active animation count was zero.
- Reduced motion is respected. Native dialog containment, outside click, Escape and focus return are exercised.

## Evidence and limits

`verification/rebuild/` contains the current store screenshots, same-width comparison images, rendered geometry/font proof, domain and browser reports, responsive matrix, motion samples and idle result. These apply to the actual rebuild, not to the previous rejected store or the reference report.

Tests demonstrate the checked behavior and states, not visual approval by the user. The source-reference work remains independently preserved in the workspace. Production font/image rights and the real commerce/delivery integrations remain publication blockers.

## Post-delivery bug-fix audit, 2.0.1

The audit corrected demonstrated state and responsive failures without replacing this reference-led presentation. Categories now reserve a separate image area so gadget names do not paint over the art. Tablet campaign type is constrained to keep its two-line composition. The mobile hero focal point now includes its subject, and narrow menu panels reserve the close control's space. These are content/fit corrections, not a new color, font or layout system.

The main 980px and 1440px measurements in the tables above remain unchanged after fresh rendering. Shared availability, native-dialog entry/scroll ownership, bounded select popovers, deliberate bag focus, stable carousel DOM and per-entry Back/Forward restoration address the reproduced interaction failures. Full details, before measurements and new regression reports are in `verification/fixes-01/`. This remains a local preview with the same publication blockers.

## Accessibility and functional audit, after 2.0.1

Three reproduced defects were corrected at source level. Layout, type scale, imagery, copy, motion and the reference's palette roles are unchanged.

- **Active navigation colour.** The source accent #FF6F61 measures 2.73:1 on white, so it cannot carry text. `--nav-active` is now #BF5349, the same coral scaled to 75% of its channel values, at 4.62:1 on white. All three usages are text on a white surface: the primary navigation hover and `aria-current` link, and the expanded and hovered rows inside the white menu surface. #FF6F61 keeps every surface role it held before, including the expanded-navigation background noted above, and no other token moved.
- **Promise page lead paragraph.** #767676 measures 4.20:1 on the #F6F6F6 promise surface, below the 4.5:1 body-text threshold. `.promise-page-intro` now sets `--muted: #6E6E6E`, matching the rule already documented for light-gray commerce surfaces, at 4.72:1 on #F6F6F6.
- **Collection and policy heading order.** The shop grid, the bundle grid and the promise policy body each jumped from the page h1 straight to an h3. Each now carries a visually hidden h2 naming its section — "Products in this collection", "Gift sets in this collection" and "The delivery conditions in detail". The hidden headings use the existing `sr-only` class and add no layout, and the policy overlay keeps its h3 so the dialog's heading structure stays valid.

A scripted functional pass then exercised the built demo rather than the source files. Every route, every overlay and the whole purchase path were opened and driven: no dead control on home, shop, bundles, product, checkout or promise, or in any of the eight overlays; all eight overlays open with a title and close on Escape; the skip link is the first tab stop; focus returns to the opener; the empty bag, no-match search, empty collection with a reset control that restores all twenty cards, unsupported-area refusal, checkout validation with its error summary and five field errors, newsletter rejection and tampered localStorage all degrade as documented; no console or network errors; no sideways overflow between 320 and 1440px. A second pass confirmed quantity stepping, the bundle panel's component list and atomic add, the `SIX-DEMO-` summary reference with an emptied bag, scroll restoration on Back, carousel dot, arrow and inert behaviour, quick-view variant pricing, the Ctrl+K search shortcut, reduced-motion overlays and shopping with storage denied. Eighty-nine checks, all passing, plus a re-run of the twenty-two domain tests and an axe sweep of eight routes at two viewports with zero violations.

The reports and the scripts that produced them are in `verification/audit-02/`.

## Composition and copy corrections, after 2.0.1

Three layout and copy findings were closed without touching the palette, the type scale above the breakpoint or the section order. The review cards lost their fixed minimum height: the track now stretches every card to the tallest guide and the product strip stays pinned to the bottom, so the space between a short guide and its product strip is content-driven rather than reserved. The mobile hero heading is 30px/34px and the copy block sits 32px above the hero floor, which puts the two-line heading below the photographed laptop and phone instead of across them; a 360px breakpoint steps the heading down to 26px/30px for the same reason. The portfolio README and the demo hub no longer claim a case-study count the archive does not hold: the repository carries ten case studies and the hub lists eight concept builds.

Merchandise cards now share one height in every grid. Each product and set card keeps a fixed title slot (two lines, three below 480px and four below 360px), the star row is reserved even when a set carries no sample stars, and the card action sits on the row's baseline, so names, stars, prices and buttons line up across a row. Longer names truncate inside that slot and the full name stays on the product page and in the accessible name.

The document heights above move with these changes: 11,981px at 980, 9,621px at 1440 and 12,863px at 390. The primary 980px and 1440px measurements in the tables above are otherwise unchanged.
