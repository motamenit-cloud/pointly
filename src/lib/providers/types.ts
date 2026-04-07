/** Shared types for the flight provider aggregation layer. */

export interface SearchParams {
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  cabin: string; // "economy" | "premium economy" | "business" | "first"
  passengers: number;
}

/** Cabin class keys used across providers. */
export type CabinClass = "economy" | "premium_economy" | "business" | "first";

/** Map user-facing cabin names to a normalized key. */
export const CABIN_NORMALIZE: Record<string, CabinClass> = {
  economy: "economy",
  "premium economy": "premium_economy",
  business: "business",
  first: "first",
};

/** Cash flight result from providers like Amadeus. */
export interface CashFlightResult {
  carrierCode: string;
  flightNumbers: string[]; // e.g. ["BA 178"] or ["AF 22", "AF 1680"]
  origin: string;
  destination: string;
  departureAt: string; // ISO datetime
  arrivalAt: string;
  durationISO: string; // "PT7H15M"
  segments: CashSegment[];
  cashPrice: number; // USD
  basePrice: number; // USD (before taxes)
  currency: string;
  cabin: string;
  aircraft?: string;
  rawOffer: unknown; // original provider response for pass-through
}

export interface CashSegment {
  carrierCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  duration: string;
  aircraft?: string;
  cabin?: string;
  fareClass?: string;
}

/** Award availability result from providers like Seats.aero. */
export interface AwardResult {
  /** Mileage program that prices this award (e.g. "united", "aeroplan"). */
  source: string;
  /** Display name for the source program. */
  sourceName: string;
  carrierCodes: string[]; // airlines operating the flight(s)
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  cabin: CabinClass;
  mileageCost: number;
  taxes: number; // in cents or minor currency unit
  taxesCurrency: string;
  remainingSeats: number;
  isDirect: boolean;
  /** Unique availability ID from the provider (for fetching trip details). */
  availabilityId?: string;
  /** How this result was obtained: live scrape, cached scrape, or static estimate. */
  dataQuality?: "live" | "cached" | "estimated";
  /** ISO timestamp of when this data was scraped (for live/cached results). */
  scrapedAt?: string;
}

/** Interface that all flight data providers implement. */
export interface FlightProvider {
  name: string;
  /** Whether this provider has valid credentials and can be called. */
  isAvailable(): boolean;
  /** Search for cash-priced flights. Not all providers support this. */
  searchCash?(params: SearchParams): Promise<CashFlightResult[]>;
  /** Search for award availability. Not all providers support this. */
  searchAward?(params: SearchParams): Promise<AwardResult[]>;
}
