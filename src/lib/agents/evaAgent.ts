/**
 * EVA Air Infinity MileageLands award search agent.
 *
 * EVA Air uses a distance-based award chart. Their business class
 * (Royal Laurel) on 787s and 777s is consistently rated among the best
 * in the industry. A Star Alliance member with strong transpacific service.
 *
 * Hub: Taipei Taoyuan (TPE)
 * Alliance: Star Alliance
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "BR",
  airlineName: "EVA Air",
  programKey: "eva",
  programName: "Infinity MileageLands",
};

/**
 * EVA Air Infinity MileageLands award chart (one-way).
 * Distance-based with competitive pricing, especially on BR-operated flights.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 7500 },
    { minDistance: 1001, maxDistance: 2500, mileageCost: 12500 },
    { minDistance: 2501, maxDistance: 4000, mileageCost: 20000 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 30000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 37500 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 45000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 12500 },
    { minDistance: 1001, maxDistance: 2500, mileageCost: 20000 },
    { minDistance: 2501, maxDistance: 4000, mileageCost: 32500 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 47500 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 55000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 65000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 18000 },
    { minDistance: 1001, maxDistance: 2500, mileageCost: 32500 },
    { minDistance: 2501, maxDistance: 4000, mileageCost: 50000 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 65000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 80000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 95000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 1000, mileageCost: 27500 },
    { minDistance: 1001, maxDistance: 2500, mileageCost: 47500 },
    { minDistance: 2501, maxDistance: 4000, mileageCost: 67500 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 90000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 110000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 135000 },
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

export const evaAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 5500;
    const mileageCost = lookupAwardCost(cabin, distance);

    // EVA has low-to-moderate fuel surcharges
    const taxes = distance > 5000 ? 120 : distance > 2000 ? 60 : 20;

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
        availabilityId: `br-iml-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
