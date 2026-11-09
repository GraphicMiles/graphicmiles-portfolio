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
- Product-copy wrapping naturally differs with model/configuration names. The final document heights are approximately 11,842px at 980, 9,594px at 1440 and 12,652px at 390, rather than forcing fake merchandise text to reproduce an exact clothing document height.
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
