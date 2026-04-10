import { getAirportRegion } from "./distances";
import type { CabinClass } from "../providers/types";

/**
 * Estimate taxes and fees for an award ticket.
 * Returns amount in cents (USD).
 */
export function estimateTaxes(
  carrier: string,
  origin: string,
  destination: string,
  cabin: CabinClass,
): { amount: number; currency: string; hasHighSurcharges: boolean } {
  // Revenue-based programs: taxes included in points price
  const revenueBasedCarriers = ["WN", "B6"];
  if (revenueBasedCarriers.includes(carrier)) {
    return { amount: 0, currency: "USD", hasHighSurcharges: false };
  }

  const originRegion = getAirportRegion(origin) ?? "US";
  const destRegion = getAirportRegion(destination) ?? "US";
  const routeCategory = classifyRoute(originRegion, destRegion);

  const { baseTaxCents, surcharges, highSurcharges } = getRouteEstimate(
    routeCategory,
    carrier,
    cabin,
  );

  const totalCents = baseTaxCents + surcharges;

  return {
    amount: totalCents,
    currency: "USD",
    hasHighSurcharges: highSurcharges || surcharges > 15000,
  };
}

type RouteCategory =
  | "us-domestic"
  | "us-europe"
  | "us-asia"
  | "us-middle-east"
  | "us-latam"
  | "intra-europe"
  | "other";

function classifyRoute(originRegion: string, destRegion: string): RouteCategory {
  const isUsOrigin = originRegion === "north-america";
  const isUsDest = destRegion === "north-america";

  if (isUsOrigin && isUsDest) return "us-domestic";
  if (isUsOrigin && destRegion === "europe") return "us-europe";
  if (isUsDest && originRegion === "europe") return "us-europe";
  if (isUsOrigin && (destRegion === "asia" || destRegion === "southeast-asia")) return "us-asia";
  if (isUsDest && (originRegion === "asia" || originRegion === "southeast-asia")) return "us-asia";
  if (isUsOrigin && destRegion === "middle-east") return "us-middle-east";
  if (isUsDest && originRegion === "middle-east") return "us-middle-east";
  if (
    isUsOrigin &&
    (destRegion === "caribbean" || destRegion === "central-america" || destRegion === "south-america")
  ) {
    return "us-latam";
  }
  if (
    isUsDest &&
    (originRegion === "caribbean" || originRegion === "central-america" || originRegion === "south-america")
  ) {
    return "us-latam";
  }
  if (originRegion === "europe" && destRegion === "europe") return "intra-europe";

  return "other";
}

function cabinMultiplier(cabin: CabinClass): number {
  switch (cabin) {
    case "economy":
      return 1.0;
    case "premium_economy":
      return 1.2;
    case "business":
      return 1.7;
    case "first":
      return 2.0;
    default:
      return 1.0;
  }
}

function getRouteEstimate(
  route: RouteCategory,
  carrier: string,
  cabin: CabinClass,
): { baseTaxCents: number; surcharges: number; highSurcharges: boolean } {
  const cabinMult = cabinMultiplier(cabin);

  switch (route) {
    case "us-domestic": {
      // $5.60 excise + $4.50 segment fee = ~$10.10
      return {
        baseTaxCents: 1010,
        surcharges: 0,
        highSurcharges: false,
      };
    }

    case "us-europe": {
      const baseTaxCents = 3700; // $37 government taxes
      const surcharges = getUsEuropeSurcharges(carrier, cabinMult);
      return {
        baseTaxCents,
        surcharges,
        highSurcharges: surcharges > 15000,
      };
    }

    case "us-asia": {
      const baseTaxCents = 3700;
      const surcharges = getUsAsiaSurcharges(carrier, cabinMult);
      return {
        baseTaxCents,
        surcharges,
        highSurcharges: surcharges > 15000,
      };
    }

    case "us-middle-east": {
      const baseTaxCents = 3700;
      const surcharges = getUsMiddleEastSurcharges(carrier, cabinMult);
      return {
        baseTaxCents,
        surcharges,
        highSurcharges: surcharges > 15000,
      };
    }

    case "us-latam": {
      // Base $20-40 depending on country, use $30 average
      const baseTaxCents = 3000;
      // Low fuel surcharges for all carriers: $20-40
      const surcharges = Math.round(3000 * cabinMult);
      return {
        baseTaxCents,
        surcharges,
        highSurcharges: false,
      };
    }

    case "intra-europe": {
      const baseTaxCents = 2000; // ~$20 in government taxes
      const surcharges = getIntraEuropeSurcharges(carrier, cabinMult);
      return {
        baseTaxCents,
        surcharges,
        highSurcharges: surcharges > 15000,
      };
    }

    default: {
      // Other international routes
      const baseTaxCents = 3700;
      const surcharges = Math.round(5000 * cabinMult);
      return {
        baseTaxCents,
        surcharges,
        highSurcharges: false,
      };
    }
  }
}

function getUsEuropeSurcharges(carrier: string, cabinMult: number): number {
  switch (carrier) {
    case "BA": {
      // $300-600 depending on cabin
      const base = 30000;
      return Math.round(base * cabinMult);
    }
    case "LH":
    case "LX":
    case "OS": {
      // Lufthansa Group: $200-400
      const base = 20000;
      return Math.round(base * cabinMult);
    }
    case "VS": {
      // Virgin Atlantic: $200-400
      const base = 20000;
      return Math.round(base * cabinMult);
    }
    case "AA":
    case "DL":
    case "UA": {
      // US carriers: $30-60 low surcharges
      const base = 3000;
      return Math.round(base * cabinMult);
    }
    default:
      return Math.round(5000 * cabinMult);
  }
}

function getUsAsiaSurcharges(carrier: string, cabinMult: number): number {
  switch (carrier) {
    case "NH": {
      // ANA: $50-150 moderate
      const base = 5000;
      return Math.round(base * cabinMult);
    }
    case "SQ": {
      // Singapore Airlines: $30-80 low
      const base = 3000;
      return Math.round(base * cabinMult);
    }
    case "CX": {
      // Cathay Pacific: $30-80 low
      const base = 3000;
      return Math.round(base * cabinMult);
    }
    default:
      return Math.round(5000 * cabinMult);
  }
}

function getUsMiddleEastSurcharges(carrier: string, cabinMult: number): number {
  switch (carrier) {
    case "EK": {
      // Emirates: $50-150
      const base = 5000;
      return Math.round(base * cabinMult);
    }
    case "QR": {
      // Qatar Airways: $50-150
      const base = 5000;
      return Math.round(base * cabinMult);
    }
    default:
      return Math.round(5000 * cabinMult);
  }
}

function getIntraEuropeSurcharges(carrier: string, cabinMult: number): number {
  switch (carrier) {
    case "BA": {
      // $50-200
      const base = 5000;
      return Math.round(base * cabinMult);
    }
    case "LH":
    case "LX":
    case "OS": {
      // $50-150
      const base = 5000;
      return Math.round(base * cabinMult);
    }
    default: {
      // Others: $20-50
      const base = 2000;
      return Math.round(base * cabinMult);
    }
  }
}
