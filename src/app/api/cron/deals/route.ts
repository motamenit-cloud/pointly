/**
 * Vercel Cron endpoint: runs every morning at 6am UTC.
 * Calls the Claude AI research agent to find today's best business class
 * award deals, stores results in Redis for 25 hours.
 *
 * Secured with CRON_SECRET header (set in Vercel environment variables).
 */

import { NextRequest, NextResponse } from "next/server";
import { researchDeals, type AIResearchResult } from "@/lib/deals/aiResearch";

export const maxDuration = 300; // 5 minutes (Vercel Pro allows up to 300s for cron)

const AI_DEALS_CACHE_KEY = "ai-deals:v1:latest";
const AI_DEALS_TTL = 25 * 3600; // 25 hours — outlasts 24h cron cadence

// ── Upstash Redis (lazy init) ────────────────────────────────────────────────

let redis: {
  get: (k: string) => Promise<string | null>;
  set: (k: string, v: string, opts?: { ex: number }) => Promise<unknown>;
} | null = null;
let redisAttempted = false;

async function getRedis() {
  if (redisAttempted) return redis;
  redisAttempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.warn("[cron/deals] No Redis configured — AI deals will not be persisted");
    return null;
  }

  try {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({ url, token }) as typeof redis;
    return redis;
  } catch (err) {
    console.error("[cron/deals] Redis init failed:", err);
    return null;
  }
}

async function saveAIDeals(result: AIResearchResult): Promise<void> {
  const r = await getRedis();
  if (!r) {
    console.warn("[cron/deals] No Redis — AI deals not persisted");
    return;
  }
  await r.set(AI_DEALS_CACHE_KEY, JSON.stringify(result), { ex: AI_DEALS_TTL });
  console.log(`[cron/deals] Saved ${result.deals.length} AI deals to Redis`);
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel automatically sets the Authorization header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[cron/deals] Starting AI deal research...");

  try {
    const result = await researchDeals();
    await saveAIDeals(result);

    return NextResponse.json({
      ok: true,
      dealsFound: result.deals.length,
      researchedAt: result.researchedAt,
      summary: result.summary,
    });
  } catch (err) {
    console.error("[cron/deals] Research failed:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
