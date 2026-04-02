export { imageLoader } from "next-sanity/image";

const SANITY_CDN_HOST = "cdn.sanity.io";

export function isSanityImageUrl(src: string): boolean {
  try {
    return new URL(src, "https://example.com").hostname === SANITY_CDN_HOST;
  } catch {
    return src.includes(SANITY_CDN_HOST);
  }
}
