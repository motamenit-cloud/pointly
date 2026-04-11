"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Star, Zap, ArrowRight, CheckCircle, TrendingUp, Users, ExternalLink } from "lucide-react";
import { AirlineLogo } from "./AirlineLogo";

/* ── Portal & booking URLs ── */
const TRANSFER_PORTAL_URLS: Record<string, string> = {
  "chase-ur": "https://ultimaterewardspoints.chase.com",
  "amex-mr": "https://global.americanexpress.com/rewards",
  "citi-ty": "https://thankyou.citi.com",
  "cap1-miles": "https://www.capitalone.com/credit-cards/benefits/travel",
  "bilt": "https://www.biltrewards.com/travel",
};

const TRANSFER_PORTAL_NAMES: Record<string, string> = {
  "chase-ur": "Chase UR Portal",
  "amex-mr": "Amex Rewards",
  "citi-ty": "Citi ThankYou",
  "cap1-miles": "Capital One Portal",
  "bilt": "Bilt Rewards",
};

const BOOKING_URLS: Record<string, string> = {
  united: "https://www.united.com/en/us/awardtravel",
  aa: "https://www.aa.com/booking/find-flights",
  delta: "https://www.delta.com/flight-search/book-a-flight",
  southwest: "https://www.southwest.com/air/booking",
  alaska: "https://www.alaskaair.com/booking/flights",
  jetblue: "https://www.jetblue.com/booking/flights",
  ba: "https://www.britishairways.com/travel/redeem",
  virgin: "https://www.virginatlantic.com/book/flights",
  "flying-blue": "https://www.flyingblue.com/en/spend/flights",
  aeroplan: "https://www.aircanada.com/aeroplan",
  emirates: "https://www.emirates.com/us/english/book",
  singapore: "https://www.singaporeair.com/en_UK/ppsclub-krisflyer/use-miles",
  ana: "https://www.ana.co.jp/en/us/amc/award-reservation",
  cathay: "https://www.cathaypacific.com/cx/en_US/book-a-trip/redeem-flights",
  turkish: "https://www.turkishairlines.com/en-us/miles-and-smiles",
  qatar: "https://www.qatarairways.com/en/privilege-club/use-qmiles.html",
  etihad: "https://www.etihad.com/en-us/guest/flights",
  avianca: "https://www.lifemiles.com/flight/search",
  iberia: "https://www.iberia.com/us/avios",
  hawaiian: "https://www.hawaiianairlines.com/my-account/hawaiianmiles",
  latam: "https://www.latamairlines.com/us/en/latam-pass",
  copa: "https://www.copaair.com/en-us/connectmiles",
  aeromexico: "https://www.aeromexico.com/en-us/club-premier",
  smiles: "https://www.smiles.com.br/flights",
};

/* ── Types ── */
export interface TransferOption {
  program: string;
  points: number;
  transferFrom?: string;
  transferRatio?: string;
  badge?: "best" | "fastest";
  /** Whether this points cost is an estimate (CPP-based) or real award data. */
  isEstimated?: boolean;
  /** Credit card program ID (e.g. "chase-ur") for looking up portal URL. */
  transferFromId?: string;
  /** Airline program key (e.g. "united") for looking up booking URL. */
  programKey?: string;
}

export interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  airlineColor: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  stops: number;
  stopCity?: string;
  cabin: string;
  aircraft?: string;
  bestPoints: number;
  bestProgram: string;
  cashTax: number;
  badge?: "best-deal" | "lowest-points" | "fastest";
  transferOptions: TransferOption[];
  /** Data source(s) that produced this result. */
  dataSource?: "amadeus" | "seats_aero" | "both" | "mock" | "live";
  /** Whether the points cost is an estimate or real award availability. */
  isEstimated?: boolean;
  /** Remaining award seats (from Seats.aero). */
  remainingSeats?: number;
  /** The mileage program source for the award (e.g. "united"). */
  awardSource?: string;
}

/* ── Badge component ── */
function ResultBadge({ type }: { type: "best-deal" | "lowest-points" | "fastest" }) {
  const config = {
    "best-deal": {
      label: "Point.ly Pick",
      icon: Star,
      bg: "bg-coral/10",
      text: "text-coral",
      border: "border-coral/20",
    },
    "lowest-points": {
      label: "Lowest Points",
      icon: Zap,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
    },
    fastest: {
      label: "Fastest",
      icon: Zap,
      bg: "bg-sky/40",
      text: "text-navy",
      border: "border-sky-dark",
    },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      <Icon size={12} />
      {c.label}
    </span>
  );
}

/* ── Personal badge ── */
function PersonalBadge({ type, pointsGap }: { type: "can-book" | "best-for-you" | "almost-there"; pointsGap?: number }) {
  if (type === "can-book" || type === "best-for-you") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle size={12} />
        {type === "best-for-you" ? "Best for you" : "You can book this!"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <TrendingUp size={12} />
      Need {(pointsGap ?? 0).toLocaleString()} more
    </span>
  );
}

/* ── Main card ── */
export function FlightResultCard({
  flight,
  personalBadge,
  canAfford,
  pointsGap,
  userProgramName,
  userProgramFullName,
  userBalance,
  isLiveScraping,
}: {
  flight: FlightResult;
  personalBadge?: "can-book" | "best-for-you" | "almost-there";
  canAfford?: boolean;
  pointsGap?: number;
  userProgramName?: string;
  userProgramFullName?: string;
  userBalance?: number;
  /** Whether a live scrape is in progress for this card's airline. */
  isLiveScraping?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const stopsLabel =
    flight.stops === 0
      ? "Nonstop"
      : flight.stops === 1
        ? `1 stop${flight.stopCity ? ` · ${flight.stopCity}` : ""}`
        : `${flight.stops} stops`;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border transition-all ${
        personalBadge === "best-for-you"
          ? "border-emerald-300 shadow-md ring-1 ring-emerald-100"
          : canAfford
            ? "border-emerald-200 shadow-md"
            : flight.badge === "best-deal"
              ? "border-coral/30 shadow-md"
              : "border-navy/8 hover:shadow-md"
      }`}
    >
      {/* ── Top row: flight info + points cost ── */}
      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Left: airline + route */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <AirlineLogo code={flight.airlineCode} />

            <div className="flex-1 min-w-0">
              {/* Airline & badge */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-navy">
                  {flight.airline}
                </span>
                <span className="text-xs text-text-muted">
                  {flight.flightNumber}
                </span>
                {flight.badge && <ResultBadge type={flight.badge} />}
                {personalBadge && <PersonalBadge type={personalBadge} pointsGap={pointsGap} />}
              </div>

              {/* Times + route */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-navy leading-tight">
                    {flight.departureTime}
                  </p>
                  <p className="text-xs text-text-muted">
                    {flight.departureAirport}
                  </p>
                </div>

                {/* Duration bar */}
                <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[80px]">
                  <p className="text-xs text-text-muted">{flight.duration}</p>
                  <div className="w-full flex items-center gap-1">
                    <div className="h-px flex-1 bg-navy/15" />
                    {flight.stops > 0 && (
                      <div className="w-2 h-2 rounded-full bg-navy/20" />
                    )}
                    {flight.stops > 1 && (
                      <div className="w-2 h-2 rounded-full bg-navy/20" />
                    )}
                    <div className="h-px flex-1 bg-navy/15" />
                    <ArrowRight size={12} className="text-navy/30" />
                  </div>
                  <p className="text-xs text-text-muted">{stopsLabel}</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-navy leading-tight">
                    {flight.arrivalTime}
                  </p>
                  <p className="text-xs text-text-muted">
                    {flight.arrivalAirport}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: points cost */}
          <div className="flex items-center gap-4 md:gap-6 md:pl-6 md:border-l md:border-navy/8">
            <div className="text-right md:text-right">
              <p className="text-xs text-text-muted mb-0.5">From</p>
              <p className={`text-2xl font-bold text-navy leading-tight transition-opacity duration-500 ${isLiveScraping ? "animate-pulse" : ""}`}>
                {flight.bestPoints.toLocaleString()}
              </p>
              <p className="text-xs text-text-muted">
                pts{flight.cashTax > 0 ? ` + $${flight.cashTax} tax` : ""}
              </p>
              {isLiveScraping && (
                <p className="text-xs text-violet-500 font-medium mt-0.5 animate-pulse">
                  Checking live prices...
                </p>
              )}
              {flight.remainingSeats != null && flight.remainingSeats > 0 && flight.remainingSeats <= 9 && (
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                  <Users size={10} />
                  {flight.remainingSeats} seat{flight.remainingSeats !== 1 ? "s" : ""} left
                </p>
              )}
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 bg-navy text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-dark transition-colors whitespace-nowrap cursor-pointer"
            >
              {expanded ? "Hide" : "View"} options
              {expanded ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Cabin + aircraft info */}
        <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
          <span className="px-2 py-0.5 rounded bg-sky-light text-navy font-medium">
            {flight.cabin}
          </span>
          {flight.aircraft && <span>{flight.aircraft}</span>}
        </div>
      </div>

      {/* ── Expanded: transfer / booking options ── */}
      {expanded && (
        <div className="border-t border-navy/8 bg-cream/50 rounded-b-2xl p-5 md:p-6">
          <h4 className="text-sm font-bold text-navy mb-4">
            How to book with points
          </h4>

          <div className="space-y-4">
            {flight.transferOptions.map((opt, i) => {
              const isUserProgram =
                userProgramName &&
                (opt.transferFrom?.includes(userProgramName) ||
                  opt.program.includes(userProgramName) ||
                  (userProgramFullName && opt.transferFrom?.includes(userProgramFullName)) ||
                  (userProgramFullName && opt.program.includes(userProgramFullName)));
              const affordable =
                isUserProgram && userBalance !== undefined && userBalance >= opt.points;

              const portalUrl = opt.transferFromId ? TRANSFER_PORTAL_URLS[opt.transferFromId] : undefined;
              const portalName = opt.transferFromId ? TRANSFER_PORTAL_NAMES[opt.transferFromId] : undefined;
              const bookingUrl = opt.programKey ? BOOKING_URLS[opt.programKey] : undefined;

              const hasTransferStep = !!opt.transferFrom;

              return (
                <div
                  key={i}
                  className={`rounded-xl border overflow-hidden ${
                    isUserProgram
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-navy/8 bg-white"
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isUserProgram
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-sky-light text-navy"
                        }`}
                      >
                        {isUserProgram ? <CheckCircle size={14} /> : <Star size={14} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-navy truncate">
                            {opt.program}
                          </p>
                          {opt.badge === "best" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-coral/10 text-coral border border-coral/20">
                              <Star size={10} /> Best
                            </span>
                          )}
                          {isUserProgram && !opt.badge && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Your program
                            </span>
                          )}
                        </div>
                        {opt.isEstimated && (
                          <p className="text-xs text-text-muted/70 italic">
                            Estimated
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-navy">
                        {opt.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-text-muted">points needed</p>
                    </div>
                  </div>

                  {/* Transfer steps */}
                  <div className="px-4 pb-4">
                    <div className="bg-cream/80 rounded-lg px-4 py-3 space-y-3">
                      {hasTransferStep && (
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                              1
                            </div>
                            <div className="w-px flex-1 bg-navy/15 mt-1" />
                          </div>
                          <div className="pb-1">
                            <p className="text-sm font-medium text-navy">
                              Transfer {opt.points.toLocaleString()} points from {opt.transferFrom}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {opt.transferRatio && `${opt.transferRatio} transfer ratio · `}Transfers are usually instant
                            </p>
                            {portalUrl && (
                              <a
                                href={portalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-coral hover:underline mt-1"
                              >
                                Open {portalName}
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {hasTransferStep ? "2" : "1"}
                          </div>
                          <div className="w-px flex-1 bg-navy/15 mt-1" />
                        </div>
                        <div className="pb-1">
                          <p className="text-sm font-medium text-navy">
                            Book award flight on {opt.program}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            Search for {flight.departureAirport} → {flight.arrivalAirport} and select your flight
                          </p>
                          {bookingUrl && (
                            <a
                              href={bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-coral hover:underline mt-1"
                            >
                              Search on {opt.program.split(" ")[0]}
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {hasTransferStep ? "3" : "2"}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-navy">
                            Pay taxes & fees{flight.cashTax > 0 ? ` (~$${flight.cashTax})` : ""}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            Paid by credit card at checkout
                          </p>
                        </div>
                      </div>
                    </div>

                    {isUserProgram && affordable && userBalance !== undefined && (
                      <p className="text-xs text-emerald-600 font-medium mt-2 px-1">
                        You&apos;ll have {(userBalance - opt.points).toLocaleString()} pts remaining after booking
                      </p>
                    )}

                    {/* Book button */}
                    {bookingUrl ? (
                      <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full flex items-center justify-center gap-1.5 bg-coral text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-coral-dark transition-colors cursor-pointer"
                      >
                        Book on {opt.program.split(" ")[0]}
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <button className="mt-3 w-full bg-coral text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-coral-dark transition-colors cursor-pointer">
                        Book Flight
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-text-muted">
            Points required may vary. Taxes & fees are approximate.
          </p>
        </div>
      )}
    </div>
  );
}
