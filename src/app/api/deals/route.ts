import { NextRequest, NextResponse } from "next/server";
import { aggregateFlights } from "@/lib/providers/aggregator";
import {
  TOP_ROUTES,
  TOP_DESTINATIONS,
  PRIMARY_ORIGINS,
  HOME_AIRPORT_CASH_ESTIMATE_USD,
  type TopRoute,
} from "@/lib/deals/topRoutes";
import { pickBestForRoute, rankDeals, type ScoredDeal } from "@/lib/deals/scorer";
import type { AIResearchResult } from "@/lib/deals/aiResearch";

const AI_DEALS_CACHE_KEY = "ai-deals:v1:latest";

const DEALS_CACHE_TTL = 3600; // 1 hour
const CONCURRENCY = 5;

// ── In-memory fallback cache ──────────────────────────────────────────────────

const memCache = new Map<string, { data: ScoredDeal[]; expiresAt: number }>();

// ── Upstash Redis (lazy init — same pattern as scraper/cache.ts) ─────────────

let redis: {
  get: (k: string) => Promise<string | null>;
  set: (k: string, v: string, opts?: { ex: number }) => Promise<unknown>;
} | null = null;
let redisAttempted = false;

async function getRedis() {
  if (redisAttempted) return redis;
  redisAttempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log("[deals] No Upstash Redis configured, using in-memory cache");
    return null;
  }

  try {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({ url, token }) as typeof redis;
    console.log("[deals] Connected to Upstash Redis");
    return redis;
  } catch (err) {
    console.error("[deals] Failed to init Redis, using in-memory:", err);
    return null;
  }
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

function buildCacheKey(homeAirport: string | null): string {
  return `deals:v1:${homeAirport ?? "global"}`;
}

async function getFromCache(key: string): Promise<ScoredDeal[] | null> {
  // Try Redis first
  const r = await getRedis();
  if (r) {
    try {
      const raw = await r.get(key);
      if (raw) {
        return typeof raw === "string" ? JSON.parse(raw) : (raw as ScoredDeal[]);
      }
    } catch (err) {
      console.error("[deals] Redis get error:", err);
    }
  }
  // Memory fallback
  const entry = memCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  if (entry) memCache.delete(key);
  return null;
}

async function setInCache(key: string, deals: ScoredDeal[]): Promise<void> {
  const r = await getRedis();
  if (r) {
    try {
      await r.set(key, JSON.stringify(deals), { ex: DEALS_CACHE_TTL });
    } catch (err) {
      console.error("[deals] Redis set error:", err);
    }
  }
  memCache.set(key, { data: deals, expiresAt: Date.now() + DEALS_CACHE_TTL * 1000 });
}

// ── Route scanning ────────────────────────────────────────────────────────────

async function scanRoutes(routes: TopRoute[], date: string): Promise<ScoredDeal[]> {
  const results: ScoredDeal[] = [];

  for (let i = 0; i < routes.length; i += CONCURRENCY) {
    const batch = routes.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (route) => {
        const { flights } = await aggregateFlights({
          origin: route.origin,
          destination: route.destination,
          date,
          cabin: "business",
          passengers: 1,
        });
        return pickBestForRoute(flights, route);
      }),
    );

    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) results.push(r.value);
      if (r.status === "rejected") {
        console.error("[deals] Route scan error:", r.reason);
      }
    }
  }

  return results;
}

// ── AI deals reader ───────────────────────────────────────────────────────────

async function getAIDeals(): Promise<AIResearchResult | null> {
  const r = await getRedis();
  if (!r) return null;
  try {
    const raw = await r.get(AI_DEALS_CACHE_KEY);
    if (!raw) return null;
    return typeof raw === "string"
      ? (JSON.parse(raw) as AIResearchResult)
      : (raw as AIResearchResult);
  } catch {
    return null;
  }
}

// ── GET /api/deals ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const homeAirport =
    request.nextUrl.searchParams.get("homeAirport")?.toUpperCase() || null;

  const cacheKey = buildCacheKey(homeAirport);
  const cached = await getFromCache(cacheKey);
  if (cached) {
    return NextResponse.json({ deals: cached, cached: true });
  }

  // Build deduplicated route list (curated routes first so their cashEstimate wins)
  const routeMap = new Map<string, TopRoute>(
    TOP_ROUTES.map((r) => [`${r.origin}:${r.destination}`, r]),
  );

  // Add home airport routes if it's not already a primary origin
  if (homeAirport && !PRIMARY_ORIGINS.has(homeAirport)) {
    for (const dest of TOP_DESTINATIONS) {
      if (dest === homeAirport) continue;
      const key = `${homeAirport}:${dest}`;
      if (!routeMap.has(key)) {
        routeMap.set(key, {
          origin: homeAirport,
          destination: dest,
          cashEstimateUSD: HOME_AIRPORT_CASH_ESTIMATE_USD,
        });
      }
    }
  }

  const routes = Array.from(routeMap.values());

  // Scan date: today + 90 days (award charts are date-agnostic; gives Seats.aero a future date)
  const scanDate = new Date();
  scanDate.setDate(scanDate.getDate() + 90);
  const date = scanDate.toISOString().split("T")[0];

  // Fetch AI research deals in parallel with route scanning
  const [aiResult, scanResult] = await Promise.allSettled([
    getAIDeals(),
    scanRoutes(routes, date),
  ]);

  const aiResearch =
    aiResult.status === "fulfilled" ? aiResult.value : null;

  if (scanResult.status === "rejected") {
    console.error("[deals] Scan failed:", scanResult.reason);
    // If we have AI deals, still return them
    if (aiResearch) {
      return NextResponse.json({
        deals: [],
        aiDeals: aiResearch,
        cached: false,
        error: "Route scan failed — showing AI research only",
      });
    }
    return NextResponse.json(
      { deals: [], error: "Scan failed" },
      { status: 500 },
    );
  }

  const ranked = rankDeals(scanResult.value, 30);
  await setInCache(cacheKey, ranked);

  return NextResponse.json({
    deals: ranked,
    aiDeals: aiResearch ?? undefined,
    cached: false,
    scanDate: date,
  });
}
