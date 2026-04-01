<!-- AUTO-GENERATED from AGENTS.md — do not edit directly.
     Run `bash scripts/sync-agent-rules.sh` to regenerate. -->

---
description: Project conventions for AI Website Clone Template
alwaysApply: true
---
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Website Reverse-Engineer Template

## What This Is
A reusable template for reverse-engineering any website into a clean, modern Next.js codebase using AI coding agents. The Next.js + shadcn/ui + Tailwind v4 base is pre-scaffolded — just run `/clone-website <url1> [<url2> ...]`.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React (default — will be replaced/supplemented by extracted SVGs)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Vercel

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **No personal aesthetic changes during emulation phase** — match 1:1 first, customize later
- **Real content** — use actual text and assets from the target site, not placeholders
- **Beauty-first** — every pixel matters

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
- **Motion (CSS / global):** slower, calmer transitions sitewide. Hand-written CSS uses **`--sf-ease-out`** (`cubic-bezier(0.16, 1, 0.3, 1)` in `:root`). Tailwind should use **`ease-sf-out`** (in `@theme inline` as **`--ease-sf-out`** — keep identical to `--sf-ease-out`). Prefer duration tokens: **`--sf-duration-fast`**, **`--sf-duration-ui`**, **`--sf-duration-macro`**, **`--sf-duration-reveal`**, **`--sf-duration-card-hover`**. Prefer canonical classes like **`duration-280`**, **`duration-380`**, etc., over `duration-[280ms]`. Lenis (when enabled) uses gentler smoothing (**`lerp` ~0.06**, **`wheelMultiplier` ~0.88**), aligned with `WORK_CANVAS_LERP` / `WORK_CANVAS_WHEEL_MULT` for the work canvas. Avoid flashy or decorative motion.
- **Anti-patterns:** clutter, novelty for its own sake, heavy gradients, loud effects, chaotic layouts.

### Accessibility & inclusion
- Respect **`prefers-reduced-motion`:** key UI animations (contact drawer, GSAP `matchMedia` branches, etc.) degrade to instant or minimal motion — extend that pattern to new motion work.
- Preserve visible **focus** affordances (ring/outline tokens via design system).
- Prefer semantic HTML and labels in headers, nav, and controls; meaningful **alt** text (decorative marks may use empty `alt` when paired with visible text).

### Design principles
- Every page should feel calm, deliberate, and premium at first glance.
- Simplicity wins over density; remove anything that does not strengthen clarity or trust.
- Motion should feel smooth, restrained, and supportive, never flashy or distracting.
- Typography and spacing should do most of the branding work; use existing **`--sf-*`** and utility classes before introducing one-off values.
- Keep the site cohesive across home, work index, work detail, and about so it feels like one system.

### Open questions (confirm when you can)
- The repo implements **Geist + PP Neue Montreal**. Older docs sometimes mention **Open Sauce Sans** — if that is still the long-term brand font, plan a deliberate swap; otherwise treat Geist/PP as canonical.
- If you have a **target WCAG level** (e.g. AA) or specific audience needs (dyslexia-friendly settings, mandatory contrast checks), say so and this section can be tightened.

## GSAP & scroll-driven text
Prefer **GSAP 3** patterns that clean up correctly in React (scopes, `matchMedia`, font timing). Do not leave one-off `window.matchMedia` + `killTweensOf` only — use the shared utilities below for new work.

### Shared utilities
- **`src/lib/gsap-motion.ts`** — **`GSAP_MOTION.reduce`** / **`GSAP_MOTION.noPreference`** (canonical `prefers-reduced-motion` queries). **`fontsReadyPromise()`** — `document.fonts.ready` with safe catch; call before measurable text reveals, then optionally **`requestAnimationFrame`** before `fromTo` / timelines.
- **`src/lib/gsap-data-about-reveal.ts`** — **`mountDataAboutScrollReveals(root, pageReady)`** for **`[data-about-reveal]`**, **`[data-about-stagger]`**, **`[data-about-item]`**. Uses **`gsap.context(root)`** + **`gsap.matchMedia()`**, IntersectionObserver when off-screen, **`force3D`**, **`immediateRender: false`**, **`overwrite: "auto"`**, **`stagger: { each }`**, **`clearProps`** on completion. Used from **About** (`studio-finity-about.tsx`, includes Ground Rules under the same `<main>`) and **work detail** intro (`offmenu-work-detail.tsx`).

### Components
- **`AnimatedWords`** — word- or line-based reveals; **`useMemo`** for parsed lines/words; **`gsap.context`** + **`matchMedia`** for reduced motion; **`fontsReadyPromise`** + rAF before measuring. Used on cosmos home (section headings, CTA), about hero, work hero, work detail CTA, etc.
- **Cosmos `HeroHeadline`** — separate pattern: **`data-hero-intro-line`** / **`data-hero-word-inner`** under a scoped root ref; same **`GSAP_MOTION`** / **`fontsReadyPromise`** conventions; avoid Tailwind **`translate-y`** on elements that use **`clearProps: "transform"`** after tweens (fight with GSAP end state).

### Checklist for new GSAP text
1. Scope with **`gsap.context(() => { ... }, scopeElement)`** and **`return () => ctx.revert()`** from **`useLayoutEffect`**.
2. Branch motion with **`gsap.matchMedia()`** and **`GSAP_MOTION`** (not a one-time `matchMedia.matches` if behavior must track live OS toggles).
3. Wait **`fontsReadyPromise()`** (and often one rAF) before scroll/layout-sensitive reveals.
4. Tweens: **`force3D: true`** where useful, **`overwrite: "auto"`**, object-form **`stagger: { each }`** when staggering, **`clearProps`** when dropping inline transform/opacity after finish.
5. Target DOM via **data attributes** or scoped **`gsap.utils.toArray(sel, root)`** rather than fragile ref arrays when possible.

## Project Structure
```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons as React components
  lib/
    utils.ts                 # cn() utility (shadcn)
    gsap-motion.ts           # GSAP_MOTION queries, fontsReadyPromise()
    gsap-data-about-reveal.ts # mountDataAboutScrollReveals() for data-about-* blocks
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target site
  videos/           # Downloaded videos from target site
  seo/              # Favicons, OG images, webmanifest
docs/
  research/         # Inspection output (design tokens, components, layout)
  design-references/ # Screenshots and visual references
scripts/            # Asset download scripts
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate platform-specific instruction files.
- After editing `.claude/skills/clone-website/SKILL.md`, run `node scripts/sync-skills.mjs` to regenerate the skill for all platforms.

# Website Inspection Guide

## How to Reverse-Engineer Any Website

This guide outlines what to capture when inspecting a target website via Chrome MCP or browser DevTools.

## Phase 1: Visual Audit

### Screenshots to Capture
- [ ] Every distinct page — desktop, tablet, mobile
- [ ] Dark mode variants (if applicable)
- [ ] Light mode variants (if applicable)
- [ ] Key interaction states (hover, active, open menus, modals)
- [ ] Loading/skeleton states
- [ ] Empty states
- [ ] Error states

### Design Tokens to Extract
- [ ] **Colors** — background, text (primary/secondary/muted), accent, border, hover, error, success, warning
- [ ] **Typography** — font family, sizes (h1-h6, body, caption, label), weights, line heights, letter spacing
- [ ] **Spacing** — padding/margin patterns (look for a scale: 4px, 8px, 12px, 16px, 24px, 32px, etc.)
- [ ] **Border radius** — buttons, cards, avatars, inputs
- [ ] **Shadows/elevation** — card shadows, dropdown shadows, modal overlay
- [ ] **Breakpoints** — when does the layout shift? (inspect with DevTools responsive mode)
- [ ] **Icons** — which icon library? custom SVGs? sizes?
- [ ] **Avatars** — sizes, shapes, fallback behavior
- [ ] **Buttons** — all variants (primary, secondary, ghost, icon-only, danger)
- [ ] **Inputs** — text fields, textareas, selects, checkboxes, toggles

## Phase 2: Component Inventory

For each distinct UI component, document:
1. **Name** — what would you call this component?
2. **Structure** — what HTML elements / child components does it contain?
3. **Variants** — does it have different sizes, colors, or states?
4. **States** — default, hover, active, disabled, loading, error, empty
5. **Responsive behavior** — how does it change at different breakpoints?
6. **Interactions** — click, hover, focus, keyboard navigation
7. **Animations** — transitions, entrance/exit animations, micro-interactions

### Common Components to Look For
- Navigation (top bar, sidebar, bottom bar)
- Cards / list items
- Buttons and links
- Forms and inputs
- Modals and dialogs
- Dropdowns and menus
- Tabs and segmented controls
- Avatars and user badges
- Loading skeletons
- Toast notifications
- Tooltips and popovers

## Phase 3: Layout Architecture

- [ ] **Grid system** — CSS Grid? Flexbox? Fixed widths?
- [ ] **Column layout** — how many columns at each breakpoint?
- [ ] **Max-width** — main content area max-width
- [ ] **Sticky elements** — header, sidebar, floating buttons
- [ ] **Z-index layers** — navigation, modals, tooltips, overlays
- [ ] **Scroll behavior** — infinite scroll, pagination, virtual scrolling

## Phase 4: Technical Stack Analysis

- [ ] **Framework** — React? Vue? Angular? Check `__NEXT_DATA__`, `__NUXT__`, `ng-version`
- [ ] **CSS approach** — Tailwind (utility classes), CSS Modules, Styled Components, Emotion, vanilla CSS
- [ ] **State management** — Redux (check DevTools), React Query, Zustand, Pinia
- [ ] **API patterns** — REST, GraphQL (check network tab for `/graphql` requests)
- [ ] **Font loading** — Google Fonts, self-hosted, system fonts
- [ ] **Image strategy** — CDN, lazy loading, srcset, WebP/AVIF
- [ ] **Animation library** — Framer Motion, GSAP, CSS transitions only

## Phase 5: Documentation Output

After inspection, create these files in `docs/research/`:
1. `DESIGN_TOKENS.md` — All extracted colors, typography, spacing
2. `COMPONENT_INVENTORY.md` — Every component with structure notes
3. `LAYOUT_ARCHITECTURE.md` — Page layouts, grid system, responsive behavior
4. `INTERACTION_PATTERNS.md` — Animations, transitions, hover states
5. `TECH_STACK_ANALYSIS.md` — What the site uses and our chosen equivalents
