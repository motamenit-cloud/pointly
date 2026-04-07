import { NextRequest, NextResponse } from "next/server";
import { isScraperAvailable, requestScrape } from "@/lib/scraper/client";
import { getCachedAward } from "@/lib/scraper/cache";
import { SCRAPABLE_CARRIERS, type ScrapableCarrier } from "@/lib/scraper/types";
import type { CabinClass } from "@/lib/providers/types";

/**
 * POST /api/scrape/trigger
 *
 * Triggers live scraping for airlines that support it (AA, DL).
 * Checks cache first — skips scraping if fresh data exists.
 * Returns job IDs for the client to poll.
 */
export async function POST(request: NextRequest) {
  if (!isScraperAvailable()) {
    return NextResponse.json(
      { jobs: {}, message: "Scraper worker not configured" },
      { status: 200 },
    );
  }

  let body: {
    origin?: string;
    destination?: string;
    date?: string;
    cabin?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { origin, destination, date, cabin } = body;
  if (!origin || !destination || !date || !cabin) {
    return NextResponse.json(
      { error: "Missing required fields: origin, destination, date, cabin" },
      { status: 400 },
    );
  }

  const jobs: Record<string, string> = {};
  const cached: Record<string, { fresh: boolean; scrapedAt: string }> = {};

  // Check cache and trigger scrapes in parallel
  await Promise.all(
    SCRAPABLE_CARRIERS.map(async (carrier: ScrapableCarrier) => {
      // Check cache first
      const cacheHit = await getCachedAward(
        carrier,
        origin,
        destination,
        date,
        cabin,
      );

      if (cacheHit?.fresh) {
        cached[carrier] = {
          fresh: true,
          scrapedAt: cacheHit.scrapedAt,
        };
        return;
      }

      // Trigger scrape
      const jobId = await requestScrape({
        carrier,
        origin,
        destination,
        date,
        cabin: cabin as CabinClass,
      });

      if (jobId) {
        jobs[carrier] = jobId;
      }
    }),
  );

  return NextResponse.json({ jobs, cached });
}
