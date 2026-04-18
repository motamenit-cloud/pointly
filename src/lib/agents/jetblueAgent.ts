/**
 * JetBlue TrueBlue award search agent.
 *
 * JetBlue uses revenue-based pricing — points have a fixed value of
 * approximately 1.3 cents per point. Award costs are calculated directly
 * from cash fares: points = cashPrice / 0.013
 *
 * This means if we have the cash price (from Amadeus), we can accurately
 * calculate the TrueBlue points needed without scraping jetblue.com.
 *
 * JetBlue is available in the Amadeus GDS, so cash fares flow through
 * the existing Amadeus provider.
 */

import type { AirlineAgent, RevenueProgramConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getCachedAward } from "../scraper/cache";

const CONFIG: RevenueProgramConfig = {
  carrierCode: "B6",
  airlineName: "JetBlue",
  programKey: "jetblue",
  programName: "JetBlue TrueBlue",
  centsPerPoint: 1.3,
};

/**
 * Since JetBlue is revenue-based and available through Amadeus, the agent
 * can calculate exact TrueBlue points from any B6 cash flight in the
 * aggregated results.
 *
 * For standalone use (without Amadeus cash fares), we provide typical
 * price-based estimates for common route types.
 */
const TYPICAL_FARES: Record<string, Record<CabinClass, number>> = {
  shortDomestic: {
    economy: 89,
    premium_economy: 139,
    business: 249, // "Even More Space" / Mint on some routes
    first: 249,    // JetBlue doesn't have traditional first class
  },
  longDomestic: {
    economy: 159,
    premium_economy: 249,
    business: 599, // Mint
    first: 599,
  },
  transcon: {
    economy: 199,
    premium_economy: 349,
    business: 999, // Mint
    first: 999,
  },
  caribbean: {
    economy: 149,
    premium_economy: 229,
    business: 449,
    first: 449,
  },
  international: {
    economy: 249,
    premium_economy: 399,
    business: 1199, // Mint to London
    first: 1199,
  },
};

/** JetBlue's network is primarily US domestic + Caribbean + London. */
const JETBLUE_REGIONS: Record<string, string> = {
  JFK: "US", BOS: "US", FLL: "US", MCO: "US", LAX: "US", SFO: "US",
  LGB: "US", SJU: "US", AUS: "US", BUF: "US", DEN: "US",
  MSY: "US", PBI: "US", RSW: "US", SAN: "US", SEA: "US", TPA: "US",
  LHR: "EU", // JetBlue Mint to London
  // Caribbean
  CUN: "CARIB", NAS: "CARIB", MBJ: "CARIB", PUJ: "CARIB", STT: "CARIB",
  SXM: "CARIB", AUA: "CARIB", BGI: "CARIB", GCM: "CARIB",
};

function getRouteTier(origin: string, destination: string): string {
  const oRegion = JETBLUE_REGIONS[origin] || "US";
  const dRegion = JETBLUE_REGIONS[destination] || "US";

  if (oRegion === "EU" || dRegion === "EU") return "international";
  if (oRegion === "CARIB" || dRegion === "CARIB") return "caribbean";

  // Transcon routes (JFK/BOS to LAX/SFO/SAN/SEA)
  const eastCoast = new Set(["JFK", "BOS", "EWR", "FLL"]);
  const westCoast = new Set(["LAX", "SFO", "SAN", "SEA", "LGB"]);
  if (
    (eastCoast.has(origin) && westCoast.has(destination)) ||
    (westCoast.has(origin) && eastCoast.has(destination))
  ) {
    return "transcon";
  }

  // Short vs long domestic
  const shortRoutes = new Set([
    "JFK-BOS", "BOS-JFK", "JFK-DCA", "DCA-JFK", "FLL-MCO", "MCO-FLL",
    "JFK-BUF", "BUF-JFK",
  ]);
  const key = `${origin}-${destination}`;
  return shortRoutes.has(key) ? "shortDomestic" : "longDomestic";
}

function cashToPoints(cashPrice: number): number {
  return Math.ceil(cashPrice / (CONFIG.centsPerPoint / 100));
}

export const jetblueAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";

    // Check for live scraped data first
    try {
      const cached = await getCachedAward("B6", params.origin, params.destination, params.date, cabin);
      if (cached) {
        return cached.results.map((r) => ({
          ...r,
          dataQuality: cached.fresh ? ("live" as const) : ("cached" as const),
        }));
      }
    } catch {
      // Cache error — fall through to estimate
    }

    const tier = getRouteTier(params.origin, params.destination);
    const typicalFare = TYPICAL_FARES[tier]?.[cabin] || TYPICAL_FARES.longDomestic[cabin];
    const mileageCost = cashToPoints(typicalFare);

    return [
      {
        source: CONFIG.programKey,
        sourceName: CONFIG.programName,
        carrierCodes: [CONFIG.carrierCode],
        origin: params.origin,
        destination: params.destination,
        date: params.date,
        cabin,
        mileageCost,
        taxes: 0, // revenue-based redemptions include taxes in the points price
        taxesCurrency: "USD",
        remainingSeats: 0,
        isDirect: true,
        availabilityId: `b6-revenue-${params.origin}-${params.destination}-${cabin}`,
      },
    ];
  },
};
