"use client";

import { ExternalLink, CheckCircle, Zap } from "lucide-react";
import type { AIDeal } from "@/lib/deals/aiResearch";

export function AIDealCard({ deal }: { deal: AIDeal }) {
  const cppColor =
    deal.cpp != null && deal.cpp >= 4.0
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : deal.cpp != null && deal.cpp >= 3.0
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : deal.cpp != null && deal.cpp >= 2.0
          ? "bg-amber-50 text-amber-600 border-amber-200"
          : "bg-navy/5 text-navy/40 border-navy/10";

  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3 ring-1 ring-violet-50">
      {/* Route */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xl font-bold text-navy tracking-tight leading-none">
            {deal.origin} → {deal.destination}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {deal.airline} · {deal.cabin}
          </p>
        </div>
        {deal.cpp != null && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cppColor} shrink-0`}
          >
            <Zap size={10} />
            {deal.cpp.toFixed(1)}¢/pt
          </span>
        )}
      </div>

      {/* Points + taxes */}
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-2xl font-bold text-navy">
          {deal.points.toLocaleString()}
        </span>
        <span className="text-sm text-text-muted">pts</span>
        {deal.cashTaxUSD > 0 && (
          <span className="text-sm text-text-muted">
            + ${deal.cashTaxUSD} taxes
          </span>
        )}
      </div>

      {/* Program */}
      <p className="text-xs text-text-muted -mt-1">
        Book via{" "}
        <span className="font-semibold text-navy">{deal.program}</span>
      </p>

      {/* Notes */}
      {deal.notes && (
        <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
          {deal.notes}
        </p>
      )}

      {/* Footer: confirmed badge + source link */}
      <div className="flex items-center justify-between mt-auto pt-1">
        {deal.confirmed ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle size={12} />
            Confirmed
          </div>
        ) : (
          <div className="text-xs text-text-muted italic">Estimated</div>
        )}
        {deal.sourceUrl && (
          <a
            href={deal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-coral hover:underline"
          >
            Source
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}
