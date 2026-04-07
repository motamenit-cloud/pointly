/**
 * Delta Air Lines SkyMiles award search agent.
 *
 * Delta uses fully dynamic pricing — there is no published award chart.
 * Mileage costs fluctuate based on demand, route, and time of year.
 *
 * This agent uses Delta's known pricing bands to estimate costs.
 * Live search via delta.com is extremely difficult due to aggressive anti-bot
 * protections (device fingerprinting, behavioral analysis, Akamai).
 *
 * Pricing approach: Delta publishes no award chart, but the community has
 * identified consistent pricing tiers for each cabin class.
 */

import type { AirlineAgent, AirlineAgentConfig } from "./types";
import type { AwardResult, CabinClass, SearchParams } from "../providers/types";
import { CABIN_NORMALIZE } from "../providers/types";
import { getCachedAward } from "../scraper/cache";

const CONFIG: AirlineAgentConfig = {
  carrierCode: "DL",
  airlineName: "Delta Air Lines",
  programKey: "delta",
  programName: "Delta SkyMiles",
};

/**
 * Delta dynamic pricing bands (approximate, based on community data).
 * Delta prices awards dynamically, but tends to cluster around these ranges.
 * We use the "typical" midpoint for estimates.
 *
 * Format: [domestic short, domestic long, transatlantic, transpacific]
 */
interface PricingBand {
  domesticShort: number;  // < 1000 mi
  domesticLong: number;   // 1000-3000 mi
  transatlantic: number;  // US to Europe
  transpacific: number;   // US to Asia
  latinAmerica: number;   // US to Latin America
}

const PRICING_BANDS: Record<CabinClass, PricingBand> = {
  economy: {
    domesticShort: 10000,
    domesticLong: 18000,
    transatlantic: 32000,
    transpacific: 35000,
    latinAmerica: 20000,
  },
  premium_economy: {
    domesticShort: 15000,
    domesticLong: 28000,
    transatlantic: 50000,
    transpacific: 55000,
    latinAmerica: 35000,
  },
  business: {
    domesticShort: 25000,
    domesticLong: 40000,
    transatlantic: 85000,
    transpacific: 90000,
    latinAmerica: 60000,
  },
  first: {
    domesticShort: 35000,
    domesticLong: 60000,
    transatlantic: 150000,
    transpacific: 160000,
    latinAmerica: 100000,
  },
};

/** Regions for common airport codes. */
const AIRPORT_REGIONS: Record<string, string> = {
  // US domestic
  JFK: "US", EWR: "US", LGA: "US", LAX: "US", SFO: "US", ORD: "US",
  ATL: "US", DFW: "US", MIA: "US", SEA: "US", BOS: "US", DCA: "US",
  IAD: "US", DTW: "US", MSP: "US", SLC: "US", DEN: "US", IAH: "US",
  PHX: "US", LAS: "US", MCO: "US", CLT: "US", PHL: "US",
  // Europe
  LHR: "EU", CDG: "EU", FRA: "EU", AMS: "EU", MAD: "EU", FCO: "EU",
  MUC: "EU", ZRH: "EU", BCN: "EU", LIS: "EU", DUB: "EU",
  // Asia
  NRT: "ASIA", HND: "ASIA", HKG: "ASIA", SIN: "ASIA", ICN: "ASIA",
  BKK: "ASIA", PVG: "ASIA", PEK: "ASIA", TPE: "ASIA", DEL: "ASIA",
  // Latin America
  MEX: "LATAM", GRU: "LATAM", GIG: "LATAM", BOG: "LATAM", LIM: "LATAM",
  SCL: "LATAM", EZE: "LATAM", CUN: "LATAM", PTY: "LATAM", SJO: "LATAM",
};

function getRegion(airport: string): string {
  return AIRPORT_REGIONS[airport] || "US";
}

function getRouteTier(origin: string, destination: string): keyof PricingBand {
  const originRegion = getRegion(origin);
  const destRegion = getRegion(destination);

  if (originRegion === "US" && destRegion === "US") {
    // Rough distance check for short vs long domestic
    const shortRoutes = new Set([
      "JFK-BOS", "BOS-JFK", "LAX-SFO", "SFO-LAX", "LAX-LAS", "LAS-LAX",
      "DFW-IAH", "IAH-DFW", "ORD-DTW", "DTW-ORD", "JFK-DCA", "DCA-JFK",
      "ATL-MIA", "MIA-ATL", "JFK-PHL", "PHL-JFK",
    ]);
    const key = `${origin}-${destination}`;
    return shortRoutes.has(key) ? "domesticShort" : "domesticLong";
  }

  if (
    (originRegion === "US" && destRegion === "EU") ||
    (originRegion === "EU" && destRegion === "US")
  ) {
    return "transatlantic";
  }

  if (
    (originRegion === "US" && destRegion === "ASIA") ||
    (originRegion === "ASIA" && destRegion === "US")
  ) {
    return "transpacific";
  }

  if (
    (originRegion === "US" && destRegion === "LATAM") ||
    (originRegion === "LATAM" && destRegion === "US")
  ) {
    return "latinAmerica";
  }

  return "transatlantic"; // default for unknown international routes
}

export const deltaAgent: AirlineAgent = {
  config: CONFIG,

  isAvailable(): boolean {
    // Dynamic pricing estimation is always available
    // When we add live search, this will check for session credentials
    return true;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const cabin = CABIN_NORMALIZE[params.cabin.toLowerCase()] || "economy";

    // Check cache for live scraped data first
    try {
      const cached = await getCachedAward("DL", params.origin, params.destination, params.date, cabin);
      if (cached && cached.fresh) {
        return cached.results.map((r) => ({
          ...r,
          dataQuality: "cached" as const,
        }));
      }
      if (cached) {
        return cached.results.map((r) => ({
          ...r,
          dataQuality: "cached" as const,
        }));
      }
    } catch {
      // Cache error — fall through to estimate
    }

    // Fallback: dynamic pricing band estimate
    const tier = getRouteTier(params.origin, params.destination);
    const mileageCost = PRICING_BANDS[cabin][tier];

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
        availabilityId: `dl-dynamic-${params.origin}-${params.destination}-${cabin}`,
        dataQuality: "estimated",
      },
    ];
  },
};
