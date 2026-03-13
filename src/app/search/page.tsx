"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FlightResultCard } from "@/components/search/FlightResultCard";
import type { FlightResult } from "@/components/search/FlightResultCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { AIRPORTS } from "@/components/onboarding/airports";
import { getUserProfile, type UserProfile } from "@/lib/userProfile";
import {
  personalizeResults,
  getPersonalizedTip,
  type PersonalizedFlight,
} from "@/lib/personalizeResults";
import {
  Plane,
  Calendar,
  ArrowRightLeft,
  ChevronDown,
  Loader2,
  User,
} from "lucide-react";

/* ── Sort options ── */
const sortOptions = [
  { label: "Point.ly Picks", value: "picks" },
  { label: "Points: Low → High", value: "points-asc" },
  { label: "Duration: Short → Long", value: "duration" },
  { label: "Departure: Early → Late", value: "departure" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

function cityFromCode(code: string): string {
  const airport = AIRPORTS.find((a) => a.code === code);
  return airport?.city || code;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 space-y-4 min-w-0">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-navy/5 p-5 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-navy/10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-navy/10 rounded w-48" />
              <div className="h-3 bg-navy/5 rounded w-32" />
            </div>
            <div className="text-right space-y-2">
              <div className="h-5 bg-navy/10 rounded w-24 ml-auto" />
              <div className="h-3 bg-navy/5 rounded w-16 ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchResultsContent() {
  const searchParams = useSearchParams();

  const origin = searchParams.get("origin") || "JFK";
  const destination = searchParams.get("destination") || "LHR";
  const date = searchParams.get("date") || "2026-03-15";
  const cabin = searchParams.get("cabin") || "business";
  const passengers = searchParams.get("passengers") || "1";

  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [personalizedFlights, setPersonalizedFlights] = useState<PersonalizedFlight[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [activeSort, setActiveSort] = useState<SortValue>("picks");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    setProfile(getUserProfile());
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      cabin,
      passengers,
    });
    fetch(`/api/flights/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const rawFlights = data.flights || [];
        setFlights(rawFlights);
        setPersonalizedFlights(personalizeResults(rawFlights, profile));
        setSource(data.meta?.source || "");
        setLoading(false);
      })
      .catch(() => {
        setFlights([]);
        setPersonalizedFlights([]);
        setLoading(false);
      });
  }, [origin, destination, date, cabin, passengers, profile]);

  /* Sort logic */
  const flightsToSort = profile?.programs.length ? personalizedFlights : flights;
  const sorted = [...flightsToSort].sort((a, b) => {
    if (activeSort === "points-asc") return a.bestPoints - b.bestPoints;
    if (activeSort === "duration") {
      const parseDur = (d: string) => {
        const h = parseInt(d) || 0;
        const m = parseInt(d.split("h")[1]) || 0;
        return h * 60 + m;
      };
      return parseDur(a.duration) - parseDur(b.duration);
    }
    /* picks — if personalized, affordable first; otherwise badges first */
    if (profile?.programs.length) {
      const aPersonal = a as PersonalizedFlight;
      const bPersonal = b as PersonalizedFlight;
      if (aPersonal.canAfford && !bPersonal.canAfford) return -1;
      if (!aPersonal.canAfford && bPersonal.canAfford) return 1;
    }
    const badgeOrder = { "best-deal": 0, "lowest-points": 1, fastest: 2 };
    const aOrder = a.badge ? (badgeOrder[a.badge] ?? 9) : 9;
    const bOrder = b.badge ? (badgeOrder[b.badge] ?? 9) : 9;
    return aOrder - bOrder;
  });

  // Get personalized tip
  const personalTip = profile?.programs.length
    ? getPersonalizedTip(personalizedFlights, profile)
    : null;

  const activeSortLabel =
    sortOptions.find((o) => o.value === activeSort)?.label ?? "Sort";

  const originCity = cityFromCode(origin);
  const destCity = cityFromCode(destination);
  const cabinDisplay = cabin.charAt(0).toUpperCase() + cabin.slice(1);

  // Find the best deal for the generic tip banner
  const bestDeal = !personalTip
    ? flights.find((f) => f.badge === "lowest-points") || flights[0]
    : null;

  return (
    <>
      <Header />

      <main className="bg-cream min-h-screen">
        {/* ── Search summary bar ── */}
        <section className="bg-navy text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Route */}
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-xl font-bold">{originCity}</p>
                    <p className="text-xs text-white/60">{origin}</p>
                  </div>
                  <ArrowRightLeft size={18} className="text-white/40 mx-2" />
                  <div className="text-center">
                    <p className="text-xl font-bold">{destCity}</p>
                    <p className="text-xs text-white/60">{destination}</p>
                  </div>
                </div>
              </div>

              {/* Trip details */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                  <Calendar size={14} className="text-white/60" />
                  <span>{formatDateDisplay(date)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                  <Plane size={14} className="text-white/60" />
                  <span>{passengers} Passenger{passengers !== "1" ? "s" : ""}</span>
                </div>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg">
                  {cabinDisplay}
                </span>
                <button
                  onClick={() => window.history.back()}
                  className="bg-coral text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-coral-dark transition-colors cursor-pointer"
                >
                  Modify
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Results area ── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-lg font-bold text-navy">
                {loading
                  ? "Searching flights..."
                  : `${flights.length} flight${flights.length !== 1 ? "s" : ""} found`}
              </h1>
              <p className="text-sm text-text-muted">
                {loading
                  ? `Finding best points deals for ${originCity} → ${destCity}`
                  : `Showing best points deals for ${originCity} → ${destCity}`}
                {source && source !== "amadeus" && !loading && (
                  <span className="ml-1 text-xs text-navy/40">(sample data)</span>
                )}
              </p>
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 bg-white border border-navy/10 px-4 py-2 rounded-xl text-sm font-medium text-navy hover:border-navy/20 transition-colors cursor-pointer"
              >
                Sort: {activeSortLabel}
                <ChevronDown size={14} />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-navy/10 rounded-xl shadow-lg z-20 min-w-[200px] py-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setActiveSort(opt.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                        activeSort === opt.value
                          ? "text-coral font-semibold bg-coral/5"
                          : "text-navy hover:bg-cream"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main content: filters + results */}
          <div className="flex gap-6 items-start">
            <SearchFilters />

            {loading ? (
              <LoadingSkeleton />
            ) : flights.length === 0 ? (
              <div className="flex-1 text-center py-16">
                <Plane size={48} className="mx-auto text-navy/20 mb-4" />
                <h2 className="text-lg font-bold text-navy mb-2">
                  No flights found
                </h2>
                <p className="text-sm text-text-muted">
                  Try different dates or airports for {originCity} → {destCity}
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-4 min-w-0">
                {/* Personalized tip banner */}
                {personalTip && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={16} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {personalTip.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {personalTip.subtitle}
                      </p>
                    </div>
                  </div>
                )}

                {/* Generic tip banner (only when no profile) */}
                {bestDeal && !personalTip && (
                  <div className="bg-sky-light border border-sky-dark/30 rounded-xl px-5 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm">💡</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        Best deal: {bestDeal.bestProgram}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {bestDeal.bestPoints.toLocaleString()} points for{" "}
                        {bestDeal.stops === 0 ? "nonstop" : `${bestDeal.stops}-stop`}{" "}
                        {origin}→{destination} in {bestDeal.cabin}.
                      </p>
                    </div>
                  </div>
                )}

                {/* "Set up profile" prompt when no profile */}
                {!profile?.programs.length && !loading && (
                  <div className="bg-white border border-navy/10 rounded-xl px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        Get personalized results
                      </p>
                      <p className="text-xs text-text-muted">
                        Add your points balances to see which flights you can book.
                      </p>
                    </div>
                    <a
                      href="/onboarding"
                      className="bg-coral text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-coral-dark transition-colors shrink-0"
                    >
                      Set up profile
                    </a>
                  </div>
                )}

                {sorted.map((flight) => {
                  const pf = flight as PersonalizedFlight;
                  return (
                    <FlightResultCard
                      key={flight.id}
                      flight={flight}
                      personalBadge={pf.personalBadge}
                      canAfford={pf.canAfford}
                      pointsGap={pf.pointsGap}
                      userProgramName={pf.userProgramName}
                      userProgramFullName={pf.userProgramFullName}
                      userBalance={pf.userBalance}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <Loader2 className="animate-spin text-navy" size={32} />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
