import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Max submissions per IP per window (contact form). */
const LIMIT = 5;
/** Sliding window duration (aligned with Upstash limiter string). */
const WINDOW_MS = 15 * 60 * 1000;

const CONTACT_RATE_PREFIX = "contact:ip";

type GlobalRatelimit = typeof globalThis & {
  __sfContactRatelimit?: Ratelimit | null;
  __sfContactMemoryBuckets?: Map<string, number[]>;
};

const g = globalThis as GlobalRatelimit;

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) {
      return first.slice(0, 128);
    }
  }
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) {
    return cf.slice(0, 128);
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp.slice(0, 128);
  }
  return "unknown";
}

function getUpstashRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    return null;
  }

  if (g.__sfContactRatelimit === undefined) {
    const redis = new Redis({ url, token });
    g.__sfContactRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMIT, "15 m"),
      prefix: CONTACT_RATE_PREFIX,
      analytics: false,
    });
  }

  return g.__sfContactRatelimit;
}

/**
 * Best-effort per-instance limiter when Upstash is not configured.
 * Prefer setting UPSTASH_* on Vercel so limits apply across all regions/instances.
 */
function memoryLimit(ip: string): { ok: boolean; retryAfterSec: number } {
  if (!g.__sfContactMemoryBuckets) {
    g.__sfContactMemoryBuckets = new Map();
  }
  const buckets = g.__sfContactMemoryBuckets;

  const now = Date.now();
  const prev = buckets.get(ip) ?? [];
  const recent = prev.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= LIMIT) {
    const oldest = Math.min(...recent);
    const retryAfterMs = WINDOW_MS - (now - oldest);
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
    buckets.set(ip, recent);
    return { ok: false, retryAfterSec };
  }

  recent.push(now);
  buckets.set(ip, recent);

  const MAX_KEYS = 15_000;
  if (buckets.size > MAX_KEYS) {
    const iter = buckets.keys();
    const drop = iter.next().value as string | undefined;
    if (drop) {
      buckets.delete(drop);
    }
  }

  return { ok: true, retryAfterSec: 0 };
}

export type ContactRateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export async function checkContactRateLimit(request: Request): Promise<ContactRateLimitResult> {
  const ip = getClientIp(request);
  const limiter = getUpstashRatelimit();

  if (limiter) {
    const { success, reset } = await limiter.limit(ip);
    if (!success) {
      const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return { ok: false, retryAfterSec };
    }
    return { ok: true };
  }

  const mem = memoryLimit(ip);
  if (!mem.ok) {
    return { ok: false, retryAfterSec: mem.retryAfterSec };
  }
  return { ok: true };
}
