/**
 * British Airways Avios award search agent.
 *
 * BA uses a distance-based award chart for Avios redemptions.
 * The Avios program is shared across IAG carriers (BA, Iberia, Aer Lingus,
 * Vueling) but each has slightly different charts. This covers BA-operated flights.
 *
 * BA Avios is popular for short-haul European flights and US domestic
 * redemptions (via AA partnership).
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "BA",
  airlineName: "British Airways",
  programKey: "ba",
  programName: "British Airways Avios",
};

/**
 * BA Avios distance-based award chart (one-way, peak rates).
 * BA uses distance bands with different pricing for each cabin.
 * Off-peak pricing is ~50% less on select routes.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 650, mileageCost: 6000 },
    { minDistance: 651, maxDistance: 1150, mileageCost: 8500 },
    { minDistance: 1151, maxDistance: 2000, mileageCost: 10000 },
    { minDistance: 2001, maxDistance: 3000, mileageCost: 13000 },
    { minDistance: 3001, maxDistance: 4000, mileageCost: 20000 },
    { minDistance: 4001, maxDistance: 5500, mileageCost: 26000 },
    { minDistance: 5501, maxDistance: 6500, mileageCost: 32500 },
    { minDistance: 6501, maxDistance: Infinity, mileageCost: 39000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 650, mileageCost: 10000 },
    { minDistance: 651, maxDistance: 1150, mileageCost: 16500 },
    { minDistance: 1151, maxDistance: 2000, mileageCost: 20000 },
    { minDistance: 2001, maxDistance: 3000, mileageCost: 25000 },
    { minDistance: 3001, maxDistance: 4000, mileageCost: 40000 },
    { minDistance: 4001, maxDistance: 5500, mileageCost: 50000 },
    { minDistance: 5501, maxDistance: 6500, mileageCost: 55000 },
    { minDistance: 6501, maxDistance: Infinity, mileageCost: 65000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 650, mileageCost: 15000 },
    { minDistance: 651, maxDistance: 1150, mileageCost: 25000 },
    { minDistance: 1151, maxDistance: 2000, mileageCost: 31250 },
    { minDistance: 2001, maxDistance: 3000, mileageCost: 50000 },
    { minDistance: 3001, maxDistance: 4000, mileageCost: 60000 },
    { minDistance: 4001, maxDistance: 5500, mileageCost: 75000 },
    { minDistance: 5501, maxDistance: 6500, mileageCost: 87500 },
    { minDistance: 6501, maxDistance: Infinity, mileageCost: 100000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 650, mileageCost: 25000 },
    { minDistance: 651, maxDistance: 1150, mileageCost: 37500 },
    { minDistance: 1151, maxDistance: 2000, mileageCost: 42500 },
    { minDistance: 2001, maxDistance: 3000, mileageCost: 62500 },
    { minDistance: 3001, maxDistance: 4000, mileageCost: 85000 },
    { minDistance: 4001, maxDistance: 5500, mileageCost: 100000 },
    { minDistance: 5501, maxDistance: 6500, mileageCost: 120000 },
    { minDistance: 6501, maxDistance: Infinity, mileageCost: 150000 },
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

export const baAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 3500;
    const mileageCost = lookupAwardCost(cabin, distance);

    // BA imposes significant fuel surcharges on Avios redemptions
    // Estimate based on route distance
    const taxes = distance > 3000 ? 350 : distance > 1500 ? 200 : 50;

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
        availabilityId: `ba-avios-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
