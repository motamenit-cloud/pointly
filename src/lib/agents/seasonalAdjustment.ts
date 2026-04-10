import { getAirportRegion, getRouteType } from "./distances";

/**
 * Get a seasonal pricing multiplier for award flights.
 * Returns 0.9 (off-peak) to 1.5 (extreme peak).
 * Considers both date and route-specific factors.
 */
export function getSeasonalMultiplier(
  date: string,
  origin: string,
  destination: string,
): number {
  const parsed = new Date(date + "T00:00:00");
  const month = parsed.getMonth() + 1; // 1-12
  const day = parsed.getDate();

  let multiplier = getBaseSeasonMultiplier(month, day);
  multiplier = applyRouteAdjustment(multiplier, month, day, origin, destination);

  // Clamp to [0.85, 1.5]
  multiplier = Math.max(0.85, Math.min(1.5, multiplier));

  // Round to 2 decimal places
  return Math.round(multiplier * 100) / 100;
}

function getBaseSeasonMultiplier(month: number, day: number): number {
  // Holiday peak (1.5x): Thanksgiving week Nov 20-30, Dec 20-Jan 2
  if (month === 11 && day >= 20 && day <= 30) return 1.5;
  if (month === 12 && day >= 20 && day <= 31) return 1.5;
  if (month === 1 && day >= 1 && day <= 2) return 1.5;

  // Peak (1.3x): Jun 15-Aug 31, Dec 15-Jan 5, Mar 10-Apr 5 (spring break)
  if (month === 1 && day >= 3 && day <= 5) return 1.3;
  if (month === 12 && day >= 15 && day <= 19) return 1.3;
  if (month >= 7 && month <= 8) return 1.3;
  if (month === 6 && day >= 15) return 1.3;
  if (month === 3 && day >= 10) return 1.3;
  if (month === 4 && day >= 1 && day <= 5) return 1.3;

  // Off-peak (0.9x): Jan 6-Feb 28, Nov 1-19, Dec 1-14
  if (month === 1 && day >= 6) return 0.9;
  if (month === 2) return 0.9;
  if (month === 11 && day >= 1 && day <= 19) return 0.9;
  if (month === 12 && day >= 1 && day <= 14) return 0.9;

  // Shoulder (1.1x): May, early June (1-14), September, early October
  if (month === 5) return 1.1;
  if (month === 6 && day >= 1 && day <= 14) return 1.1;
  if (month === 9) return 1.1;
  if (month === 10 && day <= 15) return 1.1;

  // Normal (1.0x): everything else
  return 1.0;
}

function applyRouteAdjustment(
  multiplier: number,
  month: number,
  day: number,
  origin: string,
  destination: string,
): number {
  const originRegion = getAirportRegion(origin) ?? "US";
  const destRegion = getAirportRegion(destination) ?? "US";
  const routeType = getRouteType(origin, destination);

  // Transatlantic summer (Jun-Aug): additional +0.1
  if (
    month >= 6 &&
    month <= 8 &&
    isTransatlantic(originRegion, destRegion)
  ) {
    multiplier += 0.1;
  }

  // Hawaii winter (Dec-Mar): +0.1
  if (
    (month === 12 || month <= 3) &&
    isHawaiiRoute(origin, destination, destRegion)
  ) {
    multiplier += 0.1;
  }

  // Japan cherry blossom (Mar 15-Apr 15): +0.1
  if (isJapanRoute(destRegion, destination)) {
    if (
      (month === 3 && day >= 15) ||
      (month === 4 && day <= 15)
    ) {
      multiplier += 0.1;
    }
  }

  // Ski routes to DEN/SLC/JAC in Dec-Mar: +0.1
  const skiAirports = ["DEN", "SLC", "JAC"];
  if (
    (month === 12 || month <= 3) &&
    skiAirports.includes(destination)
  ) {
    multiplier += 0.1;
  }

  // Caribbean/Mexico winter (Dec-Apr): +0.1
  if (
    (month === 12 || month <= 4) &&
    isCaribbeanMexicoRoute(destRegion)
  ) {
    multiplier += 0.1;
  }

  // Southeast Asia shoulder (Nov-Feb is actually their peak): swap to 1.2x
  if (
    isSoutheastAsiaRoute(destRegion) &&
    (month === 11 || month === 12 || month === 1 || month === 2)
  ) {
    multiplier = Math.max(multiplier, 1.2);
  }

  return multiplier;
}

function isTransatlantic(originRegion: string, destRegion: string): boolean {
  return (
    (originRegion === "north-america" && destRegion === "europe") ||
    (originRegion === "europe" && destRegion === "north-america")
  );
}

function isHawaiiRoute(
  origin: string,
  destination: string,
  destRegion: string,
): boolean {
  const hawaiiAirports = ["HNL", "OGG", "KOA", "LIH"];
  return (
    hawaiiAirports.includes(destination) || hawaiiAirports.includes(origin)
  );
}

function isJapanRoute(destRegion: string, destination: string): boolean {
  const japanAirports = ["NRT", "HND", "KIX", "ITM", "NGO", "FUK", "CTS"];
  return destRegion === "asia" && japanAirports.includes(destination);
}

function isCaribbeanMexicoRoute(destRegion: string): boolean {
  return destRegion === "caribbean" || destRegion === "central-america";
}

function isSoutheastAsiaRoute(destRegion: string): boolean {
  return destRegion === "southeast-asia";
}
