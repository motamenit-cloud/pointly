import { getAirportCoords } from "./airportData";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AirportRegion =
  | "US"
  | "EU"
  | "ASIA"
  | "LATAM"
  | "OCEANIA"
  | "ME"
  | "AFRICA";

export type RouteType =
  | "domestic_short" // < 1000mi, same country
  | "domestic_long" // >= 1000mi, same country
  | "transatlantic" // US <-> Europe
  | "transpacific" // US <-> Asia/Oceania
  | "latin_america" // US <-> LATAM
  | "middle_east" // US <-> ME
  | "intra_europe" // EU <-> EU
  | "intra_asia" // Asia <-> Asia
  | "europe_asia" // EU <-> Asia
  | "international"; // catch-all for other international

// ─── Constants ───────────────────────────────────────────────────────────────

const EARTH_RADIUS_MILES = 3959;

/** Airports that need explicit region overrides (geo-ambiguous locations) */
const REGION_OVERRIDES: Record<string, AirportRegion> = {
  // Turkey straddles Europe/Asia — classify as EU
  IST: "EU",
  SAW: "EU",
  // Hawaii and Alaska are US
  HNL: "US",
  OGG: "US",
  KOA: "US",
  LIH: "US",
  ANC: "US",
  FAI: "US",
  // Egypt — geographically Africa
  CAI: "AFRICA",
  // Morocco — Africa
  CMN: "AFRICA",
  // US territories in Caribbean
  STT: "US",
  // Israel — classify as ME
  TLV: "ME",
  // French Polynesia — Oceania
  PPT: "OCEANIA",
};

// ─── Haversine Distance ──────────────────────────────────────────────────────

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate great-circle distance in miles using the Haversine formula.
 * Returns null if either airport code is unknown.
 */
export function calculateDistance(
  origin: string,
  destination: string
): number | null {
  const p1 = getAirportCoords(origin);
  const p2 = getAirportCoords(destination);

  if (!p1 || !p2) return null;

  const lat1 = toRadians(p1.lat);
  const lat2 = toRadians(p2.lat);
  const dLat = toRadians(p2.lat - p1.lat);
  const dLng = toRadians(p2.lng - p1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

// ─── Region Detection ────────────────────────────────────────────────────────

/**
 * Get the geographic region for an airport based on its coordinates.
 * Uses explicit overrides for ambiguous airports, then falls back to
 * latitude/longitude bounding boxes.
 */
export function getAirportRegion(iata: string): AirportRegion | null {
  const code = iata.toUpperCase().trim();

  // Check explicit overrides first
  if (REGION_OVERRIDES[code]) {
    return REGION_OVERRIDES[code];
  }

  const coords = getAirportCoords(code);
  if (!coords) return null;

  const { lat, lng } = coords;

  // US mainland + Alaska (longitude-based, latitude > 24 to exclude Caribbean)
  if (lat > 24 && lat < 72 && lng > -170 && lng < -60) {
    return "US";
  }

  // Europe: lat 35-72, lng -25 to 40 (excludes Turkey which is overridden)
  if (lat > 35 && lat < 72 && lng > -25 && lng < 40) {
    return "EU";
  }

  // Middle East: lat 12-35, lng 34-60
  if (lat > 12 && lat < 35 && lng > 34 && lng < 60) {
    return "ME";
  }

  // Asia: lat -10 to 65, lng 60-180
  if (lat > -10 && lat < 65 && lng > 60 && lng <= 180) {
    return "ASIA";
  }

  // Oceania: lat -50 to 0, lng 100-180 (Australia, NZ, Pacific)
  if (lat > -50 && lat < 0 && lng > 100 && lng <= 180) {
    return "OCEANIA";
  }

  // Africa: lat -35 to 35, lng -20 to 55 (broad box, after ME is excluded)
  if (lat > -35 && lat < 35 && lng > -20 && lng < 55) {
    // Disambiguate from ME — if lng > 34 it was already caught above
    return "AFRICA";
  }

  // Latin America & Caribbean: lat -55 to 24, lng -120 to -30
  if (lat > -55 && lat < 24 && lng > -120 && lng < -30) {
    return "LATAM";
  }

  // Mexico: lat 14-33, lng -118 to -86
  if (lat > 14 && lat < 33 && lng > -118 && lng < -86) {
    return "LATAM";
  }

  // Caribbean region that might overlap with US longitude
  if (lat > 10 && lat < 26 && lng > -90 && lng < -59) {
    return "LATAM";
  }

  // Pacific Oceania (negative longitude, e.g., PPT is overridden)
  if (lat > -30 && lat < 0 && lng > 150 && lng <= 180) {
    return "OCEANIA";
  }

  // Fallback — shouldn't normally reach here with the override table
  return null;
}

// ─── Route Classification ────────────────────────────────────────────────────

/**
 * Classify a route by type based on origin/destination regions and distance.
 * Falls back to "international" for any route that doesn't match a specific type.
 */
export function getRouteType(origin: string, destination: string): RouteType {
  const regionA = getAirportRegion(origin);
  const regionB = getAirportRegion(destination);
  const dist = calculateDistance(origin, destination);

  // If we can't determine regions, default to international
  if (!regionA || !regionB) return "international";

  // Sort regions for easier pair matching
  const pair = [regionA, regionB].sort().join("-") as string;

  // Same region — domestic or intra-regional
  if (regionA === regionB) {
    switch (regionA) {
      case "US":
        return dist !== null && dist < 1000
          ? "domestic_short"
          : "domestic_long";
      case "EU":
        return "intra_europe";
      case "ASIA":
        return "intra_asia";
      default:
        return "international";
    }
  }

  // Cross-region pairs
  switch (pair) {
    case "EU-US":
      return "transatlantic";

    case "ASIA-US":
    case "OCEANIA-US":
      return "transpacific";

    case "LATAM-US":
      return "latin_america";

    case "ME-US":
      return "middle_east";

    case "ASIA-EU":
      return "europe_asia";

    default:
      return "international";
  }
}
