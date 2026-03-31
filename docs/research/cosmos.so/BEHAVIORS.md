## Cosmos Homepage Behaviors

- Source: `https://www.cosmos.so/`
- Verified on March 31, 2026 at desktop `1440x1600` and mobile `390x1200`

### Global

- Header is `position: sticky` at the top of the viewport with a transparent background.
- The page uses `cosmosOracle` for primary typography.
- The page is light-only on the homepage reference state we inspected.

### Header

- Left side contains a compact brand mark plus two small navigation links.
- Center contains a pill-like search shell.
- Right side contains compact auth/action links.
- Mobile collapses the nav into a menu button while preserving the same lightweight chrome.

### Hero

- Large image collage sits behind and around the hero heading.
- Primary heading is centered in the hero and set in large display type.
- Two CTAs sit directly beneath the heading.
- The hero collage is canvas-driven and rotates continuously with extra speed on scroll.
- The collage fades out as the film section takes over.
- The next section is a sticky film handoff, not a static divider row.
- The film label starts near the bottom of the hero, then fades out while the film video scales from a centered `600x450` card to an `866.66x649.99` frame.
- The sticky film wrapper pins at `top: calc(header height + 38px)` and uses a `-96px` upward shift via `-translate-y-24`.

### Content Rhythm

- Homepage is built from large editorial sections with generous vertical spacing.
- Display headings stay left-aligned and oversized.
- Supporting content alternates between wide image bands, filter demos, attribution copy, and logo walls.

### Footer CTA

- Final CTA section uses a large display heading plus two horizontal actions.
- Footer itself is minimal and link-driven.

### Extracted Metrics

- `h1`: `74px`, weight `350`, line-height `74px`, letter-spacing `-3.7px`
- `h2`: `66px`, weight `400`, line-height `71.28px`, letter-spacing `-2.64px`
- Header computed font family: `cosmosOracle, "cosmosOracle Fallback"`

### Extracted Assets

- Local fonts downloaded to `public/fonts/cosmos/`
- Logo asset downloaded to `public/cosmos-icon-light.svg`
- Homepage media primarily served from `https://cdn.sanity.io/images/ca81n2nu/production/`
- Homepage hero film video served from `https://cdn.sanity.io/files/ca81n2nu/production/a6cc82d75d824ae49ad989e7d18d3d3ec06ab431.mp4`
