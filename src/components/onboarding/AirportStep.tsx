"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AIRPORTS, type Airport } from "./airports";

interface AirportStepProps {
  selectedAirport: string | null;
  onSelect: (code: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AirportStep({
  selectedAirport,
  onSelect,
  onNext,
  onBack,
}: AirportStepProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = query.trim()
    ? AIRPORTS.filter((a) =>
        [a.code, a.name, a.city].some((f) =>
          f.toLowerCase().includes(query.toLowerCase()),
        ),
      ).slice(0, 8)
    : AIRPORTS;

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      {/* Back button at top */}
      <div className="max-w-lg mx-auto w-full">
        <button
          onClick={onBack}
          className="animate-fade-in-up flex items-center gap-1.5 text-sm text-text-secondary hover:text-navy transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto w-full flex-1">
        {/* Heading */}
        <h2
          className="animate-fade-in-up text-2xl md:text-3xl font-bold text-navy text-center"
          style={{ animationDelay: "0.05s" }}
        >
          Where do you fly from most?
        </h2>
        <p
          className="animate-fade-in-up text-text-secondary text-center mt-2 mb-6"
          style={{ animationDelay: "0.1s" }}
        >
          Select your home airport
        </p>

        {/* Search input */}
        <div
          className="animate-fade-in-up bg-white rounded-2xl shadow-lg p-4 md:p-5"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="flex items-center gap-3 border-b border-navy/10 pb-3 mb-3">
            <Search size={18} className="text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search airports..."
              className="w-full text-sm text-navy font-medium placeholder:text-navy/40 outline-none bg-transparent"
            />
          </div>

          {/* Airport list */}
          <div
            className="max-h-[340px] overflow-y-auto -mx-1 px-1 space-y-1"
            role="listbox"
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                <MapPin size={24} className="mb-2" />
                <p className="text-sm">No airports found</p>
              </div>
            ) : (
              filtered.map((airport) => (
                <AirportRow
                  key={airport.code}
                  airport={airport}
                  selected={selectedAirport === airport.code}
                  onSelect={() => onSelect(airport.code)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="max-w-lg mx-auto w-full mt-8 pb-4">
        <button
          onClick={onNext}
          disabled={!selectedAirport}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold transition-all cursor-pointer ${
            selectedAirport
              ? "bg-coral text-white hover:bg-coral-dark"
              : "bg-navy/10 text-navy/30 cursor-not-allowed"
          }`}
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ── Airport row ── */
function AirportRow({
  airport,
  selected,
  onSelect,
}: {
  airport: Airport;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      role="option"
      aria-selected={selected}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all text-left ${
        selected
          ? "bg-sky-light border border-coral/30"
          : "hover:bg-sky-light/50 border border-transparent"
      }`}
    >
      {/* Code badge */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
          selected ? "bg-coral text-white" : "bg-navy/5 text-navy"
        }`}
      >
        {airport.code}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-navy truncate">
          {airport.city}
        </p>
        <p className="text-xs text-text-muted truncate">{airport.name}</p>
      </div>

      {/* Check */}
      {selected && (
        <div className="w-6 h-6 rounded-full bg-coral flex items-center justify-center shrink-0">
          <Check size={14} className="text-white" />
        </div>
      )}
    </button>
  );
}
