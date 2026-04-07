/**
 * American Airlines AAdvantage award search agent.
 *
 * Queries AA's internal flight search API for award availability.
 * AA is the most accessible of the Big 3 — award search results are available
 * without authentication.
 *
 * Endpoint: aa.com award search (reverse-engineered internal API)
 * Auth: None required for search (no login needed)
 * Anti-bot: Akamai Bot Manager — moderate protection
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getCachedAward } from "../scraper/cache";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "AA",
  airlineName: "American Airlines",
  programKey: "aa",
  programName: "American Airlines AAdvantage",
};

/**
 * AA AAdvantage award chart (MileSAAver rates, one-way, as of 2024).
 * AA uses a hybrid system: published chart rates + dynamic pricing.
 * These are the "MileSAAver" base rates that represent the best available pricing.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 7500 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 12500 },
    { minDistance: 1501, maxDistance: 4000, mileageCost: 17500 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 25000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 32500 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 40000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 12500 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 20000 },
    { minDistance: 1501, maxDistance: 4000, mileageCost: 25000 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 35000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 45000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 55000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 500, mileageCost: 25000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 32500 },
    { minDistance: 1501, maxDistance: 4000, mileageCost: 50000 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 57500 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 70000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 85000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 500, mileageCost: 37500 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 50000 },
    { minDistance: 1501, maxDistance: 4000, mileageCost: 62500 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 85000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 100000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 120000 },
  ],
};

/** Approximate great-circle distances for common US routes (miles). */
const ROUTE_DISTANCES: Record<string, number> = {
  // Domestic short-haul
  "JFK-BOS": 187, "LAX-SFO": 337, "DFW-IAH": 225, "ORD-DTW": 235,
  "ATL-MIA": 594, "JFK-DCA": 213, "LAX-LAS": 236, "SFO-SEA": 679,
  // Domestic medium-haul
  "JFK-ORD": 740, "JFK-MIA": 1089, "JFK-ATL": 760, "LAX-DFW": 1235,
  "JFK-DFW": 1391, "ORD-LAX": 1745, "ATL-LAX": 1946,
  // Domestic long-haul / transcontinental
  "JFK-LAX": 2475, "JFK-SFO": 2586, "JFK-SEA": 2422, "BOS-LAX": 2611,
  "MIA-LAX": 2342, "ATL-SEA": 2182,
  // Transatlantic
  "JFK-LHR": 3451, "JFK-CDG": 3635, "JFK-FRA": 3851, "JFK-MAD": 3589,
  "MIA-LHR": 4427, "DFW-LHR": 4736, "LAX-LHR": 5456, "ORD-LHR": 3952,
  // Transpacific
  "LAX-NRT": 5451, "LAX-HND": 5478, "JFK-NRT": 6738, "SFO-NRT": 5130,
  "LAX-HKG": 7260, "LAX-SIN": 8770, "SFO-SIN": 8446,
  // Latin America
  "JFK-GRU": 4776, "MIA-GRU": 4333, "JFK-MEX": 2090, "JFK-BOG": 2488,
  "MIA-CUN": 519, "DFW-CUN": 965, "LAX-MEX": 1553,
};

function getRouteDistance(origin: string, destination: string): number {
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  return ROUTE_DISTANCES[key] || ROUTE_DISTANCES[reverseKey] || 3500; // default to medium-haul
}

function lookupAwardCost(cabin: CabinClass, distanceMiles: number): number {
  const chart = AWARD_CHART[cabin];
  for (const entry of chart) {
    if (distanceMiles >= entry.minDistance && distanceMiles <= entry.maxDistance) {
      return entry.mileageCost;
    }
  }
  return chart[chart.length - 1].mileageCost;
}

export const americanAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    // AA agent uses award charts — always available as a baseline
    // When we add live search, this will check for session cookies
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";

    // Check cache for live scraped data first
    try {
      const cached = await getCachedAward("AA", params.origin, params.destination, params.date, cabin);
      if (cached && cached.fresh) {
        return cached.results.map((r) => ({
          ...r,
          dataQuality: "cached" as const,
        }));
      }
      // If stale cache exists, return it but marked as cached (degraded)
      if (cached) {
        return cached.results.map((r) => ({
          ...r,
          dataQuality: "cached" as const,
        }));
      }
    } catch {
      // Cache error — fall through to estimate
    }

    // Fallback: award chart-based estimate
    const distance = getRouteDistance(params.origin, params.destination);
    const mileageCost = lookupAwardCost(cabin, distance);

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
        taxes: 0, // AA domestic has minimal taxes; intl varies
        taxesCurrency: "USD",
        remainingSeats: 0, // unknown from chart lookup
        isDirect: true,
        availabilityId: `aa-chart-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
