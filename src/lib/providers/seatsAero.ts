// seats.aero is optional — only active when SEATS_AERO_API_KEY is set.
// Remove the env var to use AI-only deal research instead.
import type {
  FlightProvider,
  SearchParams,
  AwardResult,
  CabinClass,
} from "./types";

/* ── Seats.aero Cached Search response types ── */

interface SeatsAeroRoute {
  ID: string;
  OriginAirport: string;
  DestinationAirport: string;
  OriginRegion: string;
  DestinationRegion: string;
  NumDaysOut: number;
  Distance: number;
  Source: string;
}

interface SeatsAeroAvailability {
  ID: string;
  RouteID: string;
  Route: SeatsAeroRoute;
  Date: string; // "YYYY-MM-DD"
  ParsedDate: string; // ISO 8601

  // Per-cabin availability flags
  YAvailable: boolean;
  WAvailable: boolean;
  JAvailable: boolean;
  FAvailable: boolean;

  // Per-cabin mileage costs (string numbers, e.g. "50000")
  YMileageCost: string;
  WMileageCost: string;
  JMileageCost: string;
  FMileageCost: string;

  // Per-cabin remaining seats
  YRemainingSeats: number;
  WRemainingSeats: number;
  JRemainingSeats: number;
  FRemainingSeats: number;

  // Per-cabin airline codes (comma-separated)
  YAirlines: string;
  WAirlines: string;
  JAirlines: string;
  FAirlines: string;

  // Per-cabin direct flight flags
  YDirect: boolean;
  WDirect: boolean;
  JDirect: boolean;
  FDirect: boolean;

  Source: string; // mileage program key, e.g. "united", "aeroplan"
  CreatedAt: string;
  UpdatedAt: string;
}

interface SeatsAeroCachedSearchResponse {
  data: SeatsAeroAvailability[];
  count: number;
  hasMore: boolean;
  cursor: number;
}

/* ── Cabin mapping ── */

const CABIN_TO_SEATS_AERO: Record<string, string> = {
  economy: "economy",
  premium_economy: "premium",
  business: "business",
  first: "first",
};

/** Map Seats.aero source keys to human-readable names. */
const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  united: "United MileagePlus",
  aeroplan: "Air Canada Aeroplan",
  delta: "Delta SkyMiles",
  american: "American Airlines AAdvantage",
  alaska: "Alaska Airlines Mileage Plan",
  virginatlantic: "Virgin Atlantic Flying Club",
  flyingblue: "Air France-KLM Flying Blue",
  ba: "British Airways Avios",
  emirates: "Emirates Skywards",
  singapore: "Singapore KrisFlyer",
  qantas: "Qantas Frequent Flyer",
  cathay: "Cathay Pacific Asia Miles",
  ana: "ANA Mileage Club",
  turkish: "Turkish Airlines Miles&Smiles",
  etihad: "Etihad Guest",
  avianca: "Avianca LifeMiles",
  iberia: "Iberia Plus",
  jetblue: "JetBlue TrueBlue",
  southwest: "Southwest Rapid Rewards",
  qatar: "Qatar Airways Privilege Club",
  lifemiles: "Avianca LifeMiles",
  smiles: "GOL Smiles",
  copaconnectmiles: "Copa ConnectMiles",
  aeromexico: "Aeromexico Club Premier",
};

/* ── Provider ── */

const BASE_URL = "https://seats.aero/partnerapi";

export const seatsAeroProvider: FlightProvider = {
  name: "seats_aero",

  isAvailable(): boolean {
    return !!process.env.SEATS_AERO_API_KEY;
  },

  async searchAward(params: SearchParams): Promise<AwardResult[]> {
    const apiKey = process.env.SEATS_AERO_API_KEY;
    if (!apiKey) return [];

    const cabinKey =
      CABIN_TO_SEATS_AERO[params.cabin.toLowerCase().replace(" ", "_")] ||
      "economy";

    const url = new URL(`${BASE_URL}/search`);
    url.searchParams.set("origin_airport", params.origin);
    url.searchParams.set("destination_airport", params.destination);
    url.searchParams.set("start_date", params.date);
    url.searchParams.set("end_date", params.date);
    url.searchParams.set("cabins", cabinKey);
    url.searchParams.set("take", "100");

    const response = await fetch(url.toString(), {
      headers: {
        "Partner-Authorization": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `[seats.aero] Search failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const json: SeatsAeroCachedSearchResponse = await response.json();

    if (!json.data || json.data.length === 0) return [];

    return json.data.flatMap((avail) =>
      extractAwardResults(avail, params.date),
    );
  },
};

/* ── Helpers ── */

interface CabinConfig {
  cabin: CabinClass;
  available: boolean;
  mileageCost: string;
  remainingSeats: number;
  airlines: string;
  direct: boolean;
}

function extractAwardResults(
  avail: SeatsAeroAvailability,
  date: string,
): AwardResult[] {
  const cabins: CabinConfig[] = [
    {
      cabin: "economy",
      available: avail.YAvailable,
      mileageCost: avail.YMileageCost,
      remainingSeats: avail.YRemainingSeats,
      airlines: avail.YAirlines,
      direct: avail.YDirect,
    },
    {
      cabin: "premium_economy",
      available: avail.WAvailable,
      mileageCost: avail.WMileageCost,
      remainingSeats: avail.WRemainingSeats,
      airlines: avail.WAirlines,
      direct: avail.WDirect,
    },
    {
      cabin: "business",
      available: avail.JAvailable,
      mileageCost: avail.JMileageCost,
      remainingSeats: avail.JRemainingSeats,
      airlines: avail.JAirlines,
      direct: avail.JDirect,
    },
    {
      cabin: "first",
      available: avail.FAvailable,
      mileageCost: avail.FMileageCost,
      remainingSeats: avail.FRemainingSeats,
      airlines: avail.FAirlines,
      direct: avail.FDirect,
    },
  ];

  const results: AwardResult[] = [];

  for (const c of cabins) {
    if (!c.available) continue;

    const cost = parseInt(c.mileageCost, 10);
    if (!cost || cost <= 0) continue;

    const carrierCodes = c.airlines
      ? c.airlines.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    results.push({
      source: avail.Source,
      sourceName:
        SOURCE_DISPLAY_NAMES[avail.Source] || avail.Source,
      carrierCodes,
      origin: avail.Route.OriginAirport,
      destination: avail.Route.DestinationAirport,
      date,
      cabin: c.cabin,
      mileageCost: cost,
      taxes: 0, // cached search doesn't include tax detail
      taxesCurrency: "USD",
      remainingSeats: c.remainingSeats || 0,
      isDirect: c.direct,
      availabilityId: avail.ID,
    });
  }

  return results;
}
