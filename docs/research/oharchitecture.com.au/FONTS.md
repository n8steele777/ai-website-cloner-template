# OH Architecture Font Research

Date inspected: 2026-04-01
Target: https://www.oharchitecture.com.au/

## Live site findings

- The site defines a single custom `@font-face`:
  - `font-family: "Ppneuemontreal Variable"`
  - `src: https://cdn.prod.website-files.com/6762bbe3294789635ee71fdb/676e04eee8e86cced1fcdb27_PPNeueMontreal-Variable.woff2`
  - `font-weight: 200 800`
  - `font-style: normal`
  - `font-display: swap`
- Global font token:
  - `--font--primary-family:"Ppneuemontreal Variable",Arial,sans-serif`
- Body, display, heading, large, main, and small text tokens all point back to `--font--primary-family`.

## Weight usage observed in CSS

- `font-variation-settings:"wght" 530`
  - Used across body copy and most headline utility classes.
- `font-variation-settings:"wght" 650`
  - Used for emphasized headings, labels, uppercase UI text, and stronger callouts.
- `font-variation-settings:"wght" 300`
  - Used sparingly for a lighter decorative plus mark.

## Can we copy it?

- We can copy the visual choice and configure the same family in our clone.
- We should not reuse or ship OH Architecture's hosted font file directly unless we hold the right Pangram Pangram license for our own domain/app.
- Pangram Pangram's EULA says website embedding requires a Web License for each domain or subdomain, and it prohibits distributing the font to unauthorized third parties.

## Recommended implementation path

- If exact fidelity matters:
  - Buy a proper `PP Neue Montreal` web license and self-host it in our app with `next/font/local`.
- If we only need the look and not the exact licensed asset:
  - Use a close substitute and tune tracking/weights to match.

## Current app font setup

- Global UI/body/display font: `Geist Sans`
- Monospace font: `Geist Mono`
- Accent display font: `Geist Pixel Square`
- Package source: `geist@1.7.0`

## Why this setup

- `Geist Sans` gives us a crisp modern grotesk across the whole app.
- `Geist Mono` provides a consistent mono token for code, metadata, and precision UI.
- `Geist Pixel Square` is available from the same package and is exposed as an accent utility for branded or display moments.
- The package is published under the SIL Open Font License and self-hosts through the Next font pipeline used by the package.

## Local evidence

- Homepage HTML: `/Users/n8steele/Desktop/GitHub/off-menu-test/docs/research/oharchitecture.com.au/`
- Downloaded stylesheet:
  - `/Users/n8steele/Desktop/GitHub/off-menu-test/docs/research/oharchitecture.com.au/oharch.webflow.shared.css`
