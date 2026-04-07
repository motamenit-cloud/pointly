/**
 * United Airlines MileagePlus award search agent.
 *
 * United uses a semi-dynamic pricing model — they have published base rates
 * (Saver awards) but also offer dynamic "Everyday" pricing that can be
 * significantly higher.
 *
 * Live search via united.com requires authentication (login) and has
 * aggressive anti-bot protections. United has sent C&D letters to scrapers.
 *
 * This agent uses United's published Saver award chart for baseline pricing.
 * Saver availability is the most valuable type — it represents the lowest
 * redemption rates and is what savvy points travelers look for.
 */

import type { AirlineAgent, AirlineAgentConfig, AwardChart } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "UA",
  airlineName: "United Airlines",
  programKey: "united",
  programName: "United MileagePlus",
};

/**
 * United MileagePlus Saver award chart (one-way, as of 2024).
 * These are the "Saver" level rates — the best available pricing.
 * "Everyday" awards can be 2-5x higher.
 */
const AWARD_CHART: AwardChart = {
  economy: [
    { minDistance: 0, maxDistance: 800, mileageCost: 10000 },
    { minDistance: 801, maxDistance: 1500, mileageCost: 12500 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 17500 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 25000 },
    { minDistance: 5001, maxDistance: 8000, mileageCost: 35000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 40000 },
  ],
  premium_economy: [
    { minDistance: 0, maxDistance: 800, mileageCost: 15000 },
    { minDistance: 801, maxDistance: 1500, mileageCost: 20000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 25000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 40000 },
    { minDistance: 5001, maxDistance: 8000, mileageCost: 50000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 60000 },
  ],
  business: [
    { minDistance: 0, maxDistance: 800, mileageCost: 25000 },
    { minDistance: 801, maxDistance: 1500, mileageCost: 35000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 50000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 60000 },
    { minDistance: 5001, maxDistance: 8000, mileageCost: 70000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 88000 },
  ],
  first: [
    { minDistance: 0, maxDistance: 800, mileageCost: 37500 },
    { minDistance: 801, maxDistance: 1500, mileageCost: 50000 },
    { minDistance: 1501, maxDistance: 3000, mileageCost: 70000 },
    { minDistance: 3001, maxDistance: 5000, mileageCost: 80000 },
    { minDistance: 5001, maxDistance: 8000, mileageCost: 100000 },
    { minDistance: 8001, maxDistance: Infinity, mileageCost: 120000 },
  ],
};

/** Approximate great-circle distances for common routes (miles). */
const ROUTE_DISTANCES: Record<string, number> = {
  // Domestic short-haul
  "EWR-BOS": 200, "EWR-DCA": 213, "IAH-DFW": 225, "ORD-DTW": 235,
  "LAX-SFO": 337, "SFO-LAX": 337, "EWR-ORD": 719, "SFO-SEA": 679,
  // Domestic medium-haul
  "EWR-MIA": 1089, "EWR-ATL": 746, "ORD-DEN": 888, "SFO-DEN": 967,
  "IAH-ORD": 925, "DEN-SFO": 967, "ORD-MIA": 1197,
  // Domestic long-haul
  "EWR-LAX": 2454, "EWR-SFO": 2565, "EWR-SEA": 2408, "ORD-LAX": 1745,
  "IAH-SFO": 1635, "DEN-EWR": 1605,
  // Transatlantic
  "EWR-LHR": 3459, "EWR-FRA": 3858, "EWR-CDG": 3636, "ORD-LHR": 3952,
  "IAH-LHR": 4836, "SFO-LHR": 5367, "EWR-AMS": 3643,
  // Transpacific
  "SFO-NRT": 5130, "LAX-NRT": 5451, "EWR-NRT": 6738, "SFO-HKG": 6927,
  "SFO-SIN": 8446, "LAX-SIN": 8770,
  // Latin America
  "EWR-MEX": 2090, "IAH-MEX": 765, "EWR-BOG": 2488, "EWR-GRU": 4776,
  "MIA-CUN": 519, "IAH-CUN": 965,
};

function getRouteDistance(origin: string, destination: string): number {
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  return ROUTE_DISTANCES[key] || ROUTE_DISTANCES[reverseKey] || 3500;
}

function lookupAwardCost(cabin: CabinClass, distanceMiles: number): number {
  const chart = AWARD_CHART[cabin];
  for (const entry of chart) {
    if (distanceMiles >= entry.minDistance && distanceMiles <= entry.maxDistance) {
      return entry.mileageCost;
    }
  }
  return chart[chart.length - 1].mileageCost;
}

export const unitedAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    // Saver award chart lookup is always available
    // When we add live search, this will check for UA credentials
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const distance = getRouteDistance(params.origin, params.destination);
    const mileageCost = lookupAwardCost(cabin, distance);

    // TODO: Replace with live united.com search for real-time availability
    // United requires login + has aggressive anti-bot — hardest after Delta
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
        availabilityId: `ua-saver-${params.origin}-${params.destination}-${cabin}`,
      },
    ];
  },
};
