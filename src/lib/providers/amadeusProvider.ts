import type {
  FlightProvider,
  SearchParams,
  CashFlightResult,
  CashSegment,
} from "./types";
import { searchFlights, type AmadeusFlightOffer } from "../amadeus";

export const amadeusProvider: FlightProvider = {
  name: "amadeus",

  isAvailable(): boolean {
    return !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
  },

  async searchCash(params: SearchParams): Promise<CashFlightResult[]> {
    const offers = await searchFlights({
      origin: params.origin,
      destination: params.destination,
      date: params.date,
      cabin: params.cabin,
      passengers: params.passengers,
    });

    return offers.map((offer) => transformOffer(offer));
  },
};

function transformOffer(offer: AmadeusFlightOffer): CashFlightResult {
  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments;
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  const carrierCode =
    offer.validatingAirlineCodes?.[0] || firstSeg.carrierCode;

  const fareDetail = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];

  const cashSegments: CashSegment[] = segments.map((seg) => ({
    carrierCode: seg.carrierCode,
    flightNumber: `${seg.carrierCode} ${seg.number}`,
    origin: seg.departure.iataCode,
    destination: seg.arrival.iataCode,
    departureAt: seg.departure.at,
    arrivalAt: seg.arrival.at,
    duration: seg.duration,
    aircraft: seg.aircraft?.code,
    cabin: fareDetail?.cabin,
    fareClass: fareDetail?.class,
  }));

  return {
    carrierCode,
    flightNumbers: segments.map((s) => `${s.carrierCode} ${s.number}`),
    origin: firstSeg.departure.iataCode,
    destination: lastSeg.arrival.iataCode,
    departureAt: firstSeg.departure.at,
    arrivalAt: lastSeg.arrival.at,
    durationISO: itinerary.duration,
    segments: cashSegments,
    cashPrice: parseFloat(offer.price.total),
    basePrice: parseFloat(offer.price.base),
    currency: offer.price.currency,
    cabin: fareDetail?.cabin || "ECONOMY",
    aircraft: firstSeg.aircraft?.code,
    rawOffer: offer,
  };
}
