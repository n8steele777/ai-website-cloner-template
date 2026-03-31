# Off Menu Homepage Behaviors

## Confirmed Homepage Flow
- The homepage uses a sticky `1000vh` scroll track with a single pinned hero section.
- From `0` to roughly `20%` scroll progress, the orbit completes one full rotation while the 3D tilt relaxes to flat.
- At `20%` scroll progress, the large zoom phase begins and the bottom case-study overlay fades in.
- On the live site at `1512x878`, the post-threshold zoom is already assertive:
  around `22%` progress the dominant bubble is roughly `135px`,
  around `34%` it is roughly `202px`,
  around `58%` it is roughly `333px`,
  and around `82%` it is roughly `419px`.
- The center headline is only visible in the early phase and is animated off once scroll passes roughly `15%`.
- After the zoom threshold, active case studies advance through scroll slots while the circle field remains strictly scroll-driven.
- The homepage hero should not use hysteresis once the intro settles; the same scroll position should resolve to the same orbit state whether scrolling down or back up.
- When measured against the pinned hero track itself rather than the full page height, the active title follows the dominant enlarged bubble through the zoom phase, including the final hero state.
- After the intro settles (`~2s` at `1512x803`), the live orbit positions are approximately:
  `Resonant 414.8,241.2`, `Control Tower 518.0,486.4`, `Ditto 705.9,628.0`, `Hanover Park 889.7,604.4`, `Super 961.8,429.4`, `Tenacity 879.9,205.6`, `Utility 692.0,64.0`, `Flex 508.2,87.6`.
- At the bottom of the pinned hero track (`1512x803`), the dominant bubble is the final case and the visible title matches it.

## Case-Study Overlay
- The overlay is hidden at first paint.
- Previous/next arrow controls and the stacked case-study title rail fade in together once progress crosses the `0.2` threshold.
- Title changes are directional: the incoming title enters from above or below depending on scroll direction, and the previous title exits the opposite way.
- The bottom title is presentation-only on the source site; the main entry point is clicking a circle.

## Circle Click Transition
- Each circle is a real `/work/*` link with a custom intercepted transition.
- Clicking a circle fades the source bubble out immediately, then expands it in two steps:
- Step 1: bubble grows toward a centered rounded rectangle over `0.5s`.
- Step 2: it expands to the work-page hero frame over `0.6s`.
- The live handoff reaches the full-frame hero bounds before the route flips; at `1512x878` the carried image is effectively in hero position by `~1000ms` and the route changes shortly after, around `~1250ms`.

## Other Notes
- Theme can switch between light and dark.
- Header exposes a collapsible navigation menu with a simple background expansion behind the toggle shell rather than a heavy floating card.
- Resource links open externally.
- The assistant/chat area is intentionally removed in this clone.
