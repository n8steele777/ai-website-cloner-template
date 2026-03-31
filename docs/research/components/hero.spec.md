# Hero Specification

## Overview
- Target area: full-screen homepage hero
- Interaction model: scroll-driven pinned hero with circle-click transition into work pages

## Structure
- Centered multiline headline
- Orbit of eight circular case-study thumbnails
- Previous/next controls
- Active case-study title at the bottom center
- Desktop pagination dots at the bottom right

## Styles
- Background follows current theme token
- Orbit bubbles are circular, image-filled, and lightly ringed
- Active bubble scales up and casts a deeper shadow
- Title uses large medium-weight typography with tight tracking

## Behaviors
- Headline words animate upward on mount
- Orbit bubbles fade and scale in on mount
- From `0` to roughly `20%` scroll progress, the orbit completes one full rotation while the tilt relaxes to flat
- After `20%`, the hero enters a zoom phase immediately; the dominant bubble should already be visibly larger by `~22%` progress rather than easing in too late
- Reverse scroll must be deterministic: the same scroll position should produce the same bubble layout in both directions
- Prev/next buttons scroll the track to the relevant case-study slot
- Bubble click starts the shared transition into the work page
- The circle-to-work transition should hold the full-frame hero state briefly before route navigation instead of pushing the route mid-morph
- Active title animates directionally from the bottom only after the zoom phase begins
- Theme switch swaps light/dark thumbnails

## Responsive
- Orbit positions and scale are adjusted for mobile
- Controls remain centered vertically
- Title remains bottom-centered across breakpoints
