"use client";

import { CheckCircle, TrendingUp, Zap } from "lucide-react";
import type { ScoredDeal, CppBadge } from "@/lib/deals/scorer";
import type { PersonalizedFlight } from "@/lib/personalizeResults";

function CppBadgeChip({ cpp, badge }: { cpp: number; badge: CppBadge }) {
  const cls =
    badge === "sweet-spot"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : badge === "best-value"
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : badge === "good"
          ? "bg-amber-50 text-amber-600 border-amber-200"
          : "bg-navy/5 text-navy/40 border-navy/10";

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

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm transition-all p-5 flex flex-col gap-3 ${
        highlighted
          ? "border-emerald-200 shadow-md ring-1 ring-emerald-100"
          : deal.cppBadge === "sweet-spot"
            ? "border-emerald-100 hover:shadow-md"
            : "border-navy/8 hover:shadow-md"
      }`}
    >
      {/* Route + CPP badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xl font-bold text-navy tracking-tight leading-none">
            {deal.departureAirport} → {deal.arrivalAirport}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {deal.airline} · {deal.cabin}
            {deal.stops === 0 ? " · Nonstop" : ` · ${deal.stops} stop${deal.stops !== 1 ? "s" : ""}`}
          </p>
        </div>
        <CppBadgeChip cpp={deal.cpp} badge={deal.cppBadge} />
      </div>

      {/* Points + taxes */}
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-2xl font-bold text-navy">
          {deal.bestPoints.toLocaleString()}
        </span>
        <span className="text-sm text-text-muted">pts</span>
        {deal.cashTax > 0 && (
          <span className="text-sm text-text-muted">+ ${deal.cashTax} taxes</span>
        )}
        {deal.isEstimated && (
          <span className="text-xs text-text-muted italic">est.</span>
        )}
      </div>

      {/* Program */}
      <p className="text-xs text-text-muted -mt-1">
        Book via{" "}
        <span className="font-semibold text-navy">{deal.bestProgram}</span>
      </p>

      {/* Transfer option pills */}
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

      {/* Affordability indicator */}
      {canAfford && userProgramName && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-auto">
          <CheckCircle size={13} />
          You can book this with {userProgramName}
        </div>
      )}
      {nearlyAffordable && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-auto">
          <TrendingUp size={13} />
          {(pointsGap as number).toLocaleString()} pts away
        </div>
      )}
    </div>
  );
}
