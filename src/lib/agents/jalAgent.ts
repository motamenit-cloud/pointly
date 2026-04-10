/**
 * Japan Airlines (JAL) Mileage Bank award search agent.
 *
 * JAL uses a zone-based award chart with distinct pricing for JAL-operated
 * vs. partner flights. Known for excellent availability on JAL metal,
 * especially in business class on their flagship 777/A350 products.
 *
 * Hub: Tokyo Narita (NRT) / Haneda (HND)
 * Alliance: oneworld
 */

import type { AirlineAgent, AirlineAgentConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getRouteType } from "./distances";
import type { RouteType } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "JL",
  airlineName: "Japan Airlines",
  programKey: "jal",
  programName: "JAL Mileage Bank",
};

/**
 * JAL Mileage Bank award chart (one-way, JAL-operated, Regular Season).
 * JAL uses zone-based pricing with Low/Regular/High seasons.
 */
const ROUTE_PRICING: Record<string, Record<CabinClass, number>> = {
  domestic_short: {
    economy: 6000,
    premium_economy: 9000,
    business: 14000,
    first: 20000,
  },
  domestic_long: {
    economy: 8000,
    premium_economy: 12000,
    business: 18000,
    first: 26000,
  },
  intra_asia: {
    economy: 10000,
    premium_economy: 18000,
    business: 30000,
    first: 45000,
  },
  transpacific: {
    economy: 25000,
    premium_economy: 40000,
    business: 50000,
    first: 80000,
  },
  europe_asia: {
    economy: 23000,
    premium_economy: 37000,
    business: 50000,
    first: 80000,
  },
  transatlantic: {
    economy: 27500,
    premium_economy: 42000,
    business: 55000,
    first: 85000,
  },
  latin_america: {
    economy: 26000,
    premium_economy: 40000,
    business: 52000,
    first: 80000,
  },
  international: {
    economy: 25000,
    premium_economy: 40000,
    business: 50000,
    first: 80000,
  },
};

function getPricing(routeType: RouteType): Record<CabinClass, number> {
  return ROUTE_PRICING[routeType] || ROUTE_PRICING.international;
}

export const jalAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const routeType = getRouteType(params.origin, params.destination);
    const pricing = getPricing(routeType);
    const mileageCost = pricing[cabin];

    // JAL has very low fuel surcharges on JL-operated award tickets
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
        availabilityId: `jl-mb-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
