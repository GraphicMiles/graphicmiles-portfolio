# Portfolio Audit — Phase 1

---

## 1. Content Audit

### Strong content worth preserving

- **Name and identity are clear.** "Raji Adewunmi Farouq" appears immediately. "Graphic Miles" is used as a brand consistently.
- **The one-line bio is decent:** *"Web developer building responsive websites, product interfaces, and practical automation workflows, with hands-on experience connecting AI tools to real product tasks."* It communicates three domains (web, product UI, AI automation) in one sentence. This is the single best sentence on the site.
- **Project data in `script.js` is stronger than what's shown on screen.** The modal descriptions are more specific and better written than the card-level copy. This content is hidden behind a click, which is a problem.
- **Legally Unbullied and Nearspace** are the two strongest projects. They are real products with live deployments. They deserve the most emphasis.
- **Mr Nobody** is a cross-platform concept (Android + web) which is interesting — it shows range.
- **The skills/tools list** in the About section (JavaScript, TypeScript, Python, React, Vite, Firebase, FastAPI, Java, Capacitor, AI Automation, Computer Vision) is a strong spread. It shows breadth beyond basic frontend.
- **Location (Lagos, Nigeria)** is worth mentioning — it adds specificity.

### Weak / generic copy

- **"Web development" / "AI automation"** as the hero cover text. These are labels, not a statement. They communicate nothing that a thousand other portfolios don't also say. This is the first thing a visitor reads.
- **"Ready for work"** notice card. Generic. Every junior developer's portfolio says this. The copy "Available for frontend builds, landing pages, product UI, and practical AI automation work" is a repeat of the bio above.
- **"View work"** and **"Message"** as CTAs. Generic. No urgency, no specificity.
- **Project card-level descriptions** are bland summaries that undersell the projects:
  - *"Creator-discovery product for finding nearby builders and professionals."* — says what it is but not what was built or why it's interesting.
  - *"Legal-information assistant for asking questions and reviewing source-backed answers."* — this undersells what is actually a retrieval-augmented AI application.
  - *"Privacy-focused browser project with a bounded task assistant concept."* — "bounded task assistant concept" is vague and academic.
  - *"Editorial football news layout from the demos landing-page collection."* — "from the demos landing-page collection" undermines it.
  - *"Analytics landing page from the demos collection with dashboard-focused messaging."* — same problem.
- **Services section copy** is fine but reads like a freelancer listing, not an engineer's portfolio. "Request" as the link text is passive.
- **About section:** *"A web developer who can connect interfaces to useful automation."* — decent but could be stronger. *"I build clean, responsive web experiences and practical product prototypes"* — "clean" is overused and means nothing.
- **Footer tagline:** *"Web development, product interfaces, and practical AI automation workflows."* — verbatim repeat of the cover text. Redundant.

### Missing information

- **No mention of how projects were built.** The work cards show screenshots and generic category labels. Technology choices, architecture decisions, and the interesting problems are only in the modal — and even there they are vague.
- **No explanation of the AI/automation work.** "AI automation workflows" and "agentic flows" are mentioned but never demonstrated or explained. A visitor cannot tell what this actually means in practice.
- **No link to GitHub profile from the main content area.** GitHub only appears as a small icon in the social links row and in modal actions. For a technical portfolio, this is underexposed.
- **No writing, no thinking, no process.** The portfolio shows outputs but never explains the thinking behind them. This makes it look like a template user rather than an engineer.
- **No project dates or timelines.** A visitor cannot tell when work was done.
- **No indication of role.** Were these solo projects? Team projects? The modal points vaguely describe features but never say "I built X" or "my role was Y."
- **Nearspace has no repo link.** It's the strongest project and has no code to inspect.
- **LinkedIn link goes to a search page**, not a profile. This suggests the LinkedIn profile may not exist or isn't set up.

### Repetitive information

- The tagline "Web development, product interfaces, and practical AI automation workflows" (or close variants) appears in: the hero cover, the bio paragraph, the footer, the about section heading, and the service section heading. Five times.
- "Practical automation" or "practical AI automation" appears in at least four different places.
- The services section effectively restates what the bio already says, but in less specific terms.

### Content that deserves greater visual emphasis

- **Nearspace and Legally Unbullied** — the two real products with live deployments. These are the portfolio's strongest evidence. They currently get the same visual weight as demo landing pages.
- **The technical breadth** (Python, FastAPI, Firebase, Capacitor, Java, Computer Vision) — this is currently buried in a skills tag cloud in the About section. It's never connected to actual work.
- **The fact that real products exist** — not just mockups or demos. This is the single most differentiating fact and it's not made explicit.

---

## 2. UX Audit

### What is immediately understandable

- Name, role, and one-line description are visible above the fold on desktop.
- The Work/Services/About tab structure is simple and predictable.
- Project cards show project names clearly.
- Contact is available at multiple points (nav, hero, footer).

### What is confusing

- **The tab system hides 2/3 of the content.** A visitor must click "Services" to see services and "About" to see about. On first load, only work is visible. The Services and About sections have no preview — a visitor has no reason to click those tabs unless they're already interested.
- **Project modals require a click to reveal any substance.** The card-level information (category label + one sentence) is too thin to decide whether to click. The modal content is the real information, but it's behind an interaction wall.
- **The "Ready for work" notice card** is placed between the avatar and the social links. Its visual weight (dark icon, rounded card, background color) makes it look like an ad or notification rather than part of the profile.
- **The avatar is clickable and opens a lightbox.** There is no indication that it's clickable. A user clicking it gets a full-screen photo — this is not a useful interaction for a portfolio.
- **The cover ("Web development" / "AI automation")** looks like a banner or hero image but contains only two generic labels. It takes up significant vertical space for no informational gain.

### What requires too much scrolling

- **The profile section** is vertically stacked and takes up most of the viewport before the work begins: cover → avatar → name/bio → CTAs → notice card → social links → tabs. That's 6-7 distinct visual blocks before reaching the first project.
- **On mobile**, this problem is worse. The cover, avatar, name, bio, two buttons, notice card, social icons, and tabs all stack vertically. The first project may not be visible without scrolling.

### Where hierarchy breaks down

- **Everything on the page has roughly the same visual weight.** The name is large but so are the tab labels. The service cards have the same structure as the notice card. The social icons get the same rounded-button treatment as CTAs. Nothing stands out as primary.
- **The projects are presented as a uniform grid.** Nearspace gets `flex-basis: 100%` on desktop, which is good, but all five projects still feel like items in a gallery rather than a curated selection. The two weakest projects (Touchline, Metrix — both demo pages) get equal screen time to the two strongest (Nearspace, Legally Unbullied).
- **The tabs break the narrative flow.** A visitor has to make a decision (which tab?) before seeing content. This is a pattern from SaaS dashboards, not editorial/portfolio layouts.

### Weak CTAs

- **"Hire me"** in the nav — direct but generic.
- **"Message"** and **"View work"** in the hero — "View work" is below the fold since work is already visible. "Message" goes to a mailto link with no context.
- **"Request →"** on service cards — passive and formless. Request what? A quote? A call? A project?
- **"Discuss a similar project"** in the modal — better, but buried in a dialog.
- **"Start a conversation"** in the About section — decent but again hidden behind a tab.

### Sections that feel redundant

- **The Services section** restates what the bio and cover already communicate, but with less specificity. The service categories (Frontend websites, React product interfaces, AI automation workflows, Backend integrations) are just labels with tag clouds. They don't demonstrate capability — the projects already do that.
- **The footer** repeats the brand, tagline, project links (already in the work section), and contact info. It's a standard template footer with no new information.

### Places where the user doesn't know what to do next

- After viewing the work section, the next obvious action is unclear. Should they click a project? Switch tabs? Scroll to the footer?
- After opening a project modal, the actions are "Discuss a similar project" (mailto), "Open live project" (sometimes hidden), and "View GitHub." The modal doesn't encourage exploring other projects.
- The tab system means there's no continuous narrative — the user must choose their own path through the content.

---

## 3. Visual Audit

### Alignment problems

- The `.cover` element has `align-items: center` and `justify-content: center` on desktop, then switches to `align-items: flex-start` on mobile. The two labels inside ("Web development", "AI automation") are centered but separated by a gap — they look like two unrelated floating words.
- `.profile-body` uses `flex-wrap: wrap` with `align-items: flex-start`, causing the avatar, text, and buttons to reflow unpredictably at intermediate widths.
- `.profile-actions` is `align-self: flex-end` on desktop, pushing the buttons to the far right, but on mobile it becomes `align-self: stretch`. The transition is abrupt.

### Inconsistent spacing

- Section padding varies: `.panel` uses `padding: 1rem 0`, `.services-panel` and `.about-panel` override to `padding-top: 1.35rem; padding-bottom: 1.5rem` on desktop. `.profile` uses `padding: 1rem 0 0` (no bottom padding). No consistent rhythm.
- `.work-overlay` padding differs between mobile (`.8rem .9rem`), desktop (`1rem 1.25rem`), and the override for 900px+ (`1rem 1.25rem` — same as default, redundant override).
- Gap values are inconsistent: `.15rem`, `.2rem`, `.25rem`, `.35rem`, `.45rem`, `.5rem`, `.55rem`, `.6rem`, `.65rem`, `.7rem`, `.75rem`, `.85rem`, `.95rem`, `1rem`, `1.1rem`, `1.25rem`, `1.35rem`, `1.4rem`, `1.5rem`. There is no spacing scale.

### Typography problems

- **Two fonts are loaded (Inter + Space Grotesk) but used interchangeably.** Space Grotesk is the `--font-display` and is used for headings, tabs, brand name, and section labels. Inter is the body font. The distinction is subtle and not consistently applied — `.cover` uses `--font-display` but `.work-overlay span` (category labels) uses the inherited font (Inter, the body font). Some headings use `--font-display` explicitly, others inherit.
- **Heading sizes are not on a consistent scale.** h1 is `clamp(1.85rem, 4vw, 2.75rem)`, h2 varies between `clamp(1.35rem, 4vw, 2.15rem)` (work overlay), `clamp(1.45rem, 3vw, 2rem)` (section heading), and `1.45rem` (modal). h3 is `clamp(1.25rem, 2vw, 1.55rem)`. These scales don't relate to each other.
- **Line heights vary:** `1.05`, `1.08`, `1.1`, `1.2`, `1.35`, `1.5`. No consistent vertical rhythm.
- **Letter spacing varies:** `-.04em`, `-.035em`, `-.03em`, `0`, `.12em`, `.14em`. The negative tracking on headings is fine, but the positive tracking on labels (`.12em`, `.14em`) is aggressive and creates a "corporate" feel.

### Weak hierarchy

- The page has no clear visual priority between: the name, the cover, the tabs, the notice card, and the social links. They all compete for attention in the profile section.
- Project cards use the same aspect ratio and overlay pattern regardless of project importance.
- Service cards use the same visual pattern as the notice card (background color + icon + text).
- The About section's yellow background (`--yellow: #f8ea6f`) is the most visually aggressive element on the page. It draws the eye but contains secondary information.

### Excessive cards

The page is built around cards:
- Notice card (Ready for work)
- Work cards (5 projects)
- Service cards (4 services)
- About rows (Focus, Location, Skills)
- Footer groups (3 groups)
- Modal card (project details)

This is a card-heavy design. Nearly every piece of content is wrapped in a rounded rectangle with padding and background color.

### Poor proportions

- The avatar (`5.35rem` on desktop) is too large relative to its informational value. It takes up prime above-the-fold space and offers a lightbox interaction that doesn't serve the portfolio's purpose.
- The cover banner (`min-height: 14rem` on desktop) is large for two words.
- Service cards have `min-width: 22rem` on desktop, which forces a two-column layout that's wider than the content warrants.

### Unnecessary decoration

- The avatar lightbox functionality — clicking a profile photo to see it full-screen is not useful in a portfolio context.
- The `--yellow` background on the About section is decorative and doesn't serve hierarchy.
- The `filter: grayscale(100%)` on the avatar image is a stylistic choice that doesn't communicate anything.
- The brand mark ("G" in a rounded square) is repeated in the header and footer.

### Generic patterns

- The tab navigation pattern (Work / Services / About) is a SaaS dashboard pattern, not a portfolio pattern.
- The service card layout (icon + title + description + tags + CTA link) is a standard agency/SaaS pattern.
- The "Ready for work" notice card with a dark icon circle is a notification pattern.
- The footer with column groups is a generic website footer.
- Pill-shaped tags for technologies are a generic developer portfolio pattern.

### Inconsistent component styles

- Buttons: `.button` has `border-radius: 999px` (pill), but `.service-card` and `.work-card` have `border-radius: 0`. The `.notice-card` and `.about-row` have `border-radius: .85rem`. The `.modal` has `border-radius: .9rem`. These radii don't relate to each other.
- Background colors: `--white`, `--soft` (also white: `#ffffff`), `--yellow`, `--green`, `--ink`/`--black`/`--brown` (all the same: `#202124`). There are effectively three visual colors (white, dark, yellow) plus the green cover background. The naming is misleading (`--soft` is white, `--blue` and `--brown` are dark).

---

## 4. Technical Audit

### Duplicated / redundant styling

- `.work-overlay` padding is set in three places: default, `@media (max-width: 760px)`, and `@media (min-width: 900px)`. The 900px value (`1rem 1.25rem`) is the same as the default, making the override pointless.
- Color variables are misleadingly named: `--blue: #0e6241` (green, not blue), `--brown: #202124` (dark, not brown), `--black: #202124` (same as `--ink`). These are vestiges of a theme system that was simplified but not cleaned up.
- `--soft: #ffffff` and `--white: #ffffff` are identical. The distinction exists for potential theming but currently serves no purpose.
- The `.brand` and `.footer-brand` share styles but are separate selectors. They could be consolidated.
- The `.button-dark` background is set to `--yellow` in the default rules, then re-declared identically inside `@media (min-width: 761px)`. This is a leftover from a previous responsive behavior.

### Inconsistent styling approach

- Font sizes use a mix of `clamp()` (responsive), fixed `rem` values, and `em`. No consistent approach.
- Spacing uses raw `rem` values with no design-token system or spacing scale.
- Media query breakpoints are `760px` and `900px` — only two breakpoints, and the mobile breakpoint (760px) is lower than typical tablet widths.

### Unnecessary dependencies

- Font Awesome is loaded locally (`assets/fontawesome/`). This is a large library (CSS + multiple font files) for the ~15 icons actually used. It adds significant weight for what could be inline SVGs.
- Google Fonts loads two families (Inter + Space Grotesk) with multiple weights. If the design is simplified to one font, this cuts the external dependency.

### Poor responsive implementation

- The profile section stacks vertically on mobile without rethinking the layout. The cover, avatar, name, bio, buttons, notice card, social links, and tabs all stack, creating a long scroll before reaching content.
- The tab system on mobile shows horizontal scrolling (`overflow-x: auto`) but the tab labels are large enough that on small screens, all three may not fit, requiring the user to discover the scroll.
- The `.work-card` uses `aspect-ratio: 36 / 25` which is fine on desktop but creates tall cards on mobile, requiring more scrolling.

### Layout hacks / arbitrary positioning

- The avatar uses `margin-top: -2.1rem` (mobile) / `-2.4rem` (desktop) to overlap the cover banner. This is a visual effect that couples the avatar positioning to the cover height.
- `.profile-summary` uses `margin-left: auto` on desktop to push social links to the right. This is a flexbox trick that works but creates an asymmetric layout that's hard to reason about.

### Accessibility issues

- **`:focus` and `:focus-visible` have `outline: 0`** — focus indicators are removed globally. This is a significant accessibility problem.
- The avatar button has no visible focus indication beyond the removed outline.
- Work cards use `role="button"` and `tabindex="0"` which is correct, but with outlines removed, keyboard users cannot see which card is focused.
- The modal uses `<dialog>` which is good, but focus management (trapping focus inside the modal) relies on browser defaults which may not be sufficient.
- Color contrast: white text on the work overlay gradient may not meet WCAG AA at the edges of the gradient where the background image shows through.
- The "Ready for work" notice card uses `<strong>` for the title and `<span>` for the description — not a semantic heading.

### Architecture notes

- The site is a single HTML file with one CSS file and one JS file. This is appropriate for the scope and doesn't need restructuring.
- Project data lives in `script.js` as a hardcoded object. This is fine for 5 projects but would need restructuring if the project count grows.
- Vite is used as the dev server/build tool but the site has no build-step assets (no components, no preprocessing). Vite is essentially unused beyond `vite dev` and `vite build` (which just copies files).
- The tab system uses `hidden` attribute toggling, which is clean and accessible.
- No animations or motion libraries — this is good and should be preserved.
- No unnecessary JavaScript frameworks — pure vanilla JS. This is a strength.

---

## Summary of key findings

| Area | Core problem |
|------|-------------|
| Content | Generic copy hides strong projects. Real products are undersold. The AI/automation expertise is claimed but never demonstrated. |
| UX | Tab system fragments the narrative. Projects require clicks to reveal substance. Profile section is too tall. |
| Visual | Card-heavy uniformity. No typographic scale. No spacing scale. Everything has the same weight. |
| Technical | Color variables are misleading. Font Awesome is heavy for the usage. Focus styles are removed. CSS is mostly clean but has redundant overrides. |

The fundamental problem: **the portfolio looks like a template that was filled in, not a site designed around this person's specific work and positioning.** The substance (real products, technical range, AI knowledge) exists in the content but is not surfaced by the design.
