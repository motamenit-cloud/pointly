import type { FlightResult } from "@/components/search/FlightResultCard";
import type { AmadeusFlightOffer } from "./amadeus";
import { AIRLINE_NAMES, AIRLINE_COLORS } from "./airlineMetadata";
import { estimateAwardCost, buildTransferOptions } from "./pointsEngine";

/** Parse ISO 8601 duration "PT7H15M" → "7h 15m" */
function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] || "0";
  const m = match[2] || "0";
  return `${h}h ${m}m`;
}

/** Format "2026-03-04T19:30:00" → "7:30 PM" */
function formatTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

/** Check if arrival is next day */
function getArrivalSuffix(depStr: string, arrStr: string): string {
  const dep = new Date(depStr);
  const arr = new Date(arrStr);
  const dayDiff = Math.floor(
    (arr.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (dayDiff >= 1) return `+${dayDiff}`;
  return "";
}

export function transformAmadeusToFlightResults(
  offers: AmadeusFlightOffer[],
  cabin: string,
): FlightResult[] {
  const flights: FlightResult[] = offers.map((offer, index) => {
    const itinerary = offer.itineraries[0];
    const segments = itinerary.segments;
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];
    const carrierCode =
      offer.validatingAirlineCodes?.[0] || firstSeg.carrierCode;

    const flightNumbers = segments
      .map((s) => `${s.carrierCode} ${s.number}`)
      .join(" → ");
    const stops = segments.length - 1;
    const stopCity =
      stops > 0
        ? segments
            .slice(0, -1)
            .map((s) => s.arrival.iataCode)
            .join(", ")
        : undefined;

    const cashPrice = parseFloat(offer.price.total);
    const taxes = cashPrice - parseFloat(offer.price.base);
    const estimatedPoints = estimateAwardCost(cashPrice, cabin);
    const transferOptions = buildTransferOptions(carrierCode, estimatedPoints);

    const bestOption = transferOptions[0];
    const arrivalSuffix = getArrivalSuffix(
      firstSeg.departure.at,
      lastSeg.arrival.at,
    );

    // Determine actual cabin from fare details
    const fareDetail =
      offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
    const actualCabin = fareDetail?.cabin
      ? fareDetail.cabin.charAt(0) + fareDetail.cabin.slice(1).toLowerCase()
      : cabin.charAt(0).toUpperCase() + cabin.slice(1);

    return {
      id: offer.id || String(index),
      airline: AIRLINE_NAMES[carrierCode] || carrierCode,
      airlineCode: carrierCode,
      airlineColor: AIRLINE_COLORS[carrierCode] || "#333333",
      flightNumber: flightNumbers,
      departureTime: formatTime(firstSeg.departure.at),
      arrivalTime:
        formatTime(lastSeg.arrival.at) +
        (arrivalSuffix ? arrivalSuffix : ""),
      departureAirport: firstSeg.departure.iataCode,
      arrivalAirport: lastSeg.arrival.iataCode,
      duration: formatDuration(itinerary.duration),
      stops,
      stopCity,
      cabin: actualCabin,
      aircraft: firstSeg.aircraft?.code || undefined,
      bestPoints: bestOption?.points || estimatedPoints,
      bestProgram: bestOption?.program || carrierCode,
      cashTax: Math.round(taxes > 0 ? taxes : cashPrice * 0.15),
      transferOptions,
    };
  });

  // Assign badges
  if (flights.length > 0) {
    // Lowest points
    const lowestIdx = flights.reduce(
      (minI, f, i) => (f.bestPoints < flights[minI].bestPoints ? i : minI),
      0,
    );
    flights[lowestIdx].badge = "lowest-points";

    // Fastest (shortest duration)
    const fastestIdx = flights.reduce((minI, f, i) => {
      const parse = (d: string) => {
        const h = parseInt(d) || 0;
        const m = parseInt(d.split("h")[1]) || 0;
        return h * 60 + m;
      };
      return parse(f.duration) < parse(flights[minI].duration) ? i : minI;
    }, 0);
    if (fastestIdx !== lowestIdx) {
      flights[fastestIdx].badge = "fastest";
    }

    // Best deal — lowest points that also has good transfer options
    const bestDealIdx = flights.reduce((bestI, f, i) => {
      if (i === lowestIdx || i === fastestIdx) return bestI;
      const score = f.bestPoints + f.cashTax * 100;
      const bestScore = flights[bestI].bestPoints + flights[bestI].cashTax * 100;
      return score < bestScore ? i : bestI;
    }, flights.findIndex((_, i) => i !== lowestIdx && i !== fastestIdx));
    if (bestDealIdx >= 0 && bestDealIdx !== lowestIdx && bestDealIdx !== fastestIdx) {
      flights[bestDealIdx].badge = "best-deal";
    }
  }

  return flights;
}
