/**
 * American Airlines Award Search Scraper
 *
 * Strategy: Navigate to AA search page with URL params to establish a session
 * (passing Akamai challenges), then use the captured cookies to call
 * AA's internal API directly.
 *
 * Based on proven approach from open-source AA scrapers:
 * - API endpoint: POST https://www.aa.com/booking/api/search/itinerary
 * - Session cookies: XSRF-TOKEN, spa_session_id (critical)
 * - Headers: X-XSRF-TOKEN, X-CID derived from cookies
 * - Response: slices[].pricingDetail[] with perPassengerAwardPoints
 *
 * Flow:
 * 1. Navigate to AA search URL with params (triggers Akamai + loads session)
 * 2. Intercept the API response from /booking/api/search/itinerary
 * 3. If intercepted, parse and return results
 * 4. If not, use captured cookies to make direct API call via page.evaluate(fetch)
 */

import pino from "pino";
import { getContext, releaseContext } from "../pool.js";
import type { AwardResult, ScrapeRequest } from "../types.js";

const logger = pino({ level: "info" });

const AA_BASE = "https://www.aa.com";
const AA_API = "https://www.aa.com/booking/api/search/itinerary";

const CABIN_MAP: Record<string, string> = {
  economy: "COACH",
  premium_economy: "PREMIUM_ECONOMY",
  business: "BUSINESS",
  first: "FIRST",
};

/** Build the AA search URL with query params (triggers the search on page load). */
function buildSearchUrl(request: ScrapeRequest): string {
  const slices = JSON.stringify([
    {
      orig: request.origin,
      origNearby: false,
      dest: request.destination,
      destNearby: false,
      date: request.date,
    },
  ]);

  const params = new URLSearchParams({
    locale: "en_US",
    fareType: "Lowest",
    pax: "1",
    adult: "1",
    type: "OneWay",
    searchType: "Award",
    cabin: "",
    carriers: "ALL",
    travelType: "personal",
    slices,
  });

  return `${AA_BASE}/booking/search?${params.toString()}`;
}

/** Build the API request payload. */
function buildPayload(request: ScrapeRequest): object {
  return {
    metadata: { selectedProducts: [], tripType: "OneWay", udo: {} },
    passengers: [{ type: "adult", count: 1 }],
    requestHeader: { clientId: "AAcom" },
    slices: [
      {
        allCarriers: true,
        cabin: "",
        connectionCity: null,
        departureDate: request.date,
        destination: request.destination,
        destinationNearbyAirports: false,
        maxStops: null,
        origin: request.origin,
        originNearbyAirports: false,
      },
    ],
    tripOptions: {
      corporateBooking: false,
      fareType: "Lowest",
      locale: "en_US",
      pointOfSale: "",
      searchType: "Award",
    },
    loyaltyInfo: null,
    queryParams: {
      sliceIndex: 0,
      sessionId: "",
      solutionSet: "",
      solutionId: "",
    },
  };
}

/** Scrape AA award availability. */
export async function scrapeAA(request: ScrapeRequest): Promise<AwardResult[]> {
  const context = await getContext();
  const page = await context.newPage();
  const results: AwardResult[] = [];

  try {
    // Track intercepted API responses
    let apiData: any = null;

    page.on("response", async (response: any) => {
      const url = response.url();
      if (url.includes("/booking/api/search/itinerary")) {
        try {
          const contentType = response.headers()["content-type"] || "";
          if (contentType.includes("json")) {
            const json = await response.json();
            if (json.slices && json.slices.length > 0) {
              apiData = json;
              logger.info({ slices: json.slices.length }, "Intercepted AA API response");
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    });

    logger.info({ route: `${request.origin}-${request.destination}` }, "Starting AA scrape");

    // Step 1: Navigate to homepage first to get initial cookies + pass Akamai
    await page.goto(AA_BASE, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(2000 + Math.random() * 2000);

    // Accept cookie consent if present
    try {
      const cookieBtn = await page.waitForSelector(
        '#accept-recommended-btn-handler, #onetrust-accept-btn-handler, button:has-text("Accept")',
        { timeout: 5000, state: "visible" },
      );
      if (cookieBtn) {
        await cookieBtn.click();
        await page.waitForTimeout(1000);
        logger.info("Accepted cookie consent");
      }
    } catch {
      // No cookie banner
    }

    // Check for IP block
    const pageContent = await page.content();
    if (
      pageContent.toLowerCase().includes("<title>access denied</title>") ||
      pageContent.toLowerCase().includes("you don't have permission")
    ) {
      throw new Error("IP blocked by Akamai — need proxy or wait ~40 minutes");
    }

    // Step 2: Navigate to search URL with params (triggers the search API call)
    const searchUrl = buildSearchUrl(request);
    logger.info("Navigating to search URL");

    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for Akamai challenge to resolve if needed
    try {
      await page.waitForFunction(
        `!window.location.href.includes('akamai') && !document.body.innerHTML.includes('sec_chlge_form')`,
        { timeout: 60000 },
      );
    } catch {
      logger.warn("Akamai challenge may not have resolved");
    }

    // Step 3: Wait for the API response to be intercepted
    const maxWait = 20; // seconds
    for (let i = 0; i < maxWait && !apiData; i++) {
      await page.waitForTimeout(1000);
      if (i > 0 && i % 5 === 0) {
        logger.info({ elapsed: i }, "Waiting for AA API response...");
      }
    }

    // Step 4: If no intercepted response, try making the API call directly
    if (!apiData) {
      logger.info("No intercepted response, attempting direct API call via page.evaluate");

      try {
        const payload = buildPayload(request);
        const fetchResult = await page.evaluate(
          async ({ apiUrl, body }: { apiUrl: string; body: string }) => {
            try {
              const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json, text/plain, */*",
                  "Accept-Language": "en-US,en;q=0.9",
                },
                body,
                credentials: "include",
              });
              if (!response.ok) return { error: `HTTP ${response.status}` };
              return await response.json();
            } catch (err: any) {
              return { error: err.message };
            }
          },
          { apiUrl: AA_API, body: JSON.stringify(payload) },
        );

        if (fetchResult && !fetchResult.error && fetchResult.slices) {
          apiData = fetchResult;
          logger.info({ slices: fetchResult.slices.length }, "Direct API call successful");
        } else {
          logger.warn({ error: fetchResult?.error }, "Direct API call failed");
        }
      } catch (err) {
        logger.warn({ err }, "page.evaluate fetch failed");
      }
    }

    // Step 5: Parse results
    if (apiData) {
      const parsed = parseAAApiResponse(apiData, request);
      results.push(...parsed);
    }

    logger.info(
      { route: `${request.origin}-${request.destination}`, count: results.length },
      "AA scrape complete",
    );
  } catch (err) {
    logger.error({ err }, "AA scrape error");
    throw err;
  } finally {
    await page.close();
    await releaseContext(context);
  }

  return results;
}

/**
 * Parse AA's /booking/api/search/itinerary response.
 *
 * Response structure (confirmed from multiple open-source scrapers):
 * {
 *   slices: [{
 *     durationInMinutes: number,
 *     stops: number,
 *     segments: [{
 *       departureDateTime: string,
 *       arrivalDateTime: string,
 *       origin: { code: string },
 *       destination: { code: string },
 *       flight: { carrierCode: string, flightNumber: string },
 *       legs: [{ aircraft: { name: string }, amenities: string[] }]
 *     }],
 *     pricingDetail: [{
 *       productAvailable: boolean,
 *       productType: "COACH" | "BUSINESS" | "FIRST" | "PREMIUM_ECONOMY",
 *       extendedFareCode: string,
 *       perPassengerAwardPoints: number,
 *       perPassengerTaxesAndFees: { amount: number, currency: string },
 *       slicePricing?: {
 *         perPassengerAwardPoints: string,
 *         allPassengerDisplayTaxTotal: { amount: number }
 *       }
 *     }]
 *   }]
 * }
 */
function parseAAApiResponse(data: any, request: ScrapeRequest): AwardResult[] {
  const results: AwardResult[] = [];
  const now = new Date().toISOString();
  const slices = data.slices || [];
  const cabinFilter = CABIN_MAP[request.cabin] || "COACH";

  for (const slice of slices) {
    const segments = slice.segments || [];
    if (segments.length === 0) continue;

    // Only include direct flights matching origin/destination
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];
    const origin = firstSeg?.origin?.code || "";
    const destination = lastSeg?.destination?.code || "";

    if (origin !== request.origin || destination !== request.destination) continue;

    const isDirect = segments.length === 1;
    const carrierCodes = [
      ...new Set(
        segments
          .map((s: any) => s.flight?.carrierCode)
          .filter(Boolean),
      ),
    ] as string[];

    const pricingDetail = slice.pricingDetail || [];

    for (const pricing of pricingDetail) {
      if (!pricing.productAvailable) continue;

      // Filter by requested cabin
      const productType = pricing.productType || "";
      if (cabinFilter !== "COACH" && !productType.startsWith(cabinFilter)) continue;
      if (cabinFilter === "COACH" && productType !== "COACH") continue;

      // Extract award points
      let miles = 0;
      if (pricing.perPassengerAwardPoints) {
        miles =
          typeof pricing.perPassengerAwardPoints === "string"
            ? parseInt(pricing.perPassengerAwardPoints.replace(/,/g, ""), 10)
            : pricing.perPassengerAwardPoints;
      } else if (pricing.slicePricing?.perPassengerAwardPoints) {
        const pts = pricing.slicePricing.perPassengerAwardPoints;
        miles = typeof pts === "string" ? parseInt(pts.replace(/,/g, ""), 10) : pts;
      }

      if (!miles || miles <= 0) continue;

      // Extract taxes
      let taxes = 0;
      if (pricing.perPassengerTaxesAndFees?.amount) {
        taxes = Math.round(pricing.perPassengerTaxesAndFees.amount * 100); // to cents
      } else if (pricing.slicePricing?.allPassengerDisplayTaxTotal?.amount) {
        taxes = Math.round(pricing.slicePricing.allPassengerDisplayTaxTotal.amount * 100);
      }

      const taxCurrency = pricing.perPassengerTaxesAndFees?.currency || "USD";

      // Map product type to cabin
      const cabinMap: Record<string, string> = {
        COACH: "economy",
        PREMIUM_ECONOMY: "premium_economy",
        BUSINESS: "business",
        FIRST: "first",
      };
      const cabin = cabinMap[productType] || request.cabin;

      results.push({
        source: "aa",
        sourceName: "American Airlines AAdvantage",
        carrierCodes: carrierCodes.length > 0 ? carrierCodes : ["AA"],
        origin: request.origin,
        destination: request.destination,
        date: request.date,
        cabin,
        mileageCost: miles,
        taxes,
        taxesCurrency: taxCurrency,
        remainingSeats: 0,
        isDirect,
        availabilityId: `aa-live-${request.origin}-${request.destination}-${miles}`,
        dataQuality: "live",
        scrapedAt: now,
      });
    }
  }

  // Deduplicate: keep lowest miles per cabin
  const bestByCabin = new Map<string, AwardResult>();
  for (const result of results) {
    const key = `${result.cabin}-${result.isDirect}`;
    const existing = bestByCabin.get(key);
    if (!existing || result.mileageCost < existing.mileageCost) {
      bestByCabin.set(key, result);
    }
  }

  return Array.from(bestByCabin.values());
}
