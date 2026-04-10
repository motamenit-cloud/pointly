/**
 * Lufthansa Miles & More award search agent.
 *
 * Lufthansa Group (LH, LX, OS, SN, LO) uses the Miles & More program
 * with a zone-based award chart. Pricing is based on origin/destination
 * zones rather than distance.
 *
 * Key strength: access to Lufthansa First Class, one of the best products
 * in commercial aviation.
 */

import type { AirlineAgent, AirlineAgentConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getRouteType } from "./distances";
import type { RouteType } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "LH",
  airlineName: "Lufthansa",
  programKey: "lufthansa",
  programName: "Miles & More",
};

/** Miles & More award pricing by route type and cabin (one-way, Saver). */
const ROUTE_PRICING: Record<string, Record<CabinClass, number>> = {
  intra_europe: {
    economy: 15000,
    premium_economy: 22000,
    business: 35000,
    first: 55000,
  },
  transatlantic: {
    economy: 30000,
    premium_economy: 45000,
    business: 64000,
    first: 87000,
  },
  transpacific: {
    economy: 35000,
    premium_economy: 52000,
    business: 70000,
    first: 105000,
  },
  europe_asia: {
    economy: 35000,
    premium_economy: 52000,
    business: 70000,
    first: 105000,
  },
  middle_east: {
    economy: 25000,
    premium_economy: 40000,
    business: 55000,
    first: 80000,
  },
  domestic_short: {
    economy: 10000,
    premium_economy: 15000,
    business: 25000,
    first: 40000,
  },
  domestic_long: {
    economy: 20000,
    premium_economy: 30000,
    business: 45000,
    first: 65000,
  },
  // Fallback for other international routes
  international: {
    economy: 35000,
    premium_economy: 50000,
    business: 70000,
    first: 100000,
  },
};

function getPricing(routeType: RouteType): Record<CabinClass, number> {
  return ROUTE_PRICING[routeType] || ROUTE_PRICING.international;
}

export const lufthansaAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const routeType = getRouteType(params.origin, params.destination);
    const pricing = getPricing(routeType);
    const mileageCost = pricing[cabin];

    // Lufthansa has moderate fuel surcharges on award tickets
    const taxes = routeType === "intra_europe" ? 80
      : routeType === "transatlantic" ? 250
      : routeType === "transpacific" || routeType === "europe_asia" ? 300
      : 150;

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
        availabilityId: `lh-mm-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
