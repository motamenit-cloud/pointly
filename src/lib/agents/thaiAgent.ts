/**
 * Thai Airways Royal Orchid Plus award search agent.
 *
 * Thai uses a zone/distance-based award chart. Royal Orchid Plus is a
 * Star Alliance program with generally reasonable redemption rates.
 * Thai's business class (Royal Silk) on their 787/A350 is a solid product.
 *
 * Hub: Bangkok Suvarnabhumi (BKK)
 * Alliance: Star Alliance
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "TG",
  airlineName: "Thai Airways",
  programKey: "thai",
  programName: "Royal Orchid Plus",
};

/**
 * Thai Royal Orchid Plus award chart (one-way, TG-operated).
 * Distance-based with bands aligned to Thai's route network.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 7500 },
    { minDistance: 1001, maxDistance: 2500, mileageCost: 12500 },
    { minDistance: 2501, maxDistance: 4000, mileageCost: 20000 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 30000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 40000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 50000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 12500 },
    { minDistance: 1001, maxDistance: 2500, mileageCost: 20000 },
    { minDistance: 2501, maxDistance: 4000, mileageCost: 32500 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 47500 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 57500 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 70000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 20000 },
    { minDistance: 1001, maxDistance: 2500, mileageCost: 35000 },
    { minDistance: 2501, maxDistance: 4000, mileageCost: 50000 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 65000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 80000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 95000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 30000 },
    { minDistance: 1001, maxDistance: 2500, mileageCost: 50000 },
    { minDistance: 2501, maxDistance: 4000, mileageCost: 70000 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 90000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 115000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 140000 },
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

export const thaiAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 4500;
    const mileageCost = lookupAwardCost(cabin, distance);

    // Thai has moderate fuel surcharges
    const taxes = distance > 5000 ? 180 : distance > 2000 ? 90 : 30;

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
        availabilityId: `tg-rop-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
