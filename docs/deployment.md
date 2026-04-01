# Deployment (Vercel)

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Strongly recommended in production | Canonical URL (e.g. `https://www.studiofinity.com`). Used for `metadataBase`, sitemap, and robots. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | **Required on Vercel** (`VERCEL=1`) | Sanity project ID. |
| `NEXT_PUBLIC_SANITY_DATASET` | **Required on Vercel** (`VERCEL=1`) | Sanity dataset (e.g. `production`). |
| `NEXT_PUBLIC_SANITY_USE_CDN` | Optional | Set to `"true"` to read from Sanity CDN (default is `false` / API). |

Local dev and CI builds without `VERCEL=1` may omit these and use template fallbacks. **Vercel production/preview** must set both, or the build will fail.

## SEO

- Dynamic Open Graph / Twitter images: `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`
- `robots.txt`: `src/app/robots.ts`
- `sitemap.xml`: `src/app/sitemap.ts`

## Build

```bash
npm run check
```

Vercel runs `next build` automatically; ensure the Sanity env vars above are set on the project.
