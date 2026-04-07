import { NextRequest, NextResponse } from "next/server";
import { aggregateFlights } from "@/lib/providers/aggregator";
import { mockFlights } from "@/components/search/mockFlights";
import { isScraperAvailable, requestScrape } from "@/lib/scraper/client";
import { getCachedAward } from "@/lib/scraper/cache";
import { SCRAPABLE_CARRIERS, type ScrapableCarrier } from "@/lib/scraper/types";
import type { CabinClass } from "@/lib/providers/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const cabin = searchParams.get("cabin") || "economy";
  const passengers = parseInt(searchParams.get("passengers") || "1", 10);

  if (!origin || !destination || !date) {
    return NextResponse.json(
      { error: "Missing required parameters: origin, destination, date" },
      { status: 400 },
    );
  }

  try {
    const { flights, sources } = await aggregateFlights({
      origin,
      destination,
      date,
      cabin,
      passengers,
    });

    if (flights.length === 0) {
      return NextResponse.json({
        flights: [],
        meta: {
          origin,
          destination,
          date,
          cabin,
          passengers,
          source: sources.join("+") || "none",
          count: 0,
        },
      });
    }

    // Fire async scrape requests for airlines that support live scraping
    const scrapeJobs: Record<string, string> = {};
    if (isScraperAvailable()) {
      // Don't await — fire and forget, client will poll
      Promise.all(
        SCRAPABLE_CARRIERS.map(async (carrier: ScrapableCarrier) => {
          const cached = await getCachedAward(carrier, origin, destination, date, cabin);
          if (cached?.fresh) return; // Already have fresh data
          const jobId = await requestScrape({
            carrier,
            origin,
            destination,
            date,
            cabin: cabin as CabinClass,
          });
          if (jobId) scrapeJobs[carrier] = jobId;
        }),
      ).catch((err) => console.error("[search] Scrape trigger error:", err));
    }

    return NextResponse.json({
      flights,
      meta: {
        origin,
        destination,
        date,
        cabin,
        passengers,
        source: sources.join("+") || "none",
        count: flights.length,
        ...(Object.keys(scrapeJobs).length > 0 && { scrapeJobs }),
      },
    });
  } catch (error) {
    console.error("Flight search error:", error);
    // Graceful fallback to mock data
    return NextResponse.json({
      flights: mockFlights,
      meta: {
        origin,
        destination,
        date,
        cabin,
        passengers,
        source: "mock-fallback",
      },
    });
  }
}
