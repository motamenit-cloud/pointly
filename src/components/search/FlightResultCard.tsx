"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Star, Zap, ArrowRight, CheckCircle, TrendingUp } from "lucide-react";
import { AirlineLogo } from "./AirlineLogo";

/* ── Types ── */
export interface TransferOption {
  program: string;
  points: number;
  transferFrom?: string;
  transferRatio?: string;
  badge?: "best" | "fastest";
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
}: {
  flight: FlightResult;
  personalBadge?: "can-book" | "best-for-you" | "almost-there";
  canAfford?: boolean;
  pointsGap?: number;
  userProgramName?: string;
  userProgramFullName?: string;
  userBalance?: number;
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
              <p className="text-2xl font-bold text-navy leading-tight">
                {flight.bestPoints.toLocaleString()}
              </p>
              <p className="text-xs text-text-muted">
                pts + ${flight.cashTax} tax
              </p>
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
          <h4 className="text-sm font-bold text-navy mb-3">
            Booking options
          </h4>

          <div className="space-y-2.5">
            {flight.transferOptions.map((opt, i) => {
              // Check if this option matches the user's program
              const isUserProgram =
                userProgramName &&
                (opt.transferFrom?.includes(userProgramName) ||
                  opt.program.includes(userProgramName) ||
                  (userProgramFullName && opt.transferFrom?.includes(userProgramFullName)) ||
                  (userProgramFullName && opt.program.includes(userProgramFullName)));
              const affordable =
                isUserProgram && userBalance !== undefined && userBalance >= opt.points;

              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                    isUserProgram
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-white border-navy/6"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isUserProgram
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-sky-light text-navy"
                      }`}
                    >
                      {isUserProgram ? <CheckCircle size={14} /> : <Star size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">
                        {opt.program}
                      </p>
                      {opt.transferFrom && (
                        <p className="text-xs text-text-muted">
                          Transfer from {opt.transferFrom}
                          {opt.transferRatio && ` (${opt.transferRatio})`}
                        </p>
                      )}
                      {isUserProgram && affordable && userBalance !== undefined && (
                        <p className="text-xs text-emerald-600 font-medium">
                          {(userBalance - opt.points).toLocaleString()} pts remaining after booking
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {opt.badge === "best" && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-coral/10 text-coral border border-coral/20">
                        <Star size={10} /> Best
                      </span>
                    )}
                    {isUserProgram && !opt.badge && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Your program
                      </span>
                    )}
                    <div className="text-right">
                      <p className="text-base font-bold text-navy">
                        {opt.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-text-muted">points</p>
                    </div>
                    <button className="bg-coral text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-coral-dark transition-colors cursor-pointer">
                      Book
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-text-muted">
            Points required may vary. Taxes & fees are approximate.
          </p>
        </div>
      )}
    </div>
  );
}
