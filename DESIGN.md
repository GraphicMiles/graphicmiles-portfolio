# Design Direction — Phase 3

## Design concept: **"Evidence"**

The portfolio should function like a well-organized case file — not a gallery, not a landing page, not a template. Each section presents evidence of capability. The design serves the evidence, not the other way around.

**What it communicates:** This person has built real things, thinks about systems and products, and presents their work with the same clarity they bring to engineering.

**Why it fits:** Raji's strongest asset is that he ships real products (Nearspace, Legally Unbullied) and works across frontend, backend, and AI. Most junior portfolios show mockups and tutorials. The design should make this gap obvious by treating projects as first-class evidence, not gallery items.

**Visual principles:**
- Editorial structure — the page reads like a well-organized document, not a dashboard
- Typography creates hierarchy — not borders, cards, or color blocks
- Projects get spatial dominance — they are the reason anyone is here
- Restraint — every element earns its place
- White space is structural — it separates ideas, not just fills gaps

**What makes it different from a generic portfolio:**
- No tab system. Continuous narrative flow.
- No card gallery. Projects are presented as full-width editorial blocks with real context.
- No service listing. Capabilities are demonstrated through work, not listed separately.
- No "Ready for work" badge. Availability is communicated through contact placement.
- Typography does the work that decoration currently does.

---

## Color system

The palette is deliberately restrained. The site is mostly typographic — color is used sparingly for emphasis and interaction.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#fafaf9` | Page background. Off-white, not pure white. Slightly warmer, less clinical. |
| `--surface` | `#f3f3f1` | Subtle surface for tags, code references, secondary containers. |
| `--ink` | `#1a1a1a` | Primary text. Near-black but not pure black — easier on the eyes. |
| `--ink-secondary` | `#5a5a5a` | Secondary text, descriptions, metadata. |
| `--ink-muted` | `#8a8a8a` | Timestamps, labels, tertiary information. |
| `--accent` | `#1a6b4a` | Links, interactive elements, subtle emphasis. Muted green — connects to the existing brand without being aggressive. |
| `--divider` | `#e5e5e3` | Horizontal rules and subtle section separators. |
| `--ink-inverse` | `#fafaf9` | Light text on dark backgrounds (used only where a dark element exists). |

**What changed from the current site:**
- Removed `--yellow` (`#f8ea6f`) — it was the most visually aggressive element and drew attention to the About section, which is not the most important content.
- Removed `--green` (`#0e6241`) as a background color — it's preserved as `--accent` at a more muted value.
- Removed the misleading variable names (`--blue`, `--brown`, `--soft`).
- Added proper secondary/muted text colors instead of using the same dark color for everything.
- Background is off-white (`#fafaf9`) instead of pure white — easier to read, less harsh.

---

## Typography

One typeface. No display font. The design creates hierarchy through weight, size, and spacing — not through font switching.

**Typeface:** Inter (already loaded, excellent for screen reading, good weight range).

Remove Space Grotesk. The distinction between "display" and "body" font was subtle and inconsistently applied. One well-used typeface creates stronger identity than two underused ones.

### Type scale

| Role | Size | Weight | Line height | Letter spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| Display | `clamp(2.2rem, 5vw, 3.6rem)` | 700 | 1.05 | `-0.03em` | Opening headline only |
| H1 | `clamp(1.6rem, 3.5vw, 2.4rem)` | 600 | 1.1 | `-0.025em` | Section-level headings |
| H2 | `clamp(1.25rem, 2.5vw, 1.75rem)` | 600 | 1.15 | `-0.02em` | Project titles, subsection headings |
| H3 | `1.125rem` | 600 | 1.2 | `-0.01em` | Card titles, minor headings |
| Body | `1rem` (16px) | 400 | 1.6 | `0` | Paragraphs, descriptions |
| Body large | `1.125rem` | 400 | 1.55 | `0` | Introductory paragraphs, lead text |
| Small | `0.875rem` | 400 | 1.5 | `0` | Secondary text, descriptions |
| Metadata | `0.75rem` | 500 | 1.4 | `0.06em` | Category labels, dates, tags. Uppercase. |

**Rules:**
- `0.06em` letter spacing on metadata/caps only. No `0.12em` or `0.14em` — that was too wide.
- Negative tracking only on large headings. Body text stays at `0`.
- Line height decreases as font size increases (standard typographic practice).
- Maximum paragraph width: `65ch` for readability.

---

## Layout system

### Grid

- **Maximum content width:** `68rem` (1088px) — slightly narrower than the current `72rem`. Tighter content feels more deliberate.
- **Page gutter:** `clamp(1.25rem, 4vw, 2.5rem)` — more generous than the current `clamp(1rem, 3vw, 1.5rem)`.
- **Content column (text):** max `40rem` (640px) — comfortable reading width.
- **No 12-column grid.** The layout uses flexbox with deliberate widths rather than a grid framework.

### Section spacing

- **Between major sections:** `clamp(4rem, 10vw, 8rem)` — large vertical gaps that create clear separation. Much more generous than the current `1rem` gap.
- **Between subsections within a section:** `clamp(2rem, 5vw, 3.5rem)`.
- **Between elements within a subsection:** `0.75rem` to `1.5rem` depending on relationship.

### Project layout

- Projects are full-width blocks, not grid items.
- Each project block occupies its own section with generous vertical padding.
- Stronger projects get more vertical space (more context, more detail).
- On desktop, project content uses a two-column layout: image on one side, text on the other. The layout alternates (image left / image right) to create visual rhythm.
- On mobile, image stacks above text.

### Mobile behavior

- Single column throughout.
- Headlines scale down smoothly with `clamp()`.
- Project images remain full-width.
- Navigation simplifies to a minimal top bar with a menu toggle.
- Generous touch targets (minimum `44px`).
- Section spacing reduces but remains significant — the editorial feel should survive on mobile.

---

## Motion principles

Motion is minimal and functional. No decorative animation.

**Where motion occurs:**
1. **Hover on project images:** subtle scale (1.02) over 300ms with `ease-out`. Indicates interactivity.
2. **Hover on links:** color transition over 150ms with `ease`.
3. **Scroll-triggered fade-in:** elements fade in from `opacity: 0` to `opacity: 1` over 400ms with `ease-out`, with a slight `translateY(12px)` to `translateY(0)`. Used sparingly — only for section headings and project blocks entering the viewport. Not for every element.
4. **Page load:** the opening headline fades in over 600ms after a 100ms delay. No other load animation.

**`prefers-reduced-motion`:** All transitions and animations are disabled. Content appears immediately. This is non-negotiable.

**Easing:** `ease-out` for entrances, `ease` for state changes. No `ease-in` (feels sluggish), no spring/bounce (decorative).

**Duration range:** 150ms to 600ms. Nothing slower than 600ms.

---

## What this design is intentionally NOT doing

- **Not using a tab/navigation system to hide sections.** The page scrolls continuously. All content is accessible by scrolling.
- **Not using cards for everything.** Projects are editorial blocks. Services are eliminated as a separate section — capabilities are shown through work.
- **Not using the yellow background.** The `#f8ea6f` was the most visually dominant element and attracted attention to the wrong content.
- **Not using a large avatar/profile photo.** The photo is small and inline with the introduction, not a dominant visual element.
- **Not using Font Awesome.** Replacing with inline SVGs for the ~8 icons actually used. Reduces page weight significantly.
- **Not using pill-shaped tags everywhere.** Tags appear only where they serve comprehension (technology used on projects). They are styled as simple inline metadata, not badges.
- **Not using a "Ready for work" banner.** Availability is communicated by having contact links in logical places (opening section, project section, footer).
- **Not using modal dialogs for project details.** Project information is presented inline, in the page flow. No click-to-reveal pattern.
- **Not using the cover banner pattern.** The green banner with two labels is replaced by a strong opening statement.
- **Not using glassmorphism, gradients, blur, or decorative effects.** The site is typographic and spatial.
- **Not making every section look the same.** The opening, projects, about, and contact each have their own visual treatment appropriate to their content.

---

## How projects will be presented

Each project is a full-width section containing:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  CATEGORY LABEL          YEAR / STATUS              │
│                                                     │
│  Project Name                                      │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │            Project Screenshot                 │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Description paragraph. What it is, what was        │
│  built, why it exists. Specific, not generic.       │
│                                                     │
│  What I built:                                      │
│  • Specific technical contribution 1                │
│  • Specific technical contribution 2                │
│  • Specific technical contribution 3                │
│                                                     │
│  JavaScript · React · Firebase · AI/ML              │
│                                                     │
│  Live →    GitHub →                                 │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Order (by strength):**
1. Nearspace — real product, live deployment, strongest visual
2. Legally Unbullied — real product, AI-assisted, retrieval system
3. Mr Nobody — cross-platform concept, Android + web
4. The Touchline — editorial layout, content-heavy
5. Metrix — SaaS landing page, clean structure

**Nearspace and Legally Unbullied** get expanded treatment: longer descriptions, more detail about what was built, explicit mention of the technical decisions. The bottom three projects get standard treatment — still better than the current cards, but less expanded than the top two.

**Project descriptions are rewritten.** Current descriptions undersell the work. New descriptions should be specific about what was built and what's technically interesting.

---

## Proposed page structure

```
1. NAVIGATION
   Minimal. Name on the left, links on the right (Work, About, Contact).
   No "Hire me" button in the nav. Contact is obvious from the page flow.

2. OPENING
   Name. One strong sentence about what this person builds.
   Brief paragraph expanding on the positioning.
   Small inline links: GitHub · Email
   
3. SELECTED WORK (the center of the portfolio)
   Section heading: "Selected work"
   Each project as its own full-width block (see layout above).
   5 projects, top 2 expanded.

4. ABOUT / APPROACH
   Not a tab. A natural section that follows the work.
   A short, specific paragraph about how Raji thinks and works.
   Key facts as a simple list: Location, Focus, Technologies.
   No card layout. Simple text with clear hierarchy.

5. CONTACT
   Simple closing section.
   A direct statement about availability.
   Email link. GitHub link.
   No giant CTA button.

6. FOOTER
   Minimal. Name, year, email. That's it.
   No repeated navigation. No repeated project links.
```

---

## Why this direction fits

1. **The work is strong enough to carry the page.** Nearspace and Legally Unbullied are real products. The design gives them room to breathe and be understood, rather than compressing them into thumbnail cards.

2. **The positioning ("builds software, experiments with AI, ships products") requires narrative, not a grid.** A tabbed card layout communicates "template." An editorial flow communicates "person with a story."

3. **The technical range (frontend + backend + AI + mobile) is best shown through project context, not skill tags.** When a project description says "connected a React frontend to a FastAPI retrieval pipeline," the reader understands the range without needing a tag cloud.

4. **The portfolio currently looks like every other AI-adjacent developer portfolio.** The yellow accent, pill buttons, card grid, and service listing are patterns from template-based portfolios. The "Evidence" direction breaks from this by treating the portfolio as a document, not an app.

5. **Restraint communicates confidence.** A portfolio that doesn't try to impress with effects signals that the work speaks for itself. This is more convincing than a portfolio that tries to look impressive.
