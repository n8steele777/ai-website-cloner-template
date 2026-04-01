# OH Architecture Nav Behaviors

## Captured
- Desktop header sits directly over the hero and reads as transparent.
- Desktop visual hierarchy is driven by a large left wordmark, not by a boxed navbar.
- The inline links are uppercase and separated by commas.
- The right-side CTA stays as a black rounded pill with white text.
- The source is a two-layer nav system, not a single fixed bar.
- The large hero header is `position: absolute` and scrolls away with the hero.
- A fixed top-right mini control stack reveals later on scroll, moving from roughly `46-50px` down to `0px` over the mid-hero scroll range.
- At phone width, the inline nav is removed and replaced by a `MENU` pill.
- The source site exposes a full-screen dark menu overlay when the menu is open on both desktop and mobile.
- The menu shell animates with a `clip-path` wipe from a collapsed top edge to the full viewport.

## Applied Assumptions For Studio Finity
- Overlay-led pages use the same two-layer handoff as the source so the large header scrolls away and the fixed mini controls appear later.
- Overlay routes keep light text so the nav still works over image-led heroes.
- Non-overlay routes use the same OH-inspired geometry with dark wordmark/link text for contrast on Studio Finity’s light surfaces.
- The fixed mini reveal range is matched proportionally to viewport height rather than hard-coded pixel thresholds so it behaves consistently across screen sizes.
