/**
 * Airline agent registry.
 *
 * All airline award search agents are registered here and exposed as a single
 * FlightProvider that plugs into the aggregator.
 */

import type { FlightProvider, SearchParams, AwardResult } from "../providers/types";
import type { AirlineAgent } from "./types";
import { americanAgent } from "./americanAgent";
import { deltaAgent } from "./deltaAgent";
import { unitedAgent } from "./unitedAgent";
import { jetblueAgent } from "./jetblueAgent";
import { southwestAgent } from "./southwestAgent";

/** All registered airline agents. Add new agents here. */
const AGENTS: AirlineAgent[] = [
  americanAgent,
  deltaAgent,
  unitedAgent,
  jetblueAgent,
  southwestAgent,
];

/**
 * FlightProvider that runs all airline agents in parallel.
 * Plugs directly into the existing aggregator alongside Amadeus and Seats.aero.
 */
export const airlineAgentsProvider: FlightProvider = {
  name: "airline_agents",

  isAvailable(): boolean {
    return AGENTS.some((agent) => agent.isAvailable());
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const available = AGENTS.filter((a) => a.isAvailable());
    if (available.length === 0) return [];

    const results = await Promise.allSettled(
      available.map((agent) => agent.searchAward(params)),
    );

    const allAwards: AwardResult[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled") {
        allAwards.push(...result.value);
      } else {
        console.error(
          `[agents] ${available[i].config.airlineName} agent failed:`,
          result.reason,
        );
      }
    }

    return allAwards;
  },
};

/** Get list of all registered agents (for debugging/admin). */
export function getRegisteredAgents(): AirlineAgent[] {
  return [...AGENTS];
}

/** Get a specific agent by carrier code. */
export function getAgentByCarrier(carrierCode: string): AirlineAgent | undefined {
  return AGENTS.find((a) => a.config.carrierCode === carrierCode);
}
