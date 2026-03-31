# Off Menu Homepage Interaction Patterns

## Theme Toggle
- Click-driven
- Toggles `.dark` on the root element
- Swaps background, foreground, border tokens, and case-study thumbnails

## Navigation Menu
- Click-driven
- Dot-grid button expands and collapses a floating panel
- `Escape` closes the menu

## Hero Orbit
- Scroll-driven sticky hero
- Full orbit rotation happens before the zoom phase
- Rotation threshold: `0.0 -> 0.2` progress
- Zoom threshold: binary toggle at `0.2` progress with a `1.5s` eased zoom tween
- Headline visibility threshold: visible below `0.15`, animated out above it
- Focused sphere is quantized to the nearest scroll slot after the zoom threshold
- Orbit spheres keep moving and remain clickable during scroll; hover only adds scale emphasis

## Title Rail
- Entire overlay fades in only once progress reaches `0.2`
- Active title is stacked in the same spatial slot as all other titles
- Incoming title enters from `110%` above or below depending on scroll direction
- Outgoing title exits in the opposite direction over a shorter duration
- Inactive titles are parked at `-110%` or `110%`

## Circle Transition
- Clicking a circle prevents the default link navigation
- The clicked bubble is hidden immediately
- Transition overlay expands in two phases:
- Phase 1: source circle -> centered rounded rectangle
- Phase 2: rounded rectangle -> work hero frame
- Navigation happens after the expansion completes, not midway through it

## Mount Animation
- Headline words reveal upward in a stagger with an initial delay around `0.5s`
- Intro orbit offset animates over roughly `3s`
- Overlay controls stay hidden until the scroll threshold is reached
