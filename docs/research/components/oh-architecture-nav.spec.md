# OH Architecture Nav Specification

## Overview
- **Target file:** `src/components/studio-finity-header.tsx`
- **Source page:** `https://www.oharchitecture.com.au/`
- **Reference screenshots:** `docs/design-references/oharchitecture.com.au/nav-desktop-top.png`, `docs/design-references/oharchitecture.com.au/nav-mobile-top.png`
- **Interaction model:** hero header that scrolls away, fixed mini controls that reveal on scroll, full-screen menu overlay

## DOM Structure
- Desktop uses a full-width hero header with three visual zones:
  - left: oversized wordmark
  - center: uppercase inline navigation with commas between items
  - right: black pill CTA
- A second fixed layer sits at the top right and remains hidden near the top of the hero:
  - black CTA pill
  - light `MENU` pill
  - both slide upward into place as the page scrolls past the hero
- Mobile collapses to:
  - left: smaller wordmark
  - right: rounded `MENU` pill
- Mobile also uses a two-step handoff:
  - hero-row `MENU` pill while the header is at the top
  - fixed top-right `MENU` pill that slides into place later on scroll
- Menu opens a full-screen dark overlay with the wordmark, a close affordance, vertical nav links, and a CTA.

## Computed Styles

### Desktop wrapper
- position: `absolute`
- top: `0px`
- width: `1440px`
- height: `83px`
- padding-inline: `21.704px`
- z-index: `999`
- background: `transparent`

### Desktop inner container
- margin-top: `22px`
- width: `1157px`
- height: `57px`
- display: `grid`
- align-items: `center`
- border-radius: `32px`
- gap: `16px`

### Wordmark
- text: `OH Architecture`
- font-family: `"Ppneuemontreal Variable", Arial, sans-serif`
- font-size: `53.84px`
- line-height: `56.532px`
- font-weight: `400`
- letter-spacing: `-1.6152px`
- color: `rgb(252, 252, 252)`
- bounding box: `365 x 57`

### Desktop links
- container width: `375px`
- link font-family: `"Ppneuemontreal Variable", Arial, sans-serif`
- link font-size: `14px`
- line-height: `14px`
- font-weight: `600`
- letter-spacing: `-0.14px`
- text-transform: `uppercase`
- link color: `rgb(252, 252, 252)`
- vertical padding per link: `2px`

### CTA button
- background: `rgb(8, 8, 7)`
- text color: `rgb(252, 252, 252)`
- padding: `16px 20px`
- border-radius: `1200px`
- gap: `16px`
- height: `49px`
- width: `159px`

### Mobile wordmark
- font-size: `24.692px`
- line-height: `25.9266px`
- letter-spacing: `-0.74076px`
- color: `rgb(252, 252, 252)`

### Mobile menu pill
- background: `rgb(242, 240, 235)`
- color: `rgb(8, 8, 7)`
- padding-inline: `12px`
- height: `48px`
- border-radius: `390px`

## States & Behaviors

### Desktop default
- **Trigger:** page load at top of hero
- **State:** transparent header over media, white wordmark, white nav links, black CTA

### Desktop scroll handoff
- **Trigger:** while scrolling through the first viewport
- **Source thresholds:** fixed mini controls remain mostly hidden until roughly `0.46 * viewport height` and reach their resting position around `0.87 * viewport height`
- **State change:** hero header scrolls away with the document, while a fixed top-right CTA plus `MENU` control animates upward from about `46-50px` translateY to `0px`
- **Implementation approach:** a small global scroll script updates CSS custom properties, and the mini controls derive `opacity`, `translateY`, and `pointer-events` from those variables

### Mobile collapsed state
- **Trigger:** viewport around `390px`
- **State:** inline links disappear, compact `MENU` pill appears, CTA is removed from the top row

### Mobile scroll handoff
- **Trigger:** same hero scroll range as desktop
- **State change:** the top-row `MENU` pill scrolls away with the hero, then a fixed top-right `MENU` pill animates upward into place

### Menu overlay
- **Trigger:** click `MENU`
- **State:** full-screen black overlay above page content with white text and a close action
- **Source animation:** `clip-path` expands from `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)` to `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`
- **Implementation approach:** client-side state toggle with scroll lock, animated `clip-path`, and a slight vertical fade-in on overlay content

## Text Content
- Desktop links on source: `Works`, `Studio`, `Process`, `Gallery`
- CTA on source: `Get in touch`

## Assets
- Font: `src/app/fonts/PPNeueMontreal-Variable.woff2`

## Responsive Behavior
- **Desktop:** oversized left wordmark, centered inline nav, right CTA, then a separate fixed mini control row appears after scrolling
- **Mobile:** wordmark shrinks, links collapse into overlay menu, and the fixed `MENU` pill reveals later on scroll
- **Observed breakpoint:** link row is hidden by the smallest phone width (`390px`)
