/**
 * Korean Air SKYPASS award search agent.
 *
 * Korean Air uses a zone-based award chart. SKYPASS is one of the best
 * SkyTeam programs, particularly for first class redemptions on Korean Air
 * and partner airlines. Known for reasonable pricing on premium cabins.
 *
 * Hub: Seoul Incheon (ICN)
 * Alliance: SkyTeam
 */

import type { AirlineAgent, AirlineAgentConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getRouteType } from "./distances";
import type { RouteType } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "KE",
  airlineName: "Korean Air",
  programKey: "korean",
  programName: "Korean Air SKYPASS",
};

/**
 * Korean Air SKYPASS award chart (one-way).
 * Korean Air uses zone-based pricing with generally competitive rates,
 * especially for first class.
 */
const ROUTE_PRICING: Record<string, Record<CabinClass, number>> = {
  domestic_short: {
    economy: 7500,
    premium_economy: 12000,
    business: 18000,
    first: 25000,
  },
  domestic_long: {
    economy: 12500,
    premium_economy: 20000,
    business: 30000,
    first: 40000,
  },
  intra_asia: {
    economy: 15000,
    premium_economy: 22500,
    business: 30000,
    first: 45000,
  },
  transpacific: {
    economy: 40000,
    premium_economy: 55000,
    business: 62500,
    first: 80000,
  },
  europe_asia: {
    economy: 37500,
    premium_economy: 52500,
    business: 60000,
    first: 80000,
  },
  transatlantic: {
    economy: 40000,
    premium_economy: 57500,
    business: 65000,
    first: 85000,
  },
  latin_america: {
    economy: 35000,
    premium_economy: 50000,
    business: 60000,
    first: 80000,
  },
  middle_east: {
    economy: 30000,
    premium_economy: 45000,
    business: 55000,
    first: 75000,
  },
  international: {
    economy: 37500,
    premium_economy: 52500,
    business: 62500,
    first: 80000,
  },
};

function getPricing(routeType: RouteType): Record<CabinClass, number> {
  return ROUTE_PRICING[routeType] || ROUTE_PRICING.international;
}

export const koreanAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const routeType = getRouteType(params.origin, params.destination);
    const pricing = getPricing(routeType);
    const mileageCost = pricing[cabin];

    // Korean Air has moderate fuel surcharges
    const taxes = routeType === "transpacific" || routeType === "transatlantic" ? 150
      : routeType === "intra_asia" ? 50
      : 80;

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
        availabilityId: `ke-skypass-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
