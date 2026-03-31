# Work Detail Specification

## Source
- Reference page: `https://www.offmenu.design/work/flex`
- Clone target: shared `/work/[slug]` template using Studio Finity CMS data

## Interaction Model
- Static editorial page with restrained motion
- Shared-element transition carries the homepage circle into the hero image
- Hero title fades/slides in after the image settles
- Related work tiles expand on hover

## Verified Layout Notes
- Hero image frame: `top 80`, `left 16`, `width 1480`, `height 707` at `1512x803`
- Hero title: `36px / 40px`, weight `500`, positioned near the bottom-left of the hero image
- Intro/details block begins around `~930px` from page top on the source page
- Intro label/details label: `14px / 20px`
- Intro paragraph: `30px / 37.5px`, width `644px`
- Details column width: `448px`
- Editorial body block after intro: `16px / 20px`, max width `768px`
- “Want to see more?” heading: `36px / 40px`
- CTA heading: `48px / 48px`
- Footer height is large and airy (`~449px`) with links sitting low in the frame

## Shared Structure
1. Slim work-page header
2. Hero image with bottom-left title
3. Intro/details two-column section
4. Compact scope list when the project has multiple service/category facets
5. One or two restrained editorial text callouts between media blocks
6. Full-width media figures
7. Two-up media row when assets exist
8. Related work strip
9. Large CTA
10. Large footer with simple nav row

## Clone Rules
- Prefer fewer sections over more sections; Off Menu case-study pages are sparse and deliberate
- Avoid generic “portfolio” chrome such as extra cards, framed credits blocks, or dense metadata panels
- Keep labels muted and small, body copy editorial, and large media uninterrupted
- Use CMS content pragmatically, but preserve the Off Menu rhythm even when the source content differs
