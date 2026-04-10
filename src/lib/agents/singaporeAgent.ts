/**
 * Singapore Airlines KrisFlyer award search agent.
 *
 * Singapore Airlines uses a zone/distance-based award chart for KrisFlyer
 * redemptions. Known for having one of the best business and first class
 * products globally (including the Suites product on A380s).
 *
 * Hub: Singapore Changi (SIN)
 * Key routes: SIN-US, SIN-EU, SIN-Australia, regional Asia
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "SQ",
  airlineName: "Singapore Airlines",
  programKey: "singapore",
  programName: "KrisFlyer",
};

/**
 * KrisFlyer Saver award chart (one-way, SQ-operated flights).
 * Singapore uses distance bands with Saver and Advantage tiers.
 * These are Saver (lowest) rates.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 1200, mileageCost: 7500 },
    { minDistance: 1201, maxDistance: 2400, mileageCost: 12500 },
    { minDistance: 2401, maxDistance: 4000, mileageCost: 17500 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 27500 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 37500 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 45000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 1200, mileageCost: 12500 },
    { minDistance: 1201, maxDistance: 2400, mileageCost: 22500 },
    { minDistance: 2401, maxDistance: 4000, mileageCost: 30000 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 45000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 55000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 65000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 1200, mileageCost: 20000 },
    { minDistance: 1201, maxDistance: 2400, mileageCost: 35000 },
    { minDistance: 2401, maxDistance: 4000, mileageCost: 52000 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 68000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 82000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 99000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 1200, mileageCost: 30000 },
    { minDistance: 1201, maxDistance: 2400, mileageCost: 50000 },
    { minDistance: 2401, maxDistance: 4000, mileageCost: 72500 },
    { minDistance: 4001, maxDistance: 6000, mileageCost: 95000 },
    { minDistance: 6001, maxDistance: 8000, mileageCost: 120000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 148750 },
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

export const singaporeAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 6000;
    const mileageCost = lookupAwardCost(cabin, distance);

    // SQ has low fuel surcharges on most routes
    const taxes = distance > 6000 ? 100 : distance > 3000 ? 60 : 25;

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
        availabilityId: `sq-krisflyer-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
