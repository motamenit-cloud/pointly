/**
 * LATAM Airlines LATAM Pass award search agent.
 *
 * LATAM is the largest airline group in Latin America, operating extensive
 * domestic networks in Chile, Brazil, Colombia, Ecuador, and Peru, plus
 * international service to the US, Europe, and Oceania.
 *
 * Hub: Santiago (SCL), São Paulo (GRU), Lima (LIM), Bogotá (BOG)
 * Alliance: None (left oneworld in 2020)
 */

import type { AirlineAgent, AirlineAgentConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getRouteType } from "./distances";
import type { RouteType } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "LA",
  airlineName: "LATAM Airlines",
  programKey: "latam",
  programName: "LATAM Pass",
};

/** LATAM Pass award pricing by route type and cabin (one-way). */
const ROUTE_PRICING: Record<string, Record<CabinClass, number>> = {
  domestic_short: {
    economy: 5000,
    premium_economy: 10000,
    business: 18000,
    first: 30000,
  },
  domestic_long: {
    economy: 10000,
    premium_economy: 18000,
    business: 30000,
    first: 50000,
  },
  latin_america: {
    economy: 10000,
    premium_economy: 18000,
    business: 30000,
    first: 50000,
  },
  transatlantic: {
    economy: 35000,
    premium_economy: 50000,
    business: 70000,
    first: 110000,
  },
  transpacific: {
    economy: 40000,
    premium_economy: 55000,
    business: 80000,
    first: 120000,
  },
  international: {
    economy: 25000,
    premium_economy: 40000,
    business: 60000,
    first: 90000,
  },
};

function getPricing(routeType: RouteType): Record<CabinClass, number> {
  return ROUTE_PRICING[routeType] || ROUTE_PRICING.international;
}

export const latamAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const routeType = getRouteType(params.origin, params.destination);
    const pricing = getPricing(routeType);
    const mileageCost = pricing[cabin];

    const taxes = routeType === "transatlantic" || routeType === "transpacific" ? 80
      : routeType === "latin_america" ? 40
      : 30;

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
        availabilityId: `la-pass-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
