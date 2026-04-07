/**
 * Types for airline award search agents.
 *
 * Each agent knows how to query a specific airline's award availability
 * and return normalized AwardResult[].
 */

import type { AwardResult, CabinClass, SearchParams } from "../providers/types";

/** Configuration for an airline agent. */
export interface AirlineAgentConfig {
  /** IATA carrier code (e.g. "AA", "DL"). */
  carrierCode: string;
  /** Airline display name. */
  airlineName: string;
  /** Loyalty program key matching CARRIER_TO_PROGRAM (e.g. "aa", "delta"). */
  programKey: string;
  /** Loyalty program display name. */
  programName: string;
}

/** Interface that all airline award search agents implement. */
export interface AirlineAgent {
  readonly config: AirlineAgentConfig;
  /** Whether this agent can run (has required credentials/config). */
  isAvailable(): boolean;
  /** Search for award availability on this airline. */
  searchAward(params: SearchParams): Promise<AwardResult[]>;
}

/**
 * Configuration for revenue-based agents (Southwest, JetBlue).
 * These calculate award costs from cash prices using a fixed CPP value.
 */
export interface RevenueProgramConfig extends AirlineAgentConfig {
  /** Cents-per-point value for this program. */
  centsPerPoint: number;
}

/** Cabin-specific award chart entry for fixed-chart programs. */
export interface AwardChartEntry {
  /** Minimum distance (miles) for this tier. 0 = no minimum. */
  minDistance: number;
  /** Maximum distance (miles) for this tier. Infinity = no cap. */
  maxDistance: number;
  /** Miles/points required. */
  mileageCost: number;
}

/** Award chart organized by cabin class. */
export type AwardChart = Record<CabinClass, AwardChartEntry[]>;
