/**
 * ANA (All Nippon Airways) Mileage Club award search agent.
 *
 * ANA's Mileage Club is widely considered one of the best programs for
 * premium cabin redemptions, particularly for Star Alliance business/first
 * class flights. Round-trip pricing makes it especially valuable for
 * transpacific routes.
 *
 * Hub: Tokyo Narita (NRT) / Haneda (HND)
 * Note: ANA's award chart prices are for ROUND-TRIP. We halve them for one-way estimates.
 */

import type { AirlineAgent, AirlineAgentConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getRouteType } from "./distances";
import type { RouteType } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "NH",
  airlineName: "ANA",
  programKey: "ana",
  programName: "ANA Mileage Club",
};

/**
 * ANA Mileage Club award chart (one-way equivalent = round-trip / 2).
 * ANA publishes round-trip rates; these are halved for one-way estimates.
 * "Regular Season" rates shown.
 */
const ROUTE_PRICING: Record<string, Record<CabinClass, number>> = {
  // Japan domestic
  domestic_short: {
    economy: 5000,
    premium_economy: 8000,
    business: 12000,
    first: 18000,
  },
  domestic_long: {
    economy: 7500,
    premium_economy: 12000,
    business: 18000,
    first: 25000,
  },
  // Japan to/from Asia
  intra_asia: {
    economy: 10000,
    premium_economy: 18000,
    business: 28000,
    first: 42000,
  },
  // Japan/Asia to/from North America
  transpacific: {
    economy: 25000,
    premium_economy: 38000,
    business: 44000,
    first: 75000,
  },
  // Japan/Asia to/from Europe
  europe_asia: {
    economy: 23000,
    premium_economy: 36000,
    business: 41500,
    first: 70000,
  },
  // North America to Europe (via Star Alliance partners)
  transatlantic: {
    economy: 27500,
    premium_economy: 40000,
    business: 50000,
    first: 80000,
  },
  // Fallback
  international: {
    economy: 25000,
    premium_economy: 38000,
    business: 46000,
    first: 75000,
  },
};

function getPricing(routeType: RouteType): Record<CabinClass, number> {
  return ROUTE_PRICING[routeType] || ROUTE_PRICING.international;
}

export const anaAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const routeType = getRouteType(params.origin, params.destination);
    const pricing = getPricing(routeType);
    const mileageCost = pricing[cabin];

    // ANA has very low fuel surcharges on NH-operated flights
    const taxes = 30;

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
        availabilityId: `nh-mc-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
