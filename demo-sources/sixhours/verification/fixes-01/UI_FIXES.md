# UI bug-fix audit: 2.0.1

This is a correction of the delivered HTML storefront, not a replacement design or an approval claim.

## Reproduced and corrected

| Failure | Correction |
|---|---|
| At 320px, the unavailable card label occupied 61px inside a 42px button and escaped its edges. | Short state labels and 20px leading keep text inside the same 42px commerce control. |
| Category text painted over gadget photographs at 768px and 980px. | Category art has a separate, contained responsive area. The three-tile band and its 222px height remain. |
| The tablet campaign title wrapped into four lines over the photographic subject. | A constrained tablet type scale and focal-position correction retain the two-line composition. The calibrated 980px/1440px geometry is unchanged. |
| The native-mobile hero cropped the actual phone and laptop out of view. | Corrected only the mobile photograph's focal position, retaining the existing readability treatment and 500px hero. |
| On narrow menu panels, the wordmark overlapped the close control by 9px. | Reserved an explicit close-control area without changing the wide 470px drawer. |
| Purchase controls offered quantities that could not be added because other variants were already in the bag. Sets had the same problem. | A shared domain availability calculation accounts for existing lines. Set availability simulates the same atomic add used on submission. |
| Related product cards retained the previous city's availability. | All product and set card surfaces update availability in place, preserving image nodes and links. |
| After moving an eight-unit bag to a five-unit city, decreasing to seven was rejected. | Safe reductions are allowed even while the bag remains temporarily over stock. Checkout stays blocked until the bag is valid. |
| Removing a bag line or reaching a disabled quantity control dropped keyboard focus onto body. | Focus moves to a usable control in the same line, the next line, or the empty-bag action. A newly disabled purchase opener also has a contextual return target. |
| A quick-view-to-bag switch began at y = -380px and retained scrollTop = 76. | Reset entry geometry per panel kind, reset new-panel scroll, and cancel stale focus callbacks. The bag enters horizontally from its own edge. |
| A delivery-area list extended to y = 768px in a 620px viewport. Keyboard highlighting could also scroll the containing panel. | A styled top-layer popover flips/clamps to available space. Highlighting scrolls only the options list. A dialog-local portal is the fallback. |
| The valid delivery result began at y = 627px, entirely below a 620px viewport. | Reveal and focus the result within the panel's own scroll area. The background document is not scrolled. |
| Height-only resizing rebuilt the experience carousel, discarding focused dots and cards. | Stable slide/dot DOM, retained logical selection, and no rebuild for keyboard/address-bar height changes. |
| The one-photo gallery displayed two arrow controls that could not change the photo. | Render arrows only for multiple photographs. |
| Editing a locally validated newsletter field left the old successful message visible; confirmation still used the old “six.” name. | Clear feedback on edits and correct the sixhours confirmation copy. The unsubstantiated bestseller badge is also replaced with an editorial label. |
| Unavailable purchase labels made one control 78px high next to a 56px quantity control. | Short purchase state labels retain the 56px row; the adjacent note supplies the city and limit details. |
| Browser Back returned a shopper from a product to y = 0 instead of y = 4496 in the collection. | Per-history-entry scroll/focus snapshots, preserved entry identity during filter URL replacement, and explicit Back/Forward restoration. No customer data is added to persistent storage. |

## Verification

- `npm test`: 22 domain tests, including new availability and overstock-reduction regressions.
- `tests/ui_regressions.py`: nine UI regression groups plus a local-only runtime check. These cover 12 detailed responsive widths, short panels, the non-popover fallback, focus, related-card updates, panel motion, stock caps, carousel resizing, navigation history, forms and galleries.
- `tests/browser_check.py`: the existing full shopping journey, set behavior, navigation/forms, cutoff re-review and six axe states.
- `tests/edge_check.py`: 24 responsive widths, rendered fonts, motion, narrow controls and the actual self-contained HTML inside an opaque sandbox. The sandbox now also exercises product/collection navigation and Back.
- Extra axe states: open area popover, empty bag and single-photo gallery.
- `tests/rebuild_visual.py`: fresh 980px, 1440px and native 390px renderings, decoded images and geometry.
- `tests/rebuild_idle.py`: separate real 95-second post-dismissal visible-tab observation; see the current recorded result, not a simulated clock.

Reports and evidence files record the actual results. A passing test suite is not a claim that every device or interaction has been exhaustively certified.

## Preserved constraints

HTML, CSS and modular vanilla JavaScript; no React/backend migration. Same catalogue of 20 products and eight component-backed sets. No real payment, order, subscription or dispatch service. The display font, main palette, calibrated bands, merchandise density and source-led motion remain. Existing font/photo publication-rights limits still apply.
