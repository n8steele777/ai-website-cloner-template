# Deployment (Vercel)

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Strongly recommended in production | Canonical URL (e.g. `https://www.studiofinity.com`). Used for `metadataBase`, sitemap, and robots. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | **Required on Vercel** (`VERCEL=1`) | Sanity project ID. |
| `NEXT_PUBLIC_SANITY_DATASET` | **Required on Vercel** (`VERCEL=1`) | Sanity dataset (e.g. `production`). |
| `NEXT_PUBLIC_SANITY_USE_CDN` | Optional | Set to `"true"` to read from Sanity CDN (default is `false` / API). |
| `RESEND_API_KEY` | Required for contact form | Resend API key ([Resend + Next.js](https://resend.com/docs/send-with-nextjs)). |
| `CONTACT_FROM_EMAIL` | Required for contact form | Sender on your verified domain (e.g. `Studio Finity <hello@message.studio-finity.com>`). |
| `CONTACT_TO_EMAIL` | Optional | Inbox for inquiries (defaults to `hello@studio-finity.com`). |
| `UPSTASH_REDIS_REST_URL` | Recommended | Upstash Redis REST URL for cross-region contact rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Upstash Redis REST token. |

Local dev and CI builds without `VERCEL=1` may omit Sanity vars and use template fallbacks. **Vercel production/preview** must set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`, or the build will fail.

## Pre-deploy verification (Vercel dashboard)

Use this before pointing DNS or announcing launch:

- [ ] **Production** → Settings → Environment Variables: `NEXT_PUBLIC_SITE_URL` matches your canonical domain (include `https://`, choose www or apex consistently).
- [ ] Sanity `NEXT_PUBLIC_SANITY_*` set for **Production** (and **Preview** if previews should use real content).
- [ ] Contact: `RESEND_API_KEY` + `CONTACT_FROM_EMAIL` set for Production; send a test from the live form.
- [ ] Rate limiting: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set so limits work across all serverless instances.
- [ ] Run `npm run check` locally after pulling env-sensitive changes.
- [ ] Open a Preview deployment and spot-check `/`, `/work`, `/about`, one `/work/[slug]`, and `robots.txt` / `sitemap.xml`.

## SEO and social metadata

- **Default** Open Graph and Twitter cards: `metadata` in [`src/app/layout.tsx`](../src/app/layout.tsx) (static share image under `/logos/`).
- **Case studies**: [`src/app/work/[slug]/page.tsx`](../src/app/work/[slug]/page.tsx) sets page title, description, and per-project OG/Twitter images from the Sanity hero image (falls back to the site default image when needed).
- **Analytics**: Vercel Web Analytics and Speed Insights in the root layout (see [`src/app/layout.tsx`](../src/app/layout.tsx)); CSP in [`next.config.ts`](../next.config.ts) allows their endpoints.
- `robots.txt`: [`src/app/robots.ts`](../src/app/robots.ts)
- `sitemap.xml`: [`src/app/sitemap.ts`](../src/app/sitemap.ts)

## Build

```bash
npm run check
```

Vercel runs `next build` automatically; ensure the Sanity env vars above are set on the project.
