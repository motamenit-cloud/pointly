/**
 * Alaska Airlines Mileage Plan award search agent.
 *
 * Alaska uses a distance-based award chart for flights on Alaska Airlines.
 * Partner awards (on airlines like Cathay Pacific, JAL, etc.) use separate
 * partner-specific charts, but this agent covers AS-operated flights.
 *
 * Mileage Plan is widely regarded as one of the best US loyalty programs
 * due to generous partner redemption rates.
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "AS",
  airlineName: "Alaska Airlines",
  programKey: "alaska",
  programName: "Alaska Mileage Plan",
};

/**
 * Alaska Mileage Plan award chart (one-way, AS-operated flights).
 * Alaska uses a straightforward distance-based chart.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 700, mileageCost: 5000 },
    { minDistance: 701, maxDistance: 1400, mileageCost: 7500 },
    { minDistance: 1401, maxDistance: 2100, mileageCost: 10000 },
    { minDistance: 2101, maxDistance: 3500, mileageCost: 12500 },
    { minDistance: 3501, maxDistance: 5000, mileageCost: 17500 },
    { minDistance: 5001, maxDistance: Infinity, mileageCost: 20000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 700, mileageCost: 10000 },
    { minDistance: 701, maxDistance: 1400, mileageCost: 15000 },
    { minDistance: 1401, maxDistance: 2100, mileageCost: 20000 },
    { minDistance: 2101, maxDistance: 3500, mileageCost: 25000 },
    { minDistance: 3501, maxDistance: 5000, mileageCost: 30000 },
    { minDistance: 5001, maxDistance: Infinity, mileageCost: 35000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 700, mileageCost: 15000 },
    { minDistance: 701, maxDistance: 1400, mileageCost: 25000 },
    { minDistance: 1401, maxDistance: 2100, mileageCost: 30000 },
    { minDistance: 2101, maxDistance: 3500, mileageCost: 40000 },
    { minDistance: 3501, maxDistance: 5000, mileageCost: 55000 },
    { minDistance: 5001, maxDistance: Infinity, mileageCost: 60000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 700, mileageCost: 20000 },
    { minDistance: 701, maxDistance: 1400, mileageCost: 35000 },
    { minDistance: 1401, maxDistance: 2100, mileageCost: 45000 },
    { minDistance: 2101, maxDistance: 3500, mileageCost: 55000 },
    { minDistance: 3501, maxDistance: 5000, mileageCost: 70000 },
    { minDistance: 5001, maxDistance: Infinity, mileageCost: 80000 },
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

export const alaskaAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 2500;
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
        availabilityId: `as-chart-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
