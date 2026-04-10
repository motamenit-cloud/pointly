/**
 * Avianca LifeMiles award search agent.
 *
 * LifeMiles is one of the most popular loyalty programs for award bookings
 * due to its Star Alliance membership, low fuel surcharges, and frequent
 * mileage sales. Distance-based award chart with competitive pricing.
 *
 * Hub: Bogotá (BOG)
 * Alliance: Star Alliance
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "AV",
  airlineName: "Avianca",
  programKey: "avianca",
  programName: "Avianca LifeMiles",
};

/**
 * LifeMiles award chart (one-way, AV-operated flights).
 * LifeMiles is known for competitive pricing and very low surcharges.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 7500 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 10000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 15000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 25000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 35000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 45000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 12500 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 17500 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 25000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 40000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 52500 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 65000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 500, mileageCost: 20000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 30000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 45000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 63000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 75000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 90000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 500, mileageCost: 30000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 45000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 62500 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 85000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 105000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 130000 },
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

export const aviancaAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 3000;
    const mileageCost = lookupAwardCost(cabin, distance);

    // LifeMiles has very low fuel surcharges — a key selling point
    const taxes = distance > 5000 ? 50 : distance > 2000 ? 30 : 20;

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
        availabilityId: `av-lifemiles-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
