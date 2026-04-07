/**
 * Delta SkyMiles Award Search Scraper (via Virgin Atlantic)
 *
 * Strategy: Search Delta-operated flights through Virgin Atlantic's website.
 *
 * Delta.com has the most aggressive anti-bot protection of any US airline
 * (device fingerprinting, behavioral analysis, Akamai Enterprise).
 * The proven workaround is to search through partner loyalty programs.
 *
 * Virgin Atlantic's Flying Club website:
 * - Shows all Delta award space bookable through Virgin Atlantic
 * - Much weaker anti-bot protection than delta.com
 * - Results in Virgin Points (useful for Chase/Amex/Citi transfer partners)
 *
 * Flow:
 * 1. Navigate to Virgin Atlantic reward flight search
 * 2. Fill in search form (origin, dest, date)
 * 3. Intercept API responses containing award data
 * 4. Filter for Delta-operated flights (DL carrier code)
 * 5. Parse results into AwardResult format
 */

import pino from "pino";
import { getContext, releaseContext } from "../pool.js";
import type { AwardResult, ScrapeRequest } from "../types.js";

const logger = pino({ level: "info" });

const CABIN_MAP: Record<string, string> = {
  economy: "economy",
  premium_economy: "premium",
  business: "upper",
  first: "upper", // Virgin Atlantic doesn't have a true first on most routes
};

/** Scrape Delta award availability via Virgin Atlantic. */
export async function scrapeDelta(request: ScrapeRequest): Promise<AwardResult[]> {
  const context = await getContext();
  const page = await context.newPage();
  const results: AwardResult[] = [];

  try {
    // Intercept API responses to capture flight data
    const awardResponses: any[] = [];

    page.on("response", async (response) => {
      const url = response.url();
      // Virgin Atlantic API endpoints that return flight/award data
      if (
        url.includes("/api/") &&
        (url.includes("flight") || url.includes("availability") || url.includes("reward"))
      ) {
        try {
          const contentType = response.headers()["content-type"] || "";
          if (contentType.includes("json")) {
            const json = await response.json();
            awardResponses.push({ url, data: json });
          }
        } catch {
          // Ignore parse errors on non-JSON responses
        }
      }
    });

    logger.info(
      { route: `${request.origin}-${request.destination}` },
      "Starting Delta scrape (via Virgin Atlantic)",
    );

    // Navigate to Virgin Atlantic reward flights search
    await page.goto("https://www.virginatlantic.com/reward-flight-finder", {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    await page.waitForTimeout(2000 + Math.random() * 2000);

    // Try to dismiss cookie consent banner
    try {
      const cookieBtn = page.locator('button:has-text("Accept"), button:has-text("Got it"), #onetrust-accept-btn-handler').first();
      if (await cookieBtn.isVisible({ timeout: 3000 })) {
        await cookieBtn.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // No cookie banner or already dismissed
    }

    // Fill origin airport
    try {
      const originInput = page.locator('input[placeholder*="From"], input[aria-label*="From"], input[name*="origin"]').first();
      await originInput.click();
      await originInput.fill("");
      await page.waitForTimeout(300);
      await originInput.fill(request.origin);
      await page.waitForTimeout(1000);
      // Select from autocomplete dropdown
      try {
        await page.click(`[class*="suggestion"] >> text=${request.origin}`, { timeout: 3000 });
      } catch {
        try {
          await page.click(`li:has-text("${request.origin}")`, { timeout: 2000 });
        } catch {
          await page.keyboard.press("Enter");
        }
      }
    } catch {
      logger.warn("Could not fill origin via input, trying alternate approach");
      await page.keyboard.press("Tab");
    }

    await page.waitForTimeout(500);

    // Fill destination airport
    try {
      const destInput = page.locator('input[placeholder*="To"], input[aria-label*="To"], input[name*="destination"]').first();
      await destInput.click();
      await destInput.fill("");
      await page.waitForTimeout(300);
      await destInput.fill(request.destination);
      await page.waitForTimeout(1000);
      try {
        await page.click(`[class*="suggestion"] >> text=${request.destination}`, { timeout: 3000 });
      } catch {
        try {
          await page.click(`li:has-text("${request.destination}")`, { timeout: 2000 });
        } catch {
          await page.keyboard.press("Enter");
        }
      }
    } catch {
      logger.warn("Could not fill destination via input");
      await page.keyboard.press("Tab");
    }

    await page.waitForTimeout(500);

    // Set departure date
    try {
      const dateInput = page.locator('input[aria-label*="Depart"], input[name*="date"], input[placeholder*="date"]').first();
      await dateInput.click();
      await dateInput.fill(formatDateForVS(request.date));
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
    } catch {
      logger.warn("Could not set date, using calendar picker approach");
      try {
        // Try clicking on the date in a calendar widget
        const [, m, d] = request.date.split("-");
        const dayNum = parseInt(d, 10).toString();
        await page.click(`[class*="calendar"] >> text="${dayNum}"`, { timeout: 3000 });
      } catch {
        logger.warn("Could not set date via calendar either, proceeding with default");
      }
    }

    // Set cabin if not economy
    if (request.cabin !== "economy") {
      try {
        const cabinSelect = page.locator('select[aria-label*="Cabin"], select[name*="cabin"], [class*="cabin-select"]').first();
        if (await cabinSelect.isVisible({ timeout: 2000 })) {
          await cabinSelect.selectOption({ label: CABIN_MAP[request.cabin] || "economy" });
        }
      } catch {
        logger.warn("Could not set cabin class");
      }
    }

    // Submit search
    try {
      const searchBtn = page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Find flights")').first();
      await searchBtn.click();
    } catch {
      logger.warn("Could not click search button");
      await page.keyboard.press("Enter");
    }

    // Wait for results
    await page.waitForTimeout(5000 + Math.random() * 3000);

    try {
      await page.waitForSelector('[class*="flight"], [class*="result"], [data-testid*="flight"]', {
        timeout: 15000,
      });
    } catch {
      logger.warn("No flight result selectors found, checking intercepted responses");
    }

    // Parse intercepted API responses
    for (const resp of awardResponses) {
      const parsed = parseVSResponse(resp.data, request);
      results.push(...parsed);
    }

    // If no intercepted data, try parsing the page DOM
    if (results.length === 0) {
      const domResults = await parseVSPageDOM(page, request);
      results.push(...domResults);
    }

    logger.info(
      { route: `${request.origin}-${request.destination}`, count: results.length },
      "Delta scrape complete (via Virgin Atlantic)",
    );
  } catch (err) {
    logger.error({ err }, "Delta scrape error");
    throw err;
  } finally {
    await page.close();
    await releaseContext(context);
  }

  return results;
}

/** Format YYYY-MM-DD to DD/MM/YYYY (UK date format for Virgin Atlantic). */
function formatDateForVS(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

/** Parse Virgin Atlantic's API response, filtering for Delta-operated flights. */
function parseVSResponse(data: any, request: ScrapeRequest): AwardResult[] {
  const results: AwardResult[] = [];
  const now = new Date().toISOString();

  // Try various response structures VS might use
  const flights =
    data?.outbound?.flights ||
    data?.flights ||
    data?.data?.flights ||
    data?.availability?.flights ||
    data?.journeys ||
    data?.results ||
    [];

  for (const flight of flights) {
    // Extract carrier info — we want Delta-operated flights
    const segments = flight.segments || flight.legs || flight.flights || [];
    const carrierCodes = [
      ...new Set(
        segments
          .map((s: any) =>
            s.operatingCarrier?.code ||
            s.operatingCarrier ||
            s.carrierCode ||
            s.airline ||
            s.marketingCarrier?.code ||
            "",
          )
          .filter(Boolean),
      ),
    ] as string[];

    // Also check flight-level carrier
    const flightCarrier =
      flight.operatingCarrier?.code ||
      flight.operatingCarrier ||
      flight.carrier ||
      flight.airlineCode ||
      "";

    if (flightCarrier && !carrierCodes.includes(flightCarrier)) {
      carrierCodes.push(flightCarrier);
    }

    // Filter: only include Delta-operated or Delta-marketed flights
    const hasDelta = carrierCodes.some(
      (c) => c === "DL" || c === "VS", // VS = Virgin Atlantic (codeshare partner)
    );

    // If carrier info is empty, include it (might be Delta)
    // If carrier info exists and doesn't include DL/VS, skip
    if (carrierCodes.length > 0 && !hasDelta) continue;

    // Extract points cost
    const points =
      flight.price?.points ||
      flight.price?.miles ||
      flight.points ||
      flight.milesRequired ||
      flight.rewardCost?.points ||
      flight.cost?.points ||
      0;

    if (!points || points <= 0) continue;

    // Extract taxes
    const taxes =
      flight.price?.tax ||
      flight.price?.taxes ||
      flight.taxes?.amount ||
      flight.tax ||
      0;

    // Extract taxes currency (VS usually shows GBP)
    const taxCurrency =
      flight.price?.taxCurrency ||
      flight.taxes?.currency ||
      "GBP";

    const seatsLeft =
      flight.seatsRemaining ||
      flight.availableSeats ||
      flight.availability?.seats ||
      0;

    results.push({
      source: "virginatlantic",
      sourceName: "Virgin Atlantic Flying Club",
      carrierCodes: carrierCodes.length > 0 ? carrierCodes : ["DL"],
      origin: request.origin,
      destination: request.destination,
      date: request.date,
      cabin: request.cabin,
      mileageCost: points,
      taxes: typeof taxes === "number" ? Math.round(taxes * 100) : 0, // Convert to cents
      taxesCurrency: taxCurrency,
      remainingSeats: seatsLeft,
      isDirect: segments.length <= 1,
      availabilityId: flight.id || `vs-live-${Date.now()}`,
      dataQuality: "live",
      scrapedAt: now,
    });
  }

  return results;
}

/** Fallback: parse results from Virgin Atlantic's page DOM. */
async function parseVSPageDOM(
  page: any,
  request: ScrapeRequest,
): Promise<AwardResult[]> {
  const results: AwardResult[] = [];
  const now = new Date().toISOString();

  try {
    // Try to extract award prices from the rendered page
    const priceElements = await page.$$eval(
      '[class*="price"], [class*="points"], [class*="miles"], [data-testid*="price"], [class*="reward"]',
      (els: Element[]) =>
        els.map((el) => ({
          text: el.textContent || "",
          ariaLabel: el.getAttribute("aria-label") || "",
          parentText: el.parentElement?.textContent || "",
        })),
    );

    for (const el of priceElements) {
      // Extract point amounts from text like "26,500 points" or "26.5K pts"
      const pointsMatch = el.text.match(/([\d,]+)\s*(?:points?|pts|miles?|virgin\s*points)/i);
      const kMatch = el.text.match(/([\d.]+)\s*[Kk]\s*(?:points?|pts|miles?)/);

      let points = 0;
      if (pointsMatch) {
        points = parseInt(pointsMatch[1].replace(/,/g, ""), 10);
      } else if (kMatch) {
        points = Math.round(parseFloat(kMatch[1]) * 1000);
      }

      if (points > 0 && points < 500000) {
        // Check if this looks like a Delta flight (look for DL in parent text)
        const isDelta =
          el.parentText.includes("Delta") ||
          el.parentText.includes("DL") ||
          el.parentText.includes("Virgin") ||
          !el.parentText.match(/\b(BA|UA|AA|LH|AF)\b/); // Not another airline

        if (isDelta) {
          results.push({
            source: "virginatlantic",
            sourceName: "Virgin Atlantic Flying Club",
            carrierCodes: ["DL"],
            origin: request.origin,
            destination: request.destination,
            date: request.date,
            cabin: request.cabin,
            mileageCost: points,
            taxes: 0,
            taxesCurrency: "GBP",
            remainingSeats: 0,
            isDirect: true,
            availabilityId: `vs-dom-${Date.now()}-${points}`,
            dataQuality: "live",
            scrapedAt: now,
          });
        }
      }
    }
  } catch (err) {
    logger.warn({ err }, "Failed to parse Virgin Atlantic page DOM");
  }

  return results;
}
