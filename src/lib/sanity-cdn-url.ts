/**
 * Canonical Sanity Image CDN query params (see https://www.sanity.io/docs/apis-and-sdks/image-urls).
 * Clears existing search params so URLs stay cache-friendly and consistent.
 */
export function buildSanityCdnImageUrl(
  href: string,
  options: { w: number; q?: number },
): string {
  const url = new URL(href);
  url.search = "";
  const q = options.q ?? 82;
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  url.searchParams.set("w", String(Math.round(options.w)));
  url.searchParams.set("q", String(q));
  return url.toString();
}

/** Canvas hero spiral: large enough for dpr 2 + burst scale without browser upscale blur. */
export const COSMOS_HERO_SPIRAL_CDN_WIDTH = 384;
