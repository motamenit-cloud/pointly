"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DealCard } from "@/components/deals/DealCard";
import { AIDealCard } from "@/components/deals/AIDealCard";
import { getUserProfile, type UserProfile } from "@/lib/userProfile";
import {
  personalizeResults,
  type PersonalizedFlight,
} from "@/lib/personalizeResults";
import { AIRPORTS } from "@/components/onboarding/airports";
import { RefreshCw, Plane, Sparkles } from "lucide-react";
import type { ScoredDeal } from "@/lib/deals/scorer";
import type { AIResearchResult } from "@/lib/deals/aiResearch";

type PersonalizedDeal = ScoredDeal & Partial<PersonalizedFlight>;

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-navy/5 p-5 animate-pulse h-52"
        />
      ))}
    </div>
  );
}

function cityFromCode(code: string): string {
  return AIRPORTS.find((a) => a.code === code)?.city ?? code;
}

export default function DealsPage() {
  const [personalizedDeals, setPersonalizedDeals] = useState<PersonalizedDeal[]>([]);
  const [aiResearch, setAiResearch] = useState<AIResearchResult | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState(false);

  async function fetchDeals(profileData: UserProfile | null) {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (profileData?.homeAirport) {
        params.set("homeAirport", profileData.homeAirport);
      }
      const res = await fetch(`/api/deals?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const raw: ScoredDeal[] = data.deals ?? [];
      setCached(!!data.cached);
      if (data.aiDeals) setAiResearch(data.aiDeals);
      const personalized = personalizeResults(
        raw,
        profileData,
      ) as PersonalizedDeal[];
      setPersonalizedDeals(personalized);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const p = getUserProfile();
    setProfile(p);
    fetchDeals(p);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const homeAirport = profile?.homeAirport;
  const homeDeals = homeAirport
    ? personalizedDeals.filter((d) => d.departureAirport === homeAirport)
    : [];
  const globalDeals =
    homeDeals.length > 0
      ? personalizedDeals.filter((d) => d.departureAirport !== homeAirport)
      : personalizedDeals;

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">

        {/* Hero */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight">
              Best Business Class Deals
            </h1>
            <p className="mt-2 text-text-muted text-base">
              Top international routes sorted by value — cents per point
              {cached && (
                <span className="ml-2 text-xs text-text-muted">· Cached</span>
              )}
            </p>
          </div>
          <button
            onClick={() => fetchDeals(profile)}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-navy/10 px-4 py-2 rounded-xl text-sm font-medium text-navy hover:border-navy/20 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-20">
            <Plane size={48} className="mx-auto text-navy/20 mb-4" />
            <h2 className="text-lg font-bold text-navy mb-2">
              Could not load deals
            </h2>
            <p className="text-sm text-text-muted mb-4">
              Check that your providers are configured.
            </p>
            <button
              onClick={() => fetchDeals(profile)}
              className="text-coral text-sm font-semibold hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* AI-curated deals — shown at top when available */}
            {aiResearch && aiResearch.deals.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-coral" />
                  <h2 className="text-xl font-bold text-navy">
                    AI-Curated: Today&apos;s Best Finds
                  </h2>
                  <span className="text-xs text-text-muted ml-1">
                    · Researched {new Date(aiResearch.researchedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                {aiResearch.summary && (
                  <p className="text-sm text-text-muted mb-4 max-w-2xl">
                    {aiResearch.summary}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiResearch.deals.map((deal, i) => (
                    <AIDealCard key={i} deal={deal} />
                  ))}
                </div>
              </section>
            )}

            {/* Home airport section */}
            {homeDeals.length > 0 && homeAirport && (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-navy mb-4">
                  From {cityFromCode(homeAirport)} ({homeAirport})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {homeDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      canAfford={deal.canAfford}
                      pointsGap={deal.pointsGap}
                      userProgramName={deal.userProgramName}
                      personalBadge={deal.personalBadge}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Global top deals */}
            <section>
              <h2 className="text-xl font-bold text-navy mb-4">
                Top Global Deals
              </h2>
              {globalDeals.length === 0 ? (
                <p className="text-text-muted text-sm italic">
                  No deals found. Try refreshing or check your provider configuration.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {globalDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      canAfford={deal.canAfford}
                      pointsGap={deal.pointsGap}
                      userProgramName={deal.userProgramName}
                      personalBadge={deal.personalBadge}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Profile nudge */}
            {!profile?.programs.length && (
              <div className="mt-8 bg-white border border-navy/10 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-navy">
                    See which deals you can afford
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Add your points balances in your profile to get personalised results.
                  </p>
                </div>
                <a
                  href="/profile"
                  className="bg-coral text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-coral/90 transition-colors shrink-0"
                >
                  Set up profile
                </a>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
