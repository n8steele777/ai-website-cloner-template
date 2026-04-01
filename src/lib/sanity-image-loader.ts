import type { ImageLoaderProps } from "next/image";

const SANITY_CDN_HOST = "cdn.sanity.io";

export function isSanityImageUrl(src: string): boolean {
  try {
    return new URL(src, "https://example.com").hostname === SANITY_CDN_HOST;
  } catch {
    return src.includes(SANITY_CDN_HOST);
  }
}

/**
 * Loads responsive widths straight from Sanity’s CDN (with `auto=format`).
 * Using this as `loader` skips Next’s image optimizer proxy for Sanity URLs,
 * which removes an extra hop and often improves TTFB for images.
 */
export function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  try {
    const url = new URL(src, "https://cdn.sanity.io");
    if (url.hostname !== SANITY_CDN_HOST) {
      return src;
    }
    const w = Math.min(Math.round(width), 4096);
    const q = quality ?? 80;
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    url.searchParams.set("q", String(q));
    url.searchParams.set("w", String(w));
    return url.toString();
  } catch {
    return src;
  }
}
