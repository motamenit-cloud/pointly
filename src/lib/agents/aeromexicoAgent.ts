/**
 * Aeromexico Club Premier award search agent.
 *
 * Aeromexico uses a distance-based award chart for Club Premier redemptions.
 * As a SkyTeam member, miles can be used on Delta and other partners.
 * Strong US-Mexico connectivity with extensive domestic Mexican network.
 *
 * Hub: Mexico City (MEX)
 * Alliance: SkyTeam
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "AM",
  airlineName: "Aeromexico",
  programKey: "aeromexico",
  programName: "Aeromexico Club Premier",
};

/**
 * Club Premier award chart (one-way, AM-operated flights).
 * Distance-based with 6 bands.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 10000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 15000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 20000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 30000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 40000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 50000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 17500 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 25000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 35000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 47500 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 60000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 75000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 500, mileageCost: 25000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 40000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 55000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 70000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 87500 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 105000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 500, mileageCost: 37500 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 55000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 75000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 95000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 120000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 145000 },
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

export const aeromexicoAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 2500;
    const mileageCost = lookupAwardCost(cabin, distance);

    const taxes = distance > 5000 ? 100 : distance > 2000 ? 50 : 30;

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
        availabilityId: `am-premier-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
