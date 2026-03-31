# Off Menu Homepage Layout Architecture

## Page Structure
1. Fixed header pinned to the top edge
2. Full-viewport hero section with centered orbit and overlay text
3. Minimal footer contact strip replacing the removed assistant area

## Hero Layout
- Full viewport section with absolute overlay layers
- Orbit container centered in the viewport
- Headline centered over the orbit
- Prev/next controls aligned horizontally at viewport center
- Active title anchored near the bottom center
- Pagination dots anchored bottom-right on desktop

## Responsive Notes
- Mobile keeps the same hero logic but scales orbit positions and bubble sizes up relative to the viewport
- Desktop uses wider spacing between orbit nodes and larger whitespace around the title
- Footer collapses from two-column to stacked on smaller widths
