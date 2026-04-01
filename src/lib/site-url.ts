/**
 * Canonical site origin for metadata, sitemap, and robots.
 * Vercel: set NEXT_PUBLIC_SITE_URL to the production domain (e.g. https://example.com).
 */
export function getSiteUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

  return candidate.startsWith("http") ? candidate : `https://${candidate}`;
}
