/**
 * Cathay Pacific Asia Miles award search agent.
 *
 * Cathay Pacific uses a distance-based award chart for Asia Miles redemptions.
 * The program is popular for flights to/from Asia, particularly Hong Kong.
 *
 * Hub: Hong Kong (HKG)
 * Key routes: HKG to US, Europe, Australia, and regional Asia
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "CX",
  airlineName: "Cathay Pacific",
  programKey: "cathay",
  programName: "Asia Miles",
};

/**
 * Asia Miles Standard award chart (one-way).
 * Cathay uses distance bands with Standard and Special tier pricing.
 * These are Standard (lower) rates.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 750, mileageCost: 5500 },
    { minDistance: 751, maxDistance: 1500, mileageCost: 10000 },
    { minDistance: 1501, maxDistance: 2750, mileageCost: 15000 },
    { minDistance: 2751, maxDistance: 4500, mileageCost: 20000 },
    { minDistance: 4501, maxDistance: 5750, mileageCost: 30000 },
    { minDistance: 5751, maxDistance: 7500, mileageCost: 42000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 50000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 750, mileageCost: 10000 },
    { minDistance: 751, maxDistance: 1500, mileageCost: 17500 },
    { minDistance: 1501, maxDistance: 2750, mileageCost: 25000 },
    { minDistance: 2751, maxDistance: 4500, mileageCost: 35000 },
    { minDistance: 4501, maxDistance: 5750, mileageCost: 50000 },
    { minDistance: 5751, maxDistance: 7500, mileageCost: 62500 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 75000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 750, mileageCost: 18000 },
    { minDistance: 751, maxDistance: 1500, mileageCost: 25000 },
    { minDistance: 1501, maxDistance: 2750, mileageCost: 40000 },
    { minDistance: 2751, maxDistance: 4500, mileageCost: 55000 },
    { minDistance: 4501, maxDistance: 5750, mileageCost: 70000 },
    { minDistance: 5751, maxDistance: 7500, mileageCost: 85000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 100000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 750, mileageCost: 25000 },
    { minDistance: 751, maxDistance: 1500, mileageCost: 37500 },
    { minDistance: 1501, maxDistance: 2750, mileageCost: 55000 },
    { minDistance: 2751, maxDistance: 4500, mileageCost: 75000 },
    { minDistance: 4501, maxDistance: 5750, mileageCost: 100000 },
    { minDistance: 5751, maxDistance: 7500, mileageCost: 125000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 150000 },
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

export const cathayAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 5000;
    const mileageCost = lookupAwardCost(cabin, distance);

    // Cathay has moderate fuel surcharges
    const taxes = distance > 5000 ? 200 : distance > 2500 ? 100 : 40;

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
        taxes,
        taxesCurrency: "USD",
        remainingSeats: 0,
        isDirect: true,
        availabilityId: `cx-asiamiles-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
