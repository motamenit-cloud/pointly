"use client";

import { Check, MapPin, CreditCard } from "lucide-react";
import { AIRPORTS } from "./airports";

interface CompleteStepProps {
  airportCode: string | null;
  programCount: number;
  onFinish: () => void;
}

export function CompleteStep({
  airportCode,
  programCount,
  onFinish,
}: CompleteStepProps) {
  const airport = AIRPORTS.find((a) => a.code === airportCode);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* Animated checkmark */}
      <div
        className="animate-scale-in w-20 h-20 rounded-full bg-coral/10 flex items-center justify-center mb-8"
        style={{ animationDelay: "0s" }}
      >
        <div className="w-14 h-14 rounded-full bg-coral flex items-center justify-center">
          <Check size={28} className="text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Headline */}
      <h2
        className="animate-fade-in-up text-3xl md:text-4xl font-bold text-navy text-center"
        style={{ animationDelay: "0.15s" }}
      >
        You&apos;re all set!
      </h2>

      <p
        className="animate-fade-in-up text-text-secondary text-center mt-3 max-w-sm"
        style={{ animationDelay: "0.25s" }}
      >
        We&apos;ll now show you the best points deals tailored to your profile.
      </p>

      {/* Summary card */}
      <div
        className="animate-fade-in-up bg-white/80 rounded-2xl p-6 border border-navy/8 max-w-sm w-full mx-auto mt-8 space-y-4"
        style={{ animationDelay: "0.35s" }}
      >
        {airport && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-light flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-navy" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Home airport</p>
              <p className="text-sm font-semibold text-navy">
                {airport.code} &mdash; {airport.city}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-light flex items-center justify-center shrink-0">
            <CreditCard size={18} className="text-navy" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Loyalty programs</p>
            <p className="text-sm font-semibold text-navy">
              {programCount > 0
                ? `${programCount} program${programCount !== 1 ? "s" : ""} linked`
                : "None selected yet"}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onFinish}
        className="animate-fade-in-up mt-10 bg-coral text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-coral-dark transition-colors cursor-pointer"
        style={{ animationDelay: "0.45s" }}
      >
        Start Searching
      </button>

      {/* Secondary link */}
      <button
        onClick={onFinish}
        className="animate-fade-in-up mt-4 text-sm text-text-secondary hover:text-coral transition-colors cursor-pointer"
        style={{ animationDelay: "0.55s" }}
      >
        Explore the homepage
      </button>
    </div>
  );
}
