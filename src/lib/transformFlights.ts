import type { FlightResult } from "@/components/search/FlightResultCard";
import type { AmadeusFlightOffer } from "./amadeus";
import type { AwardResult, CashFlightResult } from "./providers/types";
import { AIRLINE_NAMES, AIRLINE_COLORS } from "./airlineMetadata";
import { estimateAwardCost, buildTransferOptions } from "./pointsEngine";
import { CARRIER_TO_PROGRAM } from "./transferPartners";

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

/**
 * Transform Amadeus offers into FlightResults (legacy path, still used as fallback).
 */
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
    // Mark all as estimated
    for (const opt of transferOptions) {
      opt.isEstimated = true;
    }

    const bestOption = transferOptions[0];
    const arrivalSuffix = getArrivalSuffix(
      firstSeg.departure.at,
      lastSeg.arrival.at,
    );

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
      dataSource: "amadeus",
      isEstimated: true,
    };
  });

  assignBadges(flights);
  return flights;
}

/**
 * Build unified FlightResults from cash flights + award availability.
 * Merges award data into cash flights where carriers match,
 * and creates award-only results for unmatched awards.
 */
export function buildUnifiedResults(
  cashFlights: CashFlightResult[],
  awardResults: AwardResult[],
  cabin: string,
): FlightResult[] {
  const flights: FlightResult[] = [];

  // Index award results by carrier code for matching
  const awardsByCarrier = new Map<string, AwardResult[]>();
  for (const award of awardResults) {
    for (const carrier of award.carrierCodes) {
      const existing = awardsByCarrier.get(carrier) || [];
      existing.push(award);
      awardsByCarrier.set(carrier, existing);
    }
  }

  const matchedAwardIds = new Set<string>();

  // Process cash flights and merge with matching award data
  for (let i = 0; i < cashFlights.length; i++) {
    const cash = cashFlights[i];
    const matchingAwards = awardsByCarrier.get(cash.carrierCode) || [];

    // Find best matching award (same carrier, same route)
    const bestAward = matchingAwards.find(
      (a) => a.origin === cash.origin && a.destination === cash.destination,
    );

    if (bestAward) {
      matchedAwardIds.add(bestAward.availabilityId || bestAward.source + bestAward.mileageCost);
    }

    flights.push(
      buildFlightResult(cash, bestAward, cabin, `cash-${i}`),
    );
  }

  // Create award-only results for unmatched awards
  const seenAwards = new Set<string>();
  for (const award of awardResults) {
    const awardKey = award.availabilityId || award.source + award.mileageCost;
    if (matchedAwardIds.has(awardKey)) continue;

    // Deduplicate: one result per carrier+route+program
    const dedupeKey = `${award.carrierCodes.join(",")}-${award.origin}-${award.destination}-${award.source}`;
    if (seenAwards.has(dedupeKey)) continue;
    seenAwards.add(dedupeKey);

    flights.push(buildAwardOnlyResult(award, cabin, `award-${seenAwards.size}`));
  }

  assignBadges(flights);
  return flights;
}

/** Build a FlightResult from a cash flight, optionally enriched with real award data. */
function buildFlightResult(
  cash: CashFlightResult,
  award: AwardResult | undefined,
  cabin: string,
  id: string,
): FlightResult {
  const carrierCode = cash.carrierCode;
  const stops = cash.segments.length - 1;
  const stopCity =
    stops > 0
      ? cash.segments
          .slice(0, -1)
          .map((s) => s.destination)
          .join(", ")
      : undefined;

  const taxes = cash.cashPrice - cash.basePrice;
  const arrivalSuffix = getArrivalSuffix(cash.departureAt, cash.arrivalAt);

  const actualCabin = cash.cabin
    ? cash.cabin.charAt(0) + cash.cabin.slice(1).toLowerCase()
    : cabin.charAt(0).toUpperCase() + cabin.slice(1);

  let transferOptions;
  let bestPoints: number;
  let bestProgram: string;
  let isEstimated: boolean;

  if (award) {
    // We have real award data — build transfer options from the real mileage cost
    const realProgram = award.source;
    const programKey = findProgramKeyForSource(realProgram);
    transferOptions = buildTransferOptions(
      carrierCode,
      award.mileageCost,
    );
    // Mark real options as not estimated
    for (const opt of transferOptions) {
      opt.isEstimated = false;
    }

    // If no transfer options found, add the direct program option
    if (transferOptions.length === 0 || (transferOptions.length === 1 && !transferOptions[0].transferFrom)) {
      transferOptions = [
        {
          program: award.sourceName,
          points: award.mileageCost,
          isEstimated: false,
          badge: "best" as const,
          programKey: award.source,
        },
        ...buildTransferOptions(carrierCode, estimateAwardCost(cash.cashPrice, cabin)).map((opt) => ({
          ...opt,
          isEstimated: true,
        })),
      ];
    }

    bestPoints = award.mileageCost;
    bestProgram = award.sourceName || programKey || carrierCode;
    isEstimated = false;
  } else {
    // No award data — use CPP estimates
    const estimatedPoints = estimateAwardCost(cash.cashPrice, cabin);
    transferOptions = buildTransferOptions(carrierCode, estimatedPoints);
    for (const opt of transferOptions) {
      opt.isEstimated = true;
    }
    bestPoints = transferOptions[0]?.points || estimatedPoints;
    bestProgram = transferOptions[0]?.program || carrierCode;
    isEstimated = true;
  }

  return {
    id,
    airline: AIRLINE_NAMES[carrierCode] || carrierCode,
    airlineCode: carrierCode,
    airlineColor: AIRLINE_COLORS[carrierCode] || "#333333",
    flightNumber: cash.flightNumbers.join(" → "),
    departureTime: formatTime(cash.departureAt),
    arrivalTime: formatTime(cash.arrivalAt) + (arrivalSuffix || ""),
    departureAirport: cash.origin,
    arrivalAirport: cash.destination,
    duration: formatDuration(cash.durationISO),
    stops,
    stopCity,
    cabin: actualCabin,
    aircraft: cash.aircraft,
    bestPoints,
    bestProgram,
    cashTax: Math.round(taxes > 0 ? taxes : cash.cashPrice * 0.15),
    transferOptions,
    dataSource: award ? "both" : "amadeus",
    isEstimated,
    remainingSeats: award?.remainingSeats,
    awardSource: award?.source,
  };
}

/** Build a FlightResult from award-only data (no cash price). */
function buildAwardOnlyResult(
  award: AwardResult,
  cabin: string,
  id: string,
): FlightResult {
  const carrierCode = award.carrierCodes[0] || "??";

  const cabinDisplay = {
    economy: "Economy",
    premium_economy: "Premium Economy",
    business: "Business",
    first: "First",
  }[award.cabin] || cabin.charAt(0).toUpperCase() + cabin.slice(1);

  const transferOptions = [
    {
      program: award.sourceName,
      points: award.mileageCost,
      isEstimated: false,
      badge: "best" as const,
      programKey: award.source,
    },
  ];

  return {
    id,
    airline: AIRLINE_NAMES[carrierCode] || carrierCode,
    airlineCode: carrierCode,
    airlineColor: AIRLINE_COLORS[carrierCode] || "#333333",
    flightNumber: carrierCode, // no specific flight number from cached search
    departureTime: "",
    arrivalTime: "",
    departureAirport: award.origin,
    arrivalAirport: award.destination,
    duration: award.isDirect ? "Nonstop" : "",
    stops: award.isDirect ? 0 : 1,
    cabin: cabinDisplay,
    bestPoints: award.mileageCost,
    bestProgram: award.sourceName,
    cashTax: 0,
    transferOptions,
    dataSource: "seats_aero",
    isEstimated: false,
    remainingSeats: award.remainingSeats,
    awardSource: award.source,
  };
}

/** Find the internal program key that corresponds to a Seats.aero source name. */
function findProgramKeyForSource(source: string): string | undefined {
  // Seats.aero uses keys like "united", "aeroplan", etc.
  // Our CARRIER_TO_PROGRAM maps IATA codes to these same keys
  const entries = Object.entries(CARRIER_TO_PROGRAM);
  for (const [, programKey] of entries) {
    if (programKey === source) return programKey;
  }
  return source;
}

/** Assign badges (lowest-points, fastest, best-deal) to a list of flights. */
function assignBadges(flights: FlightResult[]): void {
  if (flights.length === 0) return;

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

  // Best deal
  const bestDealIdx = flights.reduce((bestI, f, i) => {
    if (i === lowestIdx || i === fastestIdx) return bestI;
    const score = f.bestPoints + f.cashTax * 100;
    const bestScore =
      flights[bestI].bestPoints + flights[bestI].cashTax * 100;
    return score < bestScore ? i : bestI;
  }, flights.findIndex((_, i) => i !== lowestIdx && i !== fastestIdx));
  if (
    bestDealIdx >= 0 &&
    bestDealIdx !== lowestIdx &&
    bestDealIdx !== fastestIdx
  ) {
    flights[bestDealIdx].badge = "best-deal";
  }
}
