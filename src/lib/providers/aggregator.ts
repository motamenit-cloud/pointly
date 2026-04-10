import type { FlightResult } from "@/components/search/FlightResultCard";
import type { SearchParams, CashFlightResult, AwardResult } from "./types";
import { amadeusProvider } from "./amadeusProvider";
import { seatsAeroProvider } from "./seatsAero";
import { airlineAgentsProvider } from "../agents";
import {
  transformAmadeusToFlightResults,
  buildUnifiedResults,
} from "../transformFlights";
import type { AmadeusFlightOffer } from "../amadeus";

/** All registered providers. Add new ones here. */
const providers = [amadeusProvider, seatsAeroProvider, airlineAgentsProvider];

export interface AggregatedResult {
  flights: FlightResult[];
  sources: string[];
}

/**
 * Search all available providers in parallel, merge results, and return
 * unified FlightResult[].
 */
export async function aggregateFlights(
  params: SearchParams,
): Promise<AggregatedResult> {
  const availableProviders = providers.filter((p) => p.isAvailable());

  if (availableProviders.length === 0) {
    return { flights: [], sources: [] };
  }

  // Fire all provider searches in parallel
  const cashPromise = runCashProviders(params);
  const awardPromise = runAwardProviders(params);

  const [cashResult, awardResult] = await Promise.allSettled([
    cashPromise,
    awardPromise,
  ]);

  const cashFlights =
    cashResult.status === "fulfilled" ? cashResult.value : [];
  const awardResults =
    awardResult.status === "fulfilled" ? awardResult.value : [];

  // Log any failures
  if (cashResult.status === "rejected") {
    console.error("[aggregator] Cash providers failed:", cashResult.reason);
  }
  if (awardResult.status === "rejected") {
    console.error("[aggregator] Award providers failed:", awardResult.reason);
  }

  // Determine which sources contributed
  const sources: string[] = [];
  if (cashFlights.length > 0) sources.push("amadeus");
  if (awardResults.length > 0) {
    // Check which award providers contributed
    const awardSources = new Set(awardResults.map((a) => a.source));
    const agentSources = new Set(["united", "aa", "delta", "jetblue", "southwest",
      "alaska", "hawaiian", "ba", "lufthansa", "emirates", "singapore", "ana", "cathay",
      "jal", "korean", "thai", "eva", "latam", "avianca", "copa", "aeromexico", "smiles"]);
    for (const src of awardSources) {
      if (agentSources.has(src)) {
        sources.push("airline_agents");
        break;
      }
    }
    // Check for seats.aero sources (they use program names like "united", "aeroplan" too,
    // but also have unique ones like "aeroplan", "flyingblue", etc.)
    const seatsAeroOnlySources = new Set(["aeroplan", "flyingblue", "ba", "emirates",
      "singapore", "qantas", "cathay", "ana", "turkish", "etihad", "avianca", "iberia",
      "lifemiles", "smiles", "copaconnectmiles", "aeromexico"]);
    for (const src of awardSources) {
      if (seatsAeroOnlySources.has(src)) {
        sources.push("seats_aero");
        break;
      }
    }
  }

  // If we have both cash and award data, merge them
  if (cashFlights.length > 0 || awardResults.length > 0) {
    const flights = buildUnifiedResults(cashFlights, awardResults, params.cabin);
    return { flights, sources };
  }

  return { flights: [], sources };
}

/**
 * Legacy path: search Amadeus directly and return raw offers.
 * Used by the API route for backward compatibility with the old transform.
 */
export async function searchAmadeusRaw(
  params: SearchParams,
): Promise<AmadeusFlightOffer[]> {
  if (!amadeusProvider.isAvailable()) return [];
  const { searchFlights } = await import("../amadeus");
  return searchFlights(params);
}

/** Run all providers that support cash flight search. */
async function runCashProviders(
  params: SearchParams,
): Promise<CashFlightResult[]> {
  const cashProviders = providers.filter(
    (p) => p.isAvailable() && p.searchCash,
  );

  if (cashProviders.length === 0) return [];

  const results = await Promise.allSettled(
    cashProviders.map((p) => p.searchCash!(params)),
  );

  const allFlights: CashFlightResult[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allFlights.push(...result.value);
    } else {
      console.error("[aggregator] Cash provider error:", result.reason);
    }
  }

  return allFlights;
}

/** Run all providers that support award availability search. */
async function runAwardProviders(
  params: SearchParams,
): Promise<AwardResult[]> {
  const awardProviders = providers.filter(
    (p) => p.isAvailable() && p.searchAward,
  );

  if (awardProviders.length === 0) return [];

  const results = await Promise.allSettled(
    awardProviders.map((p) => p.searchAward!(params)),
  );

  const allAwards: AwardResult[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allAwards.push(...result.value);
    } else {
      console.error("[aggregator] Award provider error:", result.reason);
    }
  }

  return allAwards;
}
