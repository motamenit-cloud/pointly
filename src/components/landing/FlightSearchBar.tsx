"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plane, Calendar } from "lucide-react";
import { AIRPORTS } from "@/components/onboarding/airports";

const tripTypes = ["One Way", "Round Trip"];
const passengers = ["1 Passenger", "2 Passengers", "3 Passengers"];
const cabins = ["Economy", "Business and Economy", "Business", "First"];

const CABIN_PARAM_MAP: Record<string, string> = {
  Economy: "economy",
  "Business and Economy": "business",
  Business: "business",
  First: "first",
};

function AirportDropdown({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (code: string, display: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [display, setDisplay] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? AIRPORTS.filter(
        (a) =>
          a.city.toLowerCase().includes(query.toLowerCase()) ||
          a.code.toLowerCase().includes(query.toLowerCase()) ||
          a.name.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={display || ""}
        placeholder={placeholder}
        onChange={(e) => {
          setDisplay(e.target.value);
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange("", "");
        }}
        onFocus={() => { if (query.length > 0) setOpen(true); }}
        className="w-full text-sm text-navy font-medium placeholder:text-navy/60 outline-none bg-transparent"
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-navy/10 rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
          {filtered.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => {
                onChange(airport.code, `${airport.city} (${airport.code})`);
                setDisplay(`${airport.city} (${airport.code})`);
                setQuery("");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-cream transition-colors cursor-pointer"
            >
              <span className="font-semibold text-navy">{airport.code}</span>
              <span className="text-text-muted ml-2">
                {airport.city} — {airport.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FlightSearchBar() {
  const router = useRouter();
  const [activeTrip, setActiveTrip] = useState("One Way");
  const [activePassenger, setActivePassenger] = useState("1 Passenger");
  const [activeCabin, setActiveCabin] = useState("Business and Economy");
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [date, setDate] = useState("");
  const [showPassengers, setShowPassengers] = useState(false);
  const [showCabins, setShowCabins] = useState(false);

  const handleSearch = () => {
    const origin = fromCode || "JFK";
    const destination = toCode || "LHR";
    const depDate = date || "2026-03-15";
    const cabin = CABIN_PARAM_MAP[activeCabin] || "economy";
    const pax = activePassenger.replace(/\D/g, "") || "1";

    const params = new URLSearchParams({
      origin,
      destination,
      date: depDate,
      cabin,
      passengers: pax,
      tripType: activeTrip === "Round Trip" ? "roundtrip" : "oneway",
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section
      id="search"
      className="relative -mt-10 z-10 pb-8 md:pb-12 bg-gradient-to-b from-cream via-sky-light/40 to-sky-light"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Pill toggles */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {tripTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTrip(type)}
              className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors cursor-pointer ${
                activeTrip === type
                  ? "bg-navy text-white"
                  : "bg-white/80 text-navy border border-navy/10 hover:bg-white"
              }`}
            >
              {type}
            </button>
          ))}

          {/* Passengers dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowPassengers(!showPassengers); setShowCabins(false); }}
              className="px-4 py-2 rounded-pill text-sm font-medium bg-white/80 text-navy border border-navy/10 cursor-pointer hover:bg-white transition-colors"
            >
              {activePassenger}
            </button>
            {showPassengers && (
              <div className="absolute top-full mt-1 bg-white border border-navy/10 rounded-xl shadow-lg z-30 py-1 min-w-[160px]">
                {passengers.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setActivePassenger(p); setShowPassengers(false); }}
                    className={`w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors ${
                      activePassenger === p ? "text-coral font-semibold bg-coral/5" : "text-navy hover:bg-cream"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cabin dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowCabins(!showCabins); setShowPassengers(false); }}
              className="px-4 py-2 rounded-pill text-sm font-medium bg-white/80 text-navy border border-navy/10 cursor-pointer hover:bg-white transition-colors"
            >
              {activeCabin}
            </button>
            {showCabins && (
              <div className="absolute top-full mt-1 bg-white border border-navy/10 rounded-xl shadow-lg z-30 py-1 min-w-[200px]">
                {cabins.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setActiveCabin(c); setShowCabins(false); }}
                    className={`w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors ${
                      activeCabin === c ? "text-coral font-semibold bg-coral/5" : "text-navy hover:bg-cream"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search fields */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* From */}
            <div className="flex-1 w-full">
              <label className="text-xs text-text-muted font-medium block mb-1">
                From
              </label>
              <div className="flex items-center gap-2 border-b border-navy/10 pb-2">
                <Plane size={16} className="text-text-muted rotate-[-45deg]" />
                <AirportDropdown
                  value={fromCode}
                  onChange={(code, display) => setFromCode(code)}
                  placeholder="New York (JFK)"
                />
              </div>
            </div>

            {/* To */}
            <div className="flex-1 w-full">
              <label className="text-xs text-text-muted font-medium block mb-1">
                To
              </label>
              <div className="flex items-center gap-2 border-b border-navy/10 pb-2">
                <Plane size={16} className="text-text-muted rotate-[45deg]" />
                <AirportDropdown
                  value={toCode}
                  onChange={(code, display) => setToCode(code)}
                  placeholder="London (LHR)"
                />
              </div>
            </div>

            {/* Departure Date */}
            <div className="flex-1 w-full">
              <label className="text-xs text-text-muted font-medium block mb-1">
                Departure Date
              </label>
              <div className="flex items-center gap-2 border-b border-navy/10 pb-2">
                <Calendar size={16} className="text-text-muted" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm text-navy font-medium placeholder:text-navy/60 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-navy text-white px-8 py-3 rounded-xl font-semibold hover:bg-navy-dark transition-colors whitespace-nowrap w-full md:w-auto cursor-pointer"
            >
              Search Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
