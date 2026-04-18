/**
 * Southwest Airlines Rapid Rewards award search agent.
 *
 * Southwest uses revenue-based pricing — points have a fixed value of
 * approximately 1.4 cents per point. Award costs = cashPrice / 0.014
 *
 * IMPORTANT: Southwest is NOT in any GDS (Global Distribution System).
 * Their fares are not available through Amadeus, Sabre, or any third-party
 * booking site (Google Flights, Kayak, etc.). This is unique among major
 * US airlines.
 *
 * To get real Southwest fares, we would need to scrape southwest.com directly.
 * Southwest uses aggressive anti-bot protection (Akamai-based).
 *
 * For now, this agent estimates points based on typical Southwest fare ranges
 * by route type. When live scraping is added, it will provide real pricing.
 */

import type { AirlineAgent, RevenueProgramConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getCachedAward } from "../scraper/cache";

const CONFIG: RevenueProgramConfig = {
  carrierCode: "WN",
  airlineName: "Southwest Airlines",
  programKey: "southwest",
  programName: "Southwest Rapid Rewards",
  centsPerPoint: 1.4,
};

/**
 * Southwest fare types and typical prices by route distance.
 * Southwest has a simple fare structure: Wanna Get Away, Anytime, Business Select.
 * There is no premium economy, business, or first class cabin — all seats are economy.
 * The difference is in fare flexibility and boarding priority.
 *
 * For points bookings, the "Wanna Get Away" fare is the best value.
 */
interface FareTier {
  wannaGetAway: number;    // Best value for points
  wannaGetAwayPlus: number;
  anytime: number;
  businessSelect: number;  // Not a cabin class — just priority boarding
}

const TYPICAL_FARES: Record<string, FareTier> = {
  shortHaul: {    // < 500 miles
    wannaGetAway: 69,
    wannaGetAwayPlus: 99,
    anytime: 199,
    businessSelect: 249,
  },
  mediumHaul: {   // 500-1500 miles
    wannaGetAway: 119,
    wannaGetAwayPlus: 169,
    anytime: 299,
    businessSelect: 379,
  },
  longHaul: {     // > 1500 miles
    wannaGetAway: 179,
    wannaGetAwayPlus: 249,
    anytime: 449,
    businessSelect: 549,
  },
  hawaii: {       // Mainland to Hawaii
    wannaGetAway: 149,
    wannaGetAwayPlus: 219,
    anytime: 399,
    businessSelect: 499,
  },
};

/** Southwest hubs and common airports. */
const SW_ROUTE_DISTANCES: Record<string, number> = {
  // Short haul
  "DAL-IAH": 239, "DAL-AUS": 189, "MDW-DTW": 237, "LAS-LAX": 236,
  "DEN-ABQ": 300, "BWI-BOS": 369, "OAK-LAX": 337, "PHX-LAS": 256,
  "ATL-BNA": 214, "MCO-FLL": 179,
  // Medium haul
  "DAL-ATL": 721, "MDW-DEN": 888, "BWI-MIA": 946, "LAS-SEA": 867,
  "DAL-MCO": 984, "PHX-DEN": 602, "OAK-SEA": 671, "MDW-BOS": 867,
  "ATL-DEN": 1199, "BWI-MCO": 787,
  // Long haul
  "DAL-LAX": 1235, "MDW-LAX": 1745, "BWI-LAX": 2329, "ATL-LAX": 1946,
  "BWI-SEA": 2329, "DAL-SEA": 1660, "MDW-SFO": 1846, "ATL-SEA": 2182,
  // Hawaii
  "OAK-HNL": 2397, "LAX-HNL": 2556, "PHX-HNL": 2913, "LAS-HNL": 2761,
};

function getRouteDistance(origin: string, destination: string): number {
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  return SW_ROUTE_DISTANCES[key] || SW_ROUTE_DISTANCES[reverseKey] || 1000;
}

function getRouteTier(origin: string, destination: string): string {
  const hawaiiAirports = new Set(["HNL", "OGG", "KOA", "LIH"]);
  if (hawaiiAirports.has(origin) || hawaiiAirports.has(destination)) {
    return "hawaii";
  }
  const distance = getRouteDistance(origin, destination);
  if (distance < 500) return "shortHaul";
  if (distance < 1500) return "mediumHaul";
  return "longHaul";
}

function cashToPoints(cashPrice: number): number {
  return Math.ceil(cashPrice / (CONFIG.centsPerPoint / 100));
}

export const southwestAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    // Estimation is always available
    // TODO: When live scraping is added, check for session/proxy config
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";

    // Check for live scraped data first
    try {
      const cached = await getCachedAward("WN", params.origin, params.destination, params.date, cabin);
      if (cached) {
        return cached.results.map((r) => ({
          ...r,
          dataQuality: cached.fresh ? ("live" as const) : ("cached" as const),
        }));
      }
    } catch {
      // Cache error — fall through to estimate
    }

    // Southwest only has one cabin class (economy)
    const tier = getRouteTier(params.origin, params.destination);
    const fares = TYPICAL_FARES[tier];

    // Use "Wanna Get Away" fare as the baseline (best points value)
    const cashPrice = fares.wannaGetAway;
    const mileageCost = cashToPoints(cashPrice);

    return [
      {
        source: CONFIG.programKey,
        sourceName: CONFIG.programName,
        carrierCodes: [CONFIG.carrierCode],
        origin: params.origin,
        destination: params.destination,
        date: params.date,
        cabin: "economy", // Southwest only has economy
        mileageCost,
        taxes: 0, // revenue-based includes taxes
        taxesCurrency: "USD",
        remainingSeats: 0,
        isDirect: true,
        availabilityId: `wn-revenue-${params.origin}-${params.destination}`,
      },
    ];
  },
};
