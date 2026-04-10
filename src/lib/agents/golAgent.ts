/**
 * GOL Smiles award search agent.
 *
 * Smiles is GOL's loyalty program and one of the most popular in Brazil.
 * Known for frequent promotions, mileage sales, and the ability to book
 * partners at competitive rates. GOL operates Brazil's largest domestic
 * network plus regional international service.
 *
 * Hub: São Paulo Guarulhos (GRU), Rio de Janeiro (GIG)
 * Alliance: None (independent, but has codeshare partnerships)
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "G3",
  airlineName: "GOL",
  programKey: "smiles",
  programName: "GOL Smiles",
};

/**
 * Smiles award chart (one-way, G3-operated flights).
 * GOL is primarily an economy carrier — premium cabins are limited.
 * Pricing is distance-based with competitive domestic Brazil rates.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 5000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 10000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 20000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 30000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 40000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 50000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 500, mileageCost: 10000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 17500 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 30000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 45000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 57500 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 70000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 500, mileageCost: 15000 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 27500 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 45000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 60000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 75000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 95000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 500, mileageCost: 22500 },
    { minDistance: 501, maxDistance: 1500, mileageCost: 40000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 60000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 80000 },
    { minDistance: 5001, maxDistance: 7500, mileageCost: 100000 },
    { minDistance: 7501, maxDistance: Infinity, mileageCost: 125000 },
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

export const golAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = calculateDistance(params.origin, params.destination) ?? 2000;
    const mileageCost = lookupAwardCost(cabin, distance);

    // GOL/Smiles has very low surcharges
    const taxes = distance > 5000 ? 40 : distance > 2000 ? 20 : 10;

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
        availabilityId: `g3-smiles-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
