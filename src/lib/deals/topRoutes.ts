/** Curated list of popular international business class routes for deal scanning. */

export interface TopRoute {
  origin: string;
  destination: string;
  /** Estimated average cash business class one-way price in USD */
  cashEstimateUSD: number;
}

export const TOP_ROUTES: TopRoute[] = [
  // ── US → Europe ──────────────────────────────────────────────────────────
  { origin: "JFK", destination: "LHR", cashEstimateUSD: 4000 },
  { origin: "JFK", destination: "CDG", cashEstimateUSD: 3800 },
  { origin: "JFK", destination: "FRA", cashEstimateUSD: 3600 },
  { origin: "JFK", destination: "IST", cashEstimateUSD: 3400 },
  { origin: "JFK", destination: "MAD", cashEstimateUSD: 3500 },
  { origin: "LAX", destination: "CDG", cashEstimateUSD: 4000 },
  { origin: "LAX", destination: "LHR", cashEstimateUSD: 4200 },
  { origin: "ORD", destination: "LHR", cashEstimateUSD: 4200 },
  { origin: "ORD", destination: "FRA", cashEstimateUSD: 3500 },
  { origin: "ORD", destination: "MUC", cashEstimateUSD: 3600 },
  { origin: "MIA", destination: "MAD", cashEstimateUSD: 3800 },
  { origin: "MIA", destination: "LHR", cashEstimateUSD: 4000 },
  { origin: "BOS", destination: "LHR", cashEstimateUSD: 4000 },
  { origin: "DFW", destination: "LHR", cashEstimateUSD: 4200 },
  { origin: "ATL", destination: "LHR", cashEstimateUSD: 4000 },
  { origin: "SEA", destination: "LHR", cashEstimateUSD: 4400 },

  // ── US → Asia-Pacific ─────────────────────────────────────────────────────
  { origin: "JFK", destination: "NRT", cashEstimateUSD: 5000 },
  { origin: "JFK", destination: "SIN", cashEstimateUSD: 6000 },
  { origin: "JFK", destination: "HKG", cashEstimateUSD: 5200 },
  { origin: "LAX", destination: "NRT", cashEstimateUSD: 4500 },
  { origin: "LAX", destination: "SYD", cashEstimateUSD: 6500 },
  { origin: "LAX", destination: "HKG", cashEstimateUSD: 5000 },
  { origin: "LAX", destination: "SIN", cashEstimateUSD: 5500 },
  { origin: "LAX", destination: "ICN", cashEstimateUSD: 4800 },
  { origin: "LAX", destination: "BKK", cashEstimateUSD: 5200 },
  { origin: "SFO", destination: "NRT", cashEstimateUSD: 4500 },
  { origin: "SFO", destination: "ICN", cashEstimateUSD: 4800 },
  { origin: "SFO", destination: "SIN", cashEstimateUSD: 5500 },
  { origin: "ORD", destination: "NRT", cashEstimateUSD: 4800 },
  { origin: "ORD", destination: "SIN", cashEstimateUSD: 5800 },
  { origin: "SEA", destination: "NRT", cashEstimateUSD: 4600 },

  // ── US → Middle East ─────────────────────────────────────────────────────
  { origin: "JFK", destination: "DXB", cashEstimateUSD: 5200 },
  { origin: "LAX", destination: "DXB", cashEstimateUSD: 5500 },
  { origin: "JFK", destination: "DOH", cashEstimateUSD: 5000 },

  // ── US → Latin America ───────────────────────────────────────────────────
  { origin: "JFK", destination: "GRU", cashEstimateUSD: 4500 },
  { origin: "JFK", destination: "EZE", cashEstimateUSD: 4800 },
  { origin: "JFK", destination: "LIM", cashEstimateUSD: 3800 },
  { origin: "MIA", destination: "GRU", cashEstimateUSD: 4200 },
  { origin: "MIA", destination: "BOG", cashEstimateUSD: 3200 },
  { origin: "MIA", destination: "EZE", cashEstimateUSD: 4500 },
  { origin: "LAX", destination: "SCL", cashEstimateUSD: 4600 },
  { origin: "ORD", destination: "MEX", cashEstimateUSD: 2800 },
  { origin: "DFW", destination: "MEX", cashEstimateUSD: 2600 },
];

/** Top international destinations used to build home-airport routes dynamically. */
export const TOP_DESTINATIONS = [
  // Europe
  "LHR", "CDG", "FRA", "AMS", "IST", "FCO", "MAD", "BCN",
  // Asia
  "NRT", "HND", "SIN", "HKG", "ICN", "BKK", "SYD",
  // Middle East
  "DXB", "DOH",
  // Latin America
  "GRU", "EZE", "BOG",
] as const;

/** Origins already covered by TOP_ROUTES — home airport routes only added if NOT in this set. */
export const PRIMARY_ORIGINS = new Set(["JFK", "LAX", "ORD", "SFO", "ATL", "MIA", "DFW", "BOS", "SEA"]);

/** Default cash estimate for dynamically added home-airport routes. */
export const HOME_AIRPORT_CASH_ESTIMATE_USD = 4000;
