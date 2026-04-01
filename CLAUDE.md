@AGENTS.md

## Design Context

### Users

- Primary audience: founders and brands hiring Studio Finity.
- Main job to be done: quickly understand the studio's taste, capability, and level of execution, then feel confident enough to reach out.
- User context: evaluating creative partners, often comparing multiple studios, so clarity, trust, and visual polish matter immediately.

### Brand Personality

- 3-word personality: minimal, clean, elevated.
- Emotional goal: confidence first, with a sense of restraint and taste rather than hype.
- Tone: design-literate, precise, and premium without feeling loud or overdesigned.

### Aesthetic Direction

- Visual direction: simple, minimal, editorial, and refined.
- Reference feel: Notion-, Apple-, and Cosmos-style restraint (clear hierarchy, quiet surfaces, intentional whitespace).
- **Theme:** light-first marketing site — near-white base (`#fcfcfd`), near-black text (`#111111`), quiet neutrals via semantic tokens (`--sf-*` in `globals.css`), inverse tokens for occasional dark surfaces.
- **Typography (as implemented in repo):**
  - **Body, display, and headings:** Geist Sans (`next/font` + `--font-body` / `--font-display`).
  - **Mono:** Geist Mono for code-like or technical UI where used.
  - **Nav / wordmark / uppercase UI:** PP Neue Montreal Variable (local WOFF2, `--font-oh-nav` / `.font-oh-nav`, `.sf-oh-*`).
  - Display rhythm: tight display line-heights, negative letter-spacing on large type, balanced wrapping — follow existing `.sf-display-*` and `.sf-editorial-*` patterns rather than inventing new scales.
- **Motion:** slower, calmer transitions sitewide. Hand-written CSS uses **`--sf-ease-out`** (`cubic-bezier(0.16, 1, 0.3, 1)` in `:root`). Tailwind classes should use the theme utility **`ease-sf-out`** (defined in `@theme inline` as **`--ease-sf-out`** — keep that curve identical to `--sf-ease-out`). Prefer duration tokens: **`--sf-duration-fast`**, **`--sf-duration-ui`**, **`--sf-duration-macro`**, **`--sf-duration-reveal`**, **`--sf-duration-card-hover`**. For transition length in utilities, prefer canonical classes like **`duration-280`**, **`duration-380`**, etc., over `duration-[280ms]`. Lenis (when enabled) uses gentler smoothing (**`lerp` ~0.06**, **`wheelMultiplier` ~0.88**), aligned with `WORK_CANVAS_LERP` / `WORK_CANVAS_WHEEL_MULT` for the work canvas. Avoid flashy or decorative motion.
- **Anti-patterns:** clutter, novelty for its own sake, heavy gradients, loud effects, chaotic layouts.

### Accessibility & Inclusion

- Respect **`prefers-reduced-motion`:** key UI animations (e.g. contact drawer) degrade to instant or minimal motion — extend that pattern to new motion work.
- Preserve visible **focus** affordances (ring/outline tokens via design system).
- Prefer semantic HTML and labels already used in headers, nav, and interactive controls; keep alt text meaningful (decorative marks may use empty `alt` when paired with visible text).

### Design Principles

- Every page should feel calm, deliberate, and premium at first glance.
- Simplicity wins over density; remove anything that does not strengthen clarity or trust.
- Motion should feel smooth, restrained, and supportive, never flashy or distracting.
- Typography and spacing should do most of the branding work; use existing `--sf-*` and utility classes before introducing one-off values.
- Keep the site cohesive across home, work index, work detail, and about so it feels like one system.

### Open questions (confirm when you can)

The repo implements **Geist + PP Neue Montreal**. Older docs sometimes mention **Open Sauce Sans** — if that is still the long-term brand font, plan a deliberate swap; otherwise treat Geist/PP as canonical. If you have a **target WCAG conformance level** (e.g. AA) or specific audience needs (dyslexia-friendly settings, mandatory contrast checks), say so and this section can be tightened further.
