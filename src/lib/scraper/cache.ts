/**
 * Award scrape cache — Redis (Upstash) with in-memory fallback.
 *
 * Cache key format: award:{carrier}:{origin}:{dest}:{date}:{cabin}
 * Fresh reads: within TTL (15 min AA, 10 min Delta)
 * Stale reads: up to 2 hours (used when scraper is down)
 */

import type { AwardResult } from "../providers/types";
import type { CacheEntry, ScrapableCarrier } from "./types";
import { CACHE_TTL, STALE_TTL } from "./types";

/* ── In-memory fallback store ── */

const memoryCache = new Map<string, CacheEntry>();

function buildKey(
  carrier: string,
  origin: string,
  destination: string,
  date: string,
  cabin: string,
): string {
  return `award:${carrier}:${origin}:${destination}:${date}:${cabin}`;
}

/* ── Upstash Redis (lazy init) ── */

let redis: { get: (k: string) => Promise<string | null>; set: (k: string, v: string, opts?: { ex: number }) => Promise<unknown> } | null = null;
let redisInitAttempted = false;

async function getRedis() {
  if (redisInitAttempted) return redis;
  redisInitAttempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log("[cache] No UPSTASH_REDIS_REST_URL configured, using in-memory cache");
    return null;
  }

  try {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({ url, token }) as typeof redis;
    console.log("[cache] Connected to Upstash Redis");
    return redis;
  } catch (err) {
    console.error("[cache] Failed to init Upstash Redis, using in-memory:", err);
    return null;
  }
}

/* ── Public API ── */

export interface CacheResult {
  results: AwardResult[];
  /** Whether this is fresh (within TTL) or stale (within STALE_TTL). */
  fresh: boolean;
  scrapedAt: string;
}

/**
 * Get cached award data. Returns null if no cache exists or it's too stale.
 */
export async function getCachedAward(
  carrier: ScrapableCarrier,
  origin: string,
  destination: string,
  date: string,
  cabin: string,
): Promise<CacheResult | null> {
  const key = buildKey(carrier, origin, destination, date, cabin);
  const now = Date.now();

  // Try Redis first
  const r = await getRedis();
  if (r) {
    try {
      const raw = await r.get(key);
      if (raw) {
        const entry: CacheEntry = typeof raw === "string" ? JSON.parse(raw) : raw as CacheEntry;
        const staleCutoff = now - STALE_TTL * 1000;
        const scrapedTime = new Date(entry.scrapedAt).getTime();

        if (scrapedTime > staleCutoff) {
          return {
            results: entry.results,
            fresh: entry.expiresAt > now,
            scrapedAt: entry.scrapedAt,
          };
        }
      }
    } catch (err) {
      console.error("[cache] Redis get error:", err);
    }
  }

  // Fallback to memory
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    const staleCutoff = now - STALE_TTL * 1000;
    const scrapedTime = new Date(memEntry.scrapedAt).getTime();

    if (scrapedTime > staleCutoff) {
      return {
        results: memEntry.results,
        fresh: memEntry.expiresAt > now,
        scrapedAt: memEntry.scrapedAt,
      };
    }
    // Too stale, clean up
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Store scraped award data in cache.
 */
export async function setCachedAward(
  carrier: ScrapableCarrier,
  origin: string,
  destination: string,
  date: string,
  cabin: string,
  results: AwardResult[],
): Promise<void> {
  const key = buildKey(carrier, origin, destination, date, cabin);
  const ttl = CACHE_TTL[carrier];
  const now = new Date();

  const entry: CacheEntry = {
    results,
    scrapedAt: now.toISOString(),
    expiresAt: now.getTime() + ttl * 1000,
  };

  // Write to Redis
  const r = await getRedis();
  if (r) {
    try {
      // Store with STALE_TTL so Redis auto-expires after max staleness
      await r.set(key, JSON.stringify(entry), { ex: STALE_TTL });
    } catch (err) {
      console.error("[cache] Redis set error:", err);
    }
  }

  // Always write to memory as backup
  memoryCache.set(key, entry);

  // Clean up old memory entries (simple eviction)
  if (memoryCache.size > 500) {
    const cutoff = Date.now() - STALE_TTL * 1000;
    for (const [k, v] of memoryCache) {
      if (new Date(v.scrapedAt).getTime() < cutoff) {
        memoryCache.delete(k);
      }
    }
  }
}
