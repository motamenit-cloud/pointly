/**
 * Copa Airlines ConnectMiles award search agent.
 *
 * Copa operates a hub-and-spoke model through Panama City (PTY), providing
 * excellent connectivity across Central and South America. ConnectMiles
 * is a Star Alliance program with zone-based pricing.
 *
 * Hub: Panama City Tocumen (PTY)
 * Alliance: Star Alliance
 */

import type { AirlineAgent, AirlineAgentConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getRouteType } from "./distances";
import type { RouteType } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "CM",
  airlineName: "Copa Airlines",
  programKey: "copa",
  programName: "Copa ConnectMiles",
};

/** ConnectMiles award pricing by route type and cabin (one-way). */
const ROUTE_PRICING: Record<string, Record<CabinClass, number>> = {
  domestic_short: {
    economy: 7500,
    premium_economy: 12500,
    business: 20000,
    first: 35000,
  },
  domestic_long: {
    economy: 12500,
    premium_economy: 20000,
    business: 32500,
    first: 50000,
  },
  latin_america: {
    economy: 10000,
    premium_economy: 17500,
    business: 30000,
    first: 47500,
  },
  transatlantic: {
    economy: 35000,
    premium_economy: 50000,
    business: 70000,
    first: 100000,
  },
  transpacific: {
    economy: 40000,
    premium_economy: 55000,
    business: 80000,
    first: 115000,
  },
  international: {
    economy: 30000,
    premium_economy: 45000,
    business: 65000,
    first: 95000,
  },
};

function getPricing(routeType: RouteType): Record<CabinClass, number> {
  return ROUTE_PRICING[routeType] || ROUTE_PRICING.international;
}

export const copaAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const routeType = getRouteType(params.origin, params.destination);
    const pricing = getPricing(routeType);
    const mileageCost = pricing[cabin];

    const taxes = routeType === "transatlantic" || routeType === "transpacific" ? 60
      : routeType === "latin_america" ? 30
      : 20;

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
        availabilityId: `cm-connectmiles-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
