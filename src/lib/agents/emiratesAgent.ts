/**
 * Emirates Skywards award search agent.
 *
 * Emirates uses a distance-based award chart for Skywards redemptions.
 * Known for their premium cabin products — First Class suites and
 * business class are popular redemption targets.
 *
 * Emirates operates a hub-and-spoke model through Dubai (DXB).
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "EK",
  airlineName: "Emirates",
  programKey: "emirates",
  programName: "Emirates Skywards",
};

/**
 * Emirates Skywards award chart (one-way, Saver rates).
 * Distance-based with generous mileage earning but higher redemption costs.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 1500, mileageCost: 10000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 20000 },
    { minDistance: 3001, maxDistance: 4500, mileageCost: 30000 },
    { minDistance: 4501, maxDistance: 6000, mileageCost: 40000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 50000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 62500 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 1500, mileageCost: 20000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 35000 },
    { minDistance: 3001, maxDistance: 4500, mileageCost: 50000 },
    { minDistance: 4501, maxDistance: 6000, mileageCost: 62500 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 75000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 90000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 1500, mileageCost: 30000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 55000 },
    { minDistance: 3001, maxDistance: 4500, mileageCost: 72500 },
    { minDistance: 4501, maxDistance: 6000, mileageCost: 85000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 100000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 127500 },
  ],
  first: [
    { minDistance: 0, maxDistance: 1500, mileageCost: 50000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 85000 },
    { minDistance: 3001, maxDistance: 4500, mileageCost: 100000 },
    { minDistance: 4501, maxDistance: 6000, mileageCost: 127500 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 150000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 180000 },
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

export const emiratesAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 5000;
    const mileageCost = lookupAwardCost(cabin, distance);

    // Emirates has relatively low fuel surcharges on award tickets
    const taxes = distance > 5000 ? 150 : distance > 2000 ? 80 : 30;

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
        availabilityId: `ek-skywards-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
