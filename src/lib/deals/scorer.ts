import type { FlightResult } from "@/components/search/FlightResultCard";
import type { TopRoute } from "./topRoutes";

export type CppBadge = "sweet-spot" | "best-value" | "good" | null;

export interface ScoredDeal extends FlightResult {
  cpp: number;
  cppBadge: CppBadge;
  cashEstimateUSD: number;
}

/**
 * Score a single redemption by cents-per-point value.
 * cashTax is USD (same as FlightResult.cashTax).
 */
export function scoreDeal(
  points: number,
  taxesUSD: number,
  cashEstimateUSD: number,
): { cpp: number; badge: CppBadge } {
  if (points <= 0) return { cpp: 0, badge: null };
  const netValue = Math.max(0, cashEstimateUSD - taxesUSD);
  const cpp = Math.round((netValue * 100 / points) * 100) / 100; // 2 dp
  const badge: CppBadge =
    cpp >= 4.0 ? "sweet-spot" :
    cpp >= 3.0 ? "best-value" :
    cpp >= 2.0 ? "good" :
    null;
  return { cpp, badge };
}

/**
 * Given all FlightResults for a route, pick the one with the highest CPP.
 * Ties broken by fewest points.
 */
export function pickBestForRoute(
  flights: FlightResult[],
  route: TopRoute,
): ScoredDeal | null {
  let best: ScoredDeal | null = null;
  for (const flight of flights) {
    if (flight.bestPoints <= 0) continue;
    const { cpp, badge } = scoreDeal(
      flight.bestPoints,
      flight.cashTax,
      route.cashEstimateUSD,
    );
    if (cpp <= 0) continue;
    const scored: ScoredDeal = {
      ...flight,
      cpp,
      cppBadge: badge,
      cashEstimateUSD: route.cashEstimateUSD,
    };
    if (
      !best ||
      cpp > best.cpp ||
      (cpp === best.cpp && flight.bestPoints < best.bestPoints)
    ) {
      best = scored;
    }
  }
  return best;
}

/**
 * Sort deals by CPP descending, cap at maxDeals.
 */
export function rankDeals(deals: ScoredDeal[], maxDeals = 30): ScoredDeal[] {
  return [...deals]
    .sort((a, b) => b.cpp - a.cpp || a.bestPoints - b.bestPoints)
    .slice(0, maxDeals);
}
