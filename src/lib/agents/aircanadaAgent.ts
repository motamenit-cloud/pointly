/**
 * Air Canada Aeroplan award search agent.
 *
 * Checks the live scraper cache first. Aeroplan shows availability for the
 * entire Star Alliance network (United, Lufthansa, ANA, Swiss, Air Canada,
 * Singapore, TAP, etc.) making it one of the most valuable programs to search.
 *
 * Falls back to a distance-based estimate when live data is unavailable.
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getCachedAward } from "../scraper/cache";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "AC",
  airlineName: "Air Canada",
  programKey: "aeroplan",
  programName: "Air Canada Aeroplan",
};

/**
 * Aeroplan distance-based award chart (one-way, as of 2024).
 * Aeroplan uses a zone-based system with fixed rates per distance band.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 6000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 10000 },
    { minDistance: 1501, maxDistance: 2750, mileageCost: 15000 },
    { minDistance: 2751, maxDistance: 4000, mileageCost: 20000 },
    { minDistance: 4001, maxDistance: 5500, mileageCost: 30000 },
    { minDistance: 5501, maxDistance: 7500, mileageCost: 35000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 40000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 10000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 15000 },
    { minDistance: 1501, maxDistance: 2750, mileageCost: 20000 },
    { minDistance: 2751, maxDistance: 4000, mileageCost: 30000 },
    { minDistance: 4001, maxDistance: 5500, mileageCost: 40000 },
    { minDistance: 5501, maxDistance: 7500, mileageCost: 50000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 60000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 500, mileageCost: 15000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 25000 },
    { minDistance: 1501, maxDistance: 2750, mileageCost: 35000 },
    { minDistance: 2751, maxDistance: 4000, mileageCost: 45000 },
    { minDistance: 4001, maxDistance: 5500, mileageCost: 55000 },
    { minDistance: 5501, maxDistance: 7500, mileageCost: 65000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 75000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 500, mileageCost: 25000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 40000 },
    { minDistance: 1501, maxDistance: 2750, mileageCost: 55000 },
    { minDistance: 2751, maxDistance: 4000, mileageCost: 70000 },
    { minDistance: 4001, maxDistance: 5500, mileageCost: 80000 },
    { minDistance: 5501, maxDistance: 7500, mileageCost: 90000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 100000 },
  ],
};

function lookupAwardCost(cabin: CabinClass, distanceMiles: number): number {
  const chart = AWARD_CHART[cabin];
  for (const entry of chart) {
    if (distanceMiles >= entry.minDistance && distanceMiles <= entry.maxDistance) {
      return entry.mileageCost;
    }
  }
  return chart[chart.length - 1].mileageCost;
}

export const aircanadaAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";

    // Check for live scraped data first
    try {
      const cached = await getCachedAward("AC", params.origin, params.destination, params.date, cabin);
      if (cached) {
        return cached.results.map((r) => ({
          ...r,
          dataQuality: cached.fresh ? ("live" as const) : ("cached" as const),
        }));
      }
    } catch {
      // Cache error — fall through to estimate
    }

    // Fallback: distance-based chart estimate
    const distance = calculateDistance(params.origin, params.destination) ?? 3500;
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
        taxes: 0,
        taxesCurrency: "USD",
        remainingSeats: 0,
        isDirect: true,
        availabilityId: `ac-chart-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
