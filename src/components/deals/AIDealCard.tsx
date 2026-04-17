"use client";

import { ExternalLink, CheckCircle, Zap, ArrowRight, Clock } from "lucide-react";
import type { AIDeal } from "@/lib/deals/aiResearch";

const REGION_LABELS: Record<string, string> = {
  us: "🇺🇸 US",
  europe: "🇪🇺 Europe",
  asia: "🌏 Asia-Pacific",
  latam: "🌎 Latin America",
  transfer_bonus: "⚡ Transfer Bonus",
};

const CABIN_LABELS: Record<string, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};

export function AIDealCard({ deal }: { deal: AIDeal }) {
  const cppColor =
    deal.cpp != null && deal.cpp >= 4.0
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : deal.cpp != null && deal.cpp >= 3.0
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : deal.cpp != null && deal.cpp >= 2.0
          ? "bg-amber-50 text-amber-600 border-amber-200"
          : "bg-navy/5 text-navy/40 border-navy/10";

  const isBonus = deal.region === "transfer_bonus";
  const expiresDate = deal.expiresAt ? new Date(deal.expiresAt) : null;
  const daysUntilExpiry = expiresDate
    ? Math.ceil((expiresDate.getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3 ${
      isBonus ? "border-amber-200 ring-1 ring-amber-50" : "border-violet-100 ring-1 ring-violet-50"
    }`}>
      {/* Header row: route + CPP */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xl font-bold text-navy tracking-tight leading-none flex items-center gap-1.5">
            {deal.origin}
            <ArrowRight size={14} className="text-navy/40" />
            {deal.destination}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {deal.airline} · {CABIN_LABELS[deal.cabin] ?? deal.cabin}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {deal.cpp != null && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cppColor} shrink-0`}>
              <Zap size={10} />
              {deal.cpp.toFixed(1)}¢/pt
            </span>
          )}
          {deal.region && (
            <span className="text-[10px] text-text-muted">
              {REGION_LABELS[deal.region] ?? deal.region}
            </span>
          )}
        </div>
      </div>

      {/* Points + taxes */}
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-2xl font-bold text-navy">
          {deal.points.toLocaleString()}
        </span>
        <span className="text-sm text-text-muted">pts</span>
        {deal.cashTaxUSD > 0 && (
          <span className="text-sm text-text-muted">+ ${deal.cashTaxUSD} taxes</span>
        )}
      </div>

      {/* Program */}
      <p className="text-xs text-text-muted -mt-1">
        Book via <span className="font-semibold text-navy">{deal.program}</span>
      </p>

      {/* Transfer partners */}
      {deal.transferableFrom && deal.transferableFrom.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {deal.transferableFrom.map((prog) => (
            <span key={prog} className="text-[10px] font-medium bg-navy/5 text-navy/60 px-2 py-0.5 rounded-full border border-navy/8">
              {prog}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {deal.notes && (
        <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{deal.notes}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1 gap-2">
        <div className="flex items-center gap-2">
          {deal.confirmed ? (
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle size={12} />
              Confirmed
            </div>
          ) : (
            <div className="text-xs text-text-muted italic">Estimated</div>
          )}
          {daysUntilExpiry != null && daysUntilExpiry > 0 && (
            <div className={`flex items-center gap-1 text-xs font-medium ${daysUntilExpiry <= 7 ? "text-red-600" : "text-amber-600"}`}>
              <Clock size={10} />
              {daysUntilExpiry}d left
            </div>
          )}
        </div>
        {deal.sourceUrl && (
          <a
            href={deal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-coral hover:underline shrink-0"
          >
            Source
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}
