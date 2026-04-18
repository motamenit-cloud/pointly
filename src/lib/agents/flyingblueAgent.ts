/**
 * Air France / KLM Flying Blue award search agent.
 *
 * Checks the live scraper cache first. Flying Blue shows availability for
 * SkyTeam partners including Delta (DL), KLM (KL), Korean Air (KE), and others.
 *
 * Flying Blue uses dynamic "Promo Rewards" pricing on select routes, which can
 * be significantly lower than the chart rates below.
 *
 * Falls back to a distance-based estimate when live data is unavailable.
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getCachedAward } from "../scraper/cache";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "AF",
  airlineName: "Air France",
  programKey: "flyingblue",
  programName: "Air France/KLM Flying Blue",
};

/**
 * Flying Blue distance-based award chart (one-way, standard rates).
 * Flying Blue switched to dynamic pricing in 2023 but these chart values
 * serve as reasonable fallback estimates.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 7500 },
    { minDistance: 1001, maxDistance: 3000, mileageCost: 12500 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 20000 },
    { minDistance: 5001, maxDistance: 7000, mileageCost: 27500 },
    { minDistance: 7001, maxDistance: Infinity, mileageCost: 35000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 15000 },
    { minDistance: 1001, maxDistance: 3000, mileageCost: 25000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 37500 },
    { minDistance: 5001, maxDistance: 7000, mileageCost: 50000 },
    { minDistance: 7001, maxDistance: Infinity, mileageCost: 62500 },
  ],
  business: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 25000 },
    { minDistance: 1001, maxDistance: 3000, mileageCost: 45000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 65000 },
    { minDistance: 5001, maxDistance: 7000, mileageCost: 80000 },
    { minDistance: 7001, maxDistance: Infinity, mileageCost: 95000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 40000 },
    { minDistance: 1001, maxDistance: 3000, mileageCost: 70000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 95000 },
    { minDistance: 5001, maxDistance: 7000, mileageCost: 110000 },
    { minDistance: 7001, maxDistance: Infinity, mileageCost: 125000 },
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

export const flyingblueAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";

    // Check for live scraped data first
    try {
      const cached = await getCachedAward("AF", params.origin, params.destination, params.date, cabin);
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
        availabilityId: `af-chart-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
