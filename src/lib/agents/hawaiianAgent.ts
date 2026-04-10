/**
 * Hawaiian Airlines HawaiianMiles award search agent.
 *
 * Hawaiian uses a zone-based award chart with relatively simple pricing.
 * Key routes: US mainland to Hawaii, inter-island, and limited international
 * service to Asia-Pacific.
 *
 * Note: Hawaiian merged with Alaska Airlines in 2024, but the loyalty programs
 * remain separate for now.
 */

import type { AirlineAgent, AirlineAgentConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getAirportRegion, calculateDistance } from "./distances";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "HA",
  airlineName: "Hawaiian Airlines",
  programKey: "hawaiian",
  programName: "HawaiianMiles",
};

type HawaiianZone = "inter_island" | "us_mainland" | "asia_pacific" | "other";

/** Award costs by zone and cabin (one-way). */
const ZONE_PRICING: Record<HawaiianZone, Record<CabinClass, number>> = {
  inter_island: {
    economy: 7500,
    premium_economy: 15000,
    business: 20000,
    first: 30000,
  },
  us_mainland: {
    economy: 20000,
    premium_economy: 35000,
    business: 50000,
    first: 80000,
  },
  asia_pacific: {
    economy: 40000,
    premium_economy: 55000,
    business: 80000,
    first: 120000,
  },
  other: {
    economy: 35000,
    premium_economy: 50000,
    business: 70000,
    first: 100000,
  },
};

const HAWAII_AIRPORTS = new Set(["HNL", "OGG", "KOA", "LIH", "ITO"]);

function getZone(origin: string, destination: string): HawaiianZone {
  const isOriginHI = HAWAII_AIRPORTS.has(origin);
  const isDestHI = HAWAII_AIRPORTS.has(destination);

  if (isOriginHI && isDestHI) return "inter_island";

  const otherAirport = isOriginHI ? destination : origin;
  const region = getAirportRegion(otherAirport);

  if (region === "US") return "us_mainland";
  if (region === "ASIA" || region === "OCEANIA") return "asia_pacific";
  return "other";
}

export const hawaiianAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";
    const zone = getZone(params.origin, params.destination);
    const mileageCost = ZONE_PRICING[zone][cabin];

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
        availabilityId: `ha-chart-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
