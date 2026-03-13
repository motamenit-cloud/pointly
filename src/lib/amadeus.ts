import Amadeus from "amadeus";

let client: Amadeus | null = null;

function getClient(): Amadeus | null {
  if (client) return client;
  const clientId = process.env.AMADEUS_API_KEY;
  const clientSecret = process.env.AMADEUS_API_SECRET;
  if (!clientId || !clientSecret) return null;

  client = new Amadeus({ clientId, clientSecret });
  return client;
}

const CABIN_MAP: Record<string, string> = {
  economy: "ECONOMY",
  "premium economy": "PREMIUM_ECONOMY",
  business: "BUSINESS",
  first: "FIRST",
};

export interface AmadeusSearchParams {
  origin: string;
  destination: string;
  date: string;
  cabin: string;
  passengers: number;
}

export interface AmadeusFlightOffer {
  id: string;
  itineraries: Array<{
    duration: string; // "PT7H15M"
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
      aircraft: { code: string };
      duration: string;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  travelerPricings: Array<{
    fareDetailsBySegment: Array<{
      cabin: string;
      class: string;
    }>;
  }>;
  validatingAirlineCodes: string[];
}

export async function searchFlights(
  params: AmadeusSearchParams,
): Promise<AmadeusFlightOffer[]> {
  const amadeus = getClient();
  if (!amadeus) return [];

  const travelClass = CABIN_MAP[params.cabin.toLowerCase()] || "ECONOMY";

  const response = await amadeus.shopping.flightOffersSearch.get({
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.date,
    adults: params.passengers,
    travelClass,
    max: 20,
    currencyCode: "USD",
    nonStop: false,
  });

  return (response.data as AmadeusFlightOffer[]) || [];
}
