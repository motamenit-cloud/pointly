/** Curated list of popular international business class routes for deal scanning. */

export interface TopRoute {
  origin: string;
  destination: string;
  /** Estimated average cash business class round-trip price in USD */
  cashEstimateUSD: number;
}

export const TOP_ROUTES: TopRoute[] = [
  { origin: "JFK", destination: "LHR", cashEstimateUSD: 4000 },
  { origin: "JFK", destination: "CDG", cashEstimateUSD: 3800 },
  { origin: "JFK", destination: "NRT", cashEstimateUSD: 5000 },
  { origin: "JFK", destination: "SIN", cashEstimateUSD: 6000 },
  { origin: "JFK", destination: "DXB", cashEstimateUSD: 5200 },
  { origin: "JFK", destination: "GRU", cashEstimateUSD: 4500 },
  { origin: "LAX", destination: "NRT", cashEstimateUSD: 4500 },
  { origin: "LAX", destination: "SYD", cashEstimateUSD: 6500 },
  { origin: "LAX", destination: "HKG", cashEstimateUSD: 5000 },
  { origin: "LAX", destination: "SIN", cashEstimateUSD: 5500 },
  { origin: "LAX", destination: "ICN", cashEstimateUSD: 4800 },
  { origin: "SFO", destination: "NRT", cashEstimateUSD: 4500 },
  { origin: "ORD", destination: "LHR", cashEstimateUSD: 4200 },
  { origin: "ORD", destination: "FRA", cashEstimateUSD: 3500 },
  { origin: "ATL", destination: "LHR", cashEstimateUSD: 4000 },
];

/** Top international destinations used to build home-airport routes dynamically. */
export const TOP_DESTINATIONS = [
  "LHR", "CDG", "NRT", "SIN", "DXB", "SYD", "HKG", "FRA", "ICN", "GRU",
] as const;

/** Origins already covered by TOP_ROUTES — home airport routes only added if NOT in this set. */
export const PRIMARY_ORIGINS = new Set(["JFK", "LAX", "ORD", "SFO", "ATL"]);

/** Default cash estimate for dynamically added home-airport routes. */
export const HOME_AIRPORT_CASH_ESTIMATE_USD = 4000;
