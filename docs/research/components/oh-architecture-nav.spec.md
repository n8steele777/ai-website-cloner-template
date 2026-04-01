# OH Architecture Nav Specification

## Overview
- **Target file:** `src/components/studio-finity-header.tsx`
- **Source page:** `https://www.oharchitecture.com.au/`
- **Reference screenshots:** `docs/design-references/oharchitecture.com.au/nav-desktop-top.png`, `docs/design-references/oharchitecture.com.au/nav-mobile-top.png`
- **Interaction model:** static desktop header + mobile menu overlay

## DOM Structure
- Desktop uses a full-width top bar with three visual zones:
  - left: oversized wordmark
  - center: uppercase inline navigation with commas between items
  - right: black pill CTA
- Mobile collapses to:
  - left: smaller wordmark
  - right: rounded `MENU` pill
- Mobile menu opens a full-screen dark overlay with the wordmark, a close affordance, vertical nav links, and a CTA.

## Computed Styles

### Desktop wrapper
- position: `absolute`
- top: `0px`
- width: `1200px`
- height: `78px`
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

### Mobile collapsed state
- **Trigger:** viewport around `390px`
- **State:** inline links disappear, compact `MENU` pill appears, CTA is removed from the top row

### Menu overlay
- **Trigger:** click `MENU`
- **State:** full-screen black overlay above page content with white text and a close action
- **Implementation approach:** client-side state toggle with scroll lock

## Text Content
- Desktop links on source: `Works`, `Studio`, `Process`, `Gallery`
- CTA on source: `Get in touch`

## Assets
- Font: `src/app/fonts/PPNeueMontreal-Variable.woff2`

## Responsive Behavior
- **Desktop:** oversized left wordmark, centered inline nav, right CTA
- **Mobile:** wordmark shrinks, links collapse into overlay menu
- **Observed breakpoint:** link row is hidden by the smallest phone width (`390px`)
