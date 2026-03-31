## Cosmos Homepage Spec

### Clone Target

- `https://www.cosmos.so/`

### Adaptation Rules

- Keep the homepage body visually close to Cosmos.
- Adapt header labels and CTA destinations to Studio Finity.
- Route `Work` to `/work`.
- Route primary contact CTA to the current project email target.

### Foundation

- Use local `Cosmos Oracle` fonts from `public/fonts/cosmos/`
- Keep a clean light background and dark text
- Use restrained borders and no heavy glass effects on the homepage shell

### Required Sections

1. Sticky header with left nav, center search shell, and right CTA group
2. Hero collage with large centered heading and two CTAs
3. Sticky film handoff section
4. Search worlds section
5. Search filters section
6. Attribution / story section
7. Creative teams section with logo wall and image grid
8. Final CTA
9. Footer

### Studio Finity Nav Mapping

- Left nav should surface `Work` and `About`
- Right actions should become Studio Finity-safe actions instead of auth
- Header/search shell visual proportions should stay close to the source

### Verified Hero Code Notes

- Desktop header outer height: `105px`
- Header control height: `54px`
- Horizontal nav padding: `32px`
- Desktop header shell is a lightweight sticky row, not a boxed glass card
- Search shell uses a real rounded input pattern with icon triggers and `Search Cosmos...`
- Hero section is full-viewport and sticky with a negative top offset matching header height
- Verified shipped `h1` classes:
  `text-pretty text-center font-[350] text-[74px] text-primary leading-none tracking-[-3.7px]`
- Verified hero stack includes the small Cosmos wordmark SVG above the `h1`
- Verified live hero payload includes a `spiralImageUrls` array with 60 source images, not a tiny repeated set
- Desktop hero buttons use `h-14 px-6 py-4`
- Mobile hero collapses to a single primary CTA
- Hero collage behaves like a radial / spiral field of reference cards around the centered headline
- Hero whirl fades as the film section takes over rather than staying fully visible through the whole first scroll
- Verified film handoff uses a dedicated sticky section, not a simple divider row
- Verified film wrapper classes:
  `relative h-[130dvh] -translate-y-24`
  with sticky child:
  `pointer-events-none sticky top-[calc(var(--layout-header-outer-height)+38px)] -mb-[calc(var(--layout-header-outer-height)+96px)] flex h-dvh flex-col items-center justify-start`
- Verified film video source:
  `https://cdn.sanity.io/files/ca81n2nu/production/a6cc82d75d824ae49ad989e7d18d3d3ec06ab431.mp4`
- Verified desktop film video rect grows from `600x450` at page top to about `866.66x649.99` by the end of the sticky handoff
- Verified whirl draw transform uses the raw tangent angle with no extra rotation damping:
  `setTransform(cos(angle) * attenuation * scaleX, sin(angle) * attenuation * scaleY, -sin(angle) * attenuation * scaleX, cos(angle) * attenuation * scaleY, drawX, drawY)`
- Verified scroll speed boost is direct from current scroll velocity:
  `baseVelocity + baseVelocity * (abs(scrollVelocity) / 1000) * scrollBoost`
