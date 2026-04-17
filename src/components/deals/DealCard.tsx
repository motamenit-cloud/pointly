"use client";

import { CheckCircle, TrendingUp, Zap } from "lucide-react";
import type { ScoredDeal, CppBadge } from "@/lib/deals/scorer";
import type { PersonalizedFlight } from "@/lib/personalizeResults";

/* Airport code → local destination image */
const DESTINATION_IMAGES: Record<string, string> = {
  // User-provided illustrations (.png)
  CDG: "/images/destinations/paris.png",
  ORY: "/images/destinations/paris.png",
  BCN: "/images/destinations/barcelona.png",
  MEX: "/images/destinations/mexico-city.png",
  GIG: "/images/destinations/rio-de-janeiro.png",
  GRU: "/images/destinations/rio-de-janeiro.png",
  DEL: "/images/destinations/india.png",
  BOM: "/images/destinations/india.png",
  BLR: "/images/destinations/india.png",
  FCO: "/images/destinations/rome.png",
  CIA: "/images/destinations/rome.png",
  // Photo fallbacks (.jpg)
  LHR: "/images/destinations/london.jpg",
  LGW: "/images/destinations/london.jpg",
  NRT: "/images/destinations/tokyo.jpg",
  HND: "/images/destinations/tokyo.jpg",
  SIN: "/images/destinations/singapore.jpg",
  DXB: "/images/destinations/dubai.jpg",
  SYD: "/images/destinations/sydney.jpg",
  MEL: "/images/destinations/sydney.jpg",
  HKG: "/images/destinations/hong-kong.jpg",
  FRA: "/images/destinations/frankfurt.jpg",
  MUC: "/images/destinations/frankfurt.jpg",
  ICN: "/images/destinations/seoul.jpg",
  GMP: "/images/destinations/seoul.jpg",
};

function CppBadgeChip({ cpp, badge }: { cpp: number; badge: CppBadge }) {
  const cls =
    badge === "sweet-spot"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : badge === "best-value"
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : badge === "good"
          ? "bg-amber-50 text-amber-600 border-amber-200"
          : "bg-white/20 text-white border-white/30";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}
    >
      <Zap size={10} />
      {cpp.toFixed(1)}¢/pt
    </span>
  );
}

export function DealCard({
  deal,
  canAfford,
  pointsGap,
  userProgramName,
  personalBadge,
}: {
  deal: ScoredDeal & Partial<PersonalizedFlight>;
  canAfford?: boolean;
  pointsGap?: number;
  userProgramName?: string;
  personalBadge?: "can-book" | "best-for-you" | "almost-there";
}) {
  const highlighted = canAfford || personalBadge === "best-for-you";
  const nearlyAffordable =
    !canAfford &&
    pointsGap != null &&
    pointsGap > 0 &&
    pointsGap <= deal.bestPoints * 0.25;

  const topTransfers = deal.transferOptions.slice(0, 3);
  const destImage = DESTINATION_IMAGES[deal.arrivalAirport];

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        highlighted
          ? "ring-2 ring-emerald-400 ring-offset-1"
          : ""
      }`}
    >
      {/* Destination image header */}
      <div className="relative h-44 bg-navy overflow-hidden">
        {destImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={destImage}
            alt={deal.arrivalAirport}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy to-navy/60" />
        )}
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Route badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20">
            {deal.departureAirport} → {deal.arrivalAirport}
          </span>
        </div>

        {/* CPP badge */}
        <div className="absolute top-3 right-3">
          <CppBadgeChip cpp={deal.cpp} badge={deal.cppBadge} />
        </div>

        {/* Points */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white leading-none">
              {deal.bestPoints.toLocaleString()}
            </span>
            <span className="text-sm text-white/80">pts</span>
            {deal.cashTax > 0 && (
              <span className="text-xs text-white/70">+ ${deal.cashTax} taxes</span>
            )}
            {deal.isEstimated && (
              <span className="text-xs text-white/60 italic">est.</span>
            )}
          </div>
          <p className="text-xs text-white/70 mt-0.5">
            {deal.airline} · {deal.cabin}
            {deal.stops === 0 ? " · Nonstop" : ` · ${deal.stops} stop${deal.stops !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div className={`bg-white p-4 flex flex-col gap-3 border border-t-0 rounded-b-2xl ${
        highlighted ? "border-emerald-200" : "border-navy/8"
      }`}>
        <p className="text-xs text-text-muted">
          Book via{" "}
          <span className="font-semibold text-navy">{deal.bestProgram}</span>
        </p>

        {topTransfers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topTransfers.map((opt, i) => (
              <span
                key={i}
                className="text-xs font-medium bg-navy/5 text-navy/70 px-2.5 py-1 rounded-full border border-navy/8"
              >
                {opt.transferFrom ?? opt.program}
              </span>
            ))}
          </div>
        )}

        {canAfford && userProgramName && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            <CheckCircle size={13} />
            You can book this with {userProgramName}
          </div>
        )}
        {nearlyAffordable && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <TrendingUp size={13} />
            {(pointsGap as number).toLocaleString()} pts away
          </div>
        )}
      </div>
    </div>
  );
}
