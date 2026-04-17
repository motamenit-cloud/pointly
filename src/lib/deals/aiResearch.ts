/**
 * Multi-agent Claude-powered deal research system.
 * 5 specialized agents run in parallel (US, Europe, Asia-Pacific, Latin America,
 * Transfer Bonuses), each focused on their region's programs and routes.
 * Results are merged and deduplicated by CPP before storage.
 */

import Anthropic from "@anthropic-ai/sdk";

export type AIDealRegion = "us" | "europe" | "asia" | "latam" | "transfer_bonus";

export interface AIDeal {
  origin: string;
  destination: string;
  airline: string;
  program: string;
  points: number;
  cashTaxUSD: number;
  cabin: "economy" | "premium_economy" | "business" | "first";
  notes: string;
  sourceUrl?: string;
  confirmed: boolean;
  cpp?: number;
  transferableFrom?: string[];
  expiresAt?: string;
  region: AIDealRegion;
}

export interface AIResearchResult {
  deals: AIDeal[];
  researchedAt: string;
  summary: string;
}

// ── Transfer partner reference (used in prompts) ────────────────────────────

const TRANSFER_CONTEXT = `
CREDIT CARD TRANSFER PARTNERS (for the transferableFrom field):
- Chase Ultimate Rewards → United MileagePlus, Southwest, JetBlue TrueBlue, British Airways Avios, Air Canada Aeroplan, Air France/KLM Flying Blue, Emirates Skywards, Iberia Avios, Singapore KrisFlyer, Virgin Atlantic Flying Club
- Amex Membership Rewards → Delta SkyMiles, Air France/KLM Flying Blue, British Airways Avios, Singapore KrisFlyer, ANA Mileage Club, Cathay Pacific Asia Miles, Emirates Skywards, Virgin Atlantic Flying Club, Avianca LifeMiles, Air Canada Aeroplan, JetBlue TrueBlue
- Citi ThankYou → American Airlines AAdvantage, Turkish Airlines Miles&Smiles, Air France/KLM Flying Blue, Singapore KrisFlyer, Virgin Atlantic Flying Club, JetBlue TrueBlue, Qatar Privilege Club, Etihad Guest, Avianca LifeMiles
- Capital One Miles → Turkish Airlines Miles&Smiles, British Airways Avios, Air Canada Aeroplan, Air France/KLM Flying Blue, Avianca LifeMiles, Emirates Skywards, Singapore KrisFlyer, Cathay Pacific Asia Miles
- Bilt Rewards → United MileagePlus, American AAdvantage, Alaska Mileage Plan, Air France/KLM Flying Blue, British Airways Avios, Turkish Airlines Miles&Smiles, Virgin Atlantic Flying Club, Air Canada Aeroplan`;

const JSON_SCHEMA = `{
  "deals": [
    {
      "origin": "JFK",
      "destination": "NRT",
      "airline": "ANA",
      "program": "Virgin Atlantic Flying Club",
      "points": 60000,
      "cashTaxUSD": 55,
      "cabin": "business",
      "notes": "ANA business via Virgin miles — 60k one-way JFK-NRT. Best value for the route.",
      "sourceUrl": "https://onemileatatime.com/...",
      "confirmed": true,
      "cpp": 5.8,
      "transferableFrom": ["Chase Ultimate Rewards", "Amex Membership Rewards"],
      "expiresAt": null,
      "region": "asia"
    }
  ]
}`;

// ── Per-region agent configs ─────────────────────────────────────────────────

interface RegionConfig {
  region: AIDealRegion;
  systemPrompt: string;
  userMessage: string;
}

function buildRegionConfig(today: string): RegionConfig[] {
  return [
    {
      region: "us",
      systemPrompt: `You are an expert US airline award travel researcher. Search the web RIGHT NOW to find the best current award redemption deals using US airline loyalty programs.

PROGRAMS TO COVER — search each program's award booking page + recent blog posts:
- United MileagePlus (partners: ANA, Lufthansa, Air Canada, Singapore Airlines, Swiss)
- American Airlines AAdvantage (partners: British Airways, Cathay Pacific, JAL, Qatar Airways, Finnair, Iberia, Royal Air Maroc)
- Delta SkyMiles (partners: Air France/KLM, Virgin Atlantic, Korean Air, Singapore Airlines, WestJet)
- Alaska Mileage Plan (partners: British Airways, Cathay Pacific, Finnair, JAL, Qatar Airways, Emirates, American Airlines)
- JetBlue TrueBlue (Mint business class transcontinental, partner awards)
- Southwest Rapid Rewards (domestic + Caribbean + Mexico)
- Hawaiian HawaiianMiles (partners: JAL, ANA on premium trans-Pacific)

ROUTES TO FOCUS ON:
- Transcontinental premium: JFK↔LAX, JFK↔SFO, JFK↔SEA, BOS↔LAX (JetBlue Mint, Alaska, AA)
- US→Hawaii: LAX/SFO/JFK→HNL (business premium)
- US→Caribbean/Mexico: MIA/JFK→NAS, MIA/JFK→CUN, JFK/MIA→SJU
- US domestic partner sweet spots: AA miles on BA/Cathay/JAL, Alaska miles on BA/Cathay/Emirates

QUALITY THRESHOLDS:
- Business/First: CPP ≥ 2.5¢ vs cash price. Economy: CPP ≥ 1.5¢
- Only include deals currently available or verified within the past 14 days

SOURCES: thepointsguy.com, onemileatatime.com, viewfromthewing.com, frequentmiler.com, upgradedpoints.com, each airline's award search

${TRANSFER_CONTEXT}

Return EXACTLY this JSON (no markdown, no extra text):
${JSON_SCHEMA}

Return 8–12 deals. Region = "us" for all.`,
      userMessage: `Today is ${today}. Search the web and find the best US airline award redemption deals available right now. Focus on: United, AA, Delta, Alaska, JetBlue, Southwest, Hawaiian programs. Include both domestic premium and international partner awards. Return JSON only.`,
    },

    {
      region: "europe",
      systemPrompt: `You are an expert European airline award travel researcher. Search the web RIGHT NOW to find the best award redemption deals using European airline loyalty programs.

PROGRAMS TO COVER — search each program's award booking page + recent blog posts:
- Air France/KLM Flying Blue (partners: Delta, Korean Air, Kenyan Airways — monthly promo awards)
- British Airways Executive Club / Avios (partners: American, Alaska, Cathay, JAL, Iberia, Aer Lingus, Finnair — distance-based chart)
- Iberia Avios (low taxes on Iberia flights, partners: BA, Vueling, LEVEL)
- Lufthansa Miles & More (partners: Swiss, Austrian, Brussels, LOT — premium cabin sweet spots)
- Turkish Airlines Miles&Smiles (partners: United, ANA, Singapore — cheap business class in off-peak)
- SAS EuroBonus (Star Alliance awards, Scandinavian routes)
- Finnair Plus (oneworld partner awards, Helsinki hub, AY flights to Asia)
- TAP Miles&Go (Star Alliance, cheap Lisbon-connect redemptions)

ROUTES TO FOCUS ON:
- US→Europe: JFK/LAX/ORD/MIA→LHR, CDG, FRA, AMS, IST, FCO, MAD, BCN, ARN, HEL, LIS
- Intra-Europe premium: LHR→FRA, CDG→FCO, IST→FRA (Turkish business)
- Europe→Asia via hub: LHR→HKG via Cathay, FRA→NRT via Lufthansa

QUALITY THRESHOLDS:
- Business/First: CPP ≥ 2.5¢. Economy: CPP ≥ 1.5¢
- Flying Blue monthly Promo Awards are almost always worth reporting
- Turkish off-peak business rates are often exceptional value

SOURCES: thepointsguy.com, onemileatatime.com, viewfromthewing.com, headforpoints.com, flyingblue.com promo awards page, turkmiles.com

${TRANSFER_CONTEXT}

Return EXACTLY this JSON (no markdown, no extra text):
${JSON_SCHEMA}

Return 8–12 deals. Region = "europe" for all.`,
      userMessage: `Today is ${today}. Search the web and find the best European airline award redemption deals available right now. Focus on: Flying Blue, Avios, Miles&More, Turkish Miles&Smiles, SAS EuroBonus, Finnair Plus. Look especially for Flying Blue monthly promo awards and Turkish Miles&Smiles sweet spots. Return JSON only.`,
    },

    {
      region: "asia",
      systemPrompt: `You are an expert Asia-Pacific airline award travel researcher. Search the web RIGHT NOW to find the best award redemption deals using Asian airline loyalty programs.

PROGRAMS TO COVER — search each program's award booking page + recent blog posts:
- ANA Mileage Club (partners: United, Virgin Atlantic for ANA flights — legendary sweet spot)
- JAL JAL Mileage Bank (partners: American AAdvantage, BA Avios for JAL flights)
- Singapore Airlines KrisFlyer (partners: Virgin Atlantic, Chase for SQ Suites + business)
- Cathay Pacific Asia Miles (partners: Alaska, Amex, Capital One — premium cabin sweet spots)
- Korean Air SKYPASS (partners: Delta, SkyTeam — US routes in prestige class)
- EVA Air Infinity MileageLands (Star Alliance, Royal Laurel Business class)
- Thai Airways Royal Orchid Plus (Star Alliance, Bangkok routes)
- Malaysia Airlines Enrich (Star Alliance, Asia routes)
- Asiana Club (Star Alliance, Korean/Asian routes)

ROUTES TO FOCUS ON:
- US→Japan: JFK/LAX/SFO/ORD→NRT, HND (ANA, JAL business)
- US→Singapore: JFK/LAX/SFO→SIN (Singapore Suites, SQ business)
- US→Hong Kong: JFK/LAX→HKG (Cathay Pacific business)
- US→Seoul: LAX/SFO→ICN (Korean prestige, Asiana business)
- US→Bangkok/Sydney: LAX/SFO→BKK, SYD (Thai, Qantas)
- Intra-Asia: SIN→NRT, HKG→NRT, ICN→SIN

QUALITY THRESHOLDS:
- Business/First: CPP ≥ 2.5¢. First class: CPP ≥ 4¢
- ANA + Virgin Atlantic = historically the best US→Japan sweet spot: 60k miles one-way business
- Singapore KrisFlyer Saver awards are exceptional value

SOURCES: thepointsguy.com, onemileatatime.com, pointswithacrew.com, wanderlustandlipstick.com, each airline program site

${TRANSFER_CONTEXT}

Return EXACTLY this JSON (no markdown, no extra text):
${JSON_SCHEMA}

Return 8–12 deals. Region = "asia" for all.`,
      userMessage: `Today is ${today}. Search the web and find the best Asia-Pacific airline award redemption deals available right now. Focus on: ANA Mileage Club, Singapore KrisFlyer, Cathay Asia Miles, JAL Mileage Bank, Korean SKYPASS. Prioritize confirmed business/first class sweet spots. Return JSON only.`,
    },

    {
      region: "latam",
      systemPrompt: `You are an expert Latin American airline award travel researcher. Search the web RIGHT NOW to find the best award redemption deals using Latin American airline loyalty programs.

PROGRAMS TO COVER — search each program's award booking page + recent blog posts:
- Avianca LifeMiles (Star Alliance partner awards — often very low prices on United, ANA, LH)
- LATAM Pass (oneworld, South American routes, Star Alliance partners)
- Aeromexico Club Premier (SkyTeam, Delta partnership, cheap Mexico routes)
- Copa Airlines ConnectMiles (Star Alliance, Panama hub, US↔South America)
- GOL Smiles (SkyTeam Brazil, very cheap domestic Brazil redemptions)
- Azul TudoAzul (Brazil domestic, US→Brazil via AZUL)
- Interjet (Mexico) — if still operating

ROUTES TO FOCUS ON:
- US→Mexico: JFK/LAX/MIA/ORD/DFW→MEX, GDL, CUN, MTY
- US→Colombia/Peru/Ecuador: MIA/JFK→BOG, LIM, UIO
- US→Brazil: MIA/JFK/GRU→GRU, GIG, SSA, CNF
- US→Argentina/Chile: MIA/JFK→EZE, AEP, SCL
- US→Central America: MIA/JFK→PTY, SJO, GUA
- US→Venezuela/Caribbean: MIA→CCS, MIA→HAV (if available)
- Intra-LATAM premium: GRU→EZE, BOG→LIM, MEX→GRU

QUALITY THRESHOLDS:
- Business/First: CPP ≥ 2.0¢. Economy: CPP ≥ 1.2¢
- LifeMiles on Star Alliance is often the best way into Latin America (United to LATAM gateways)
- Copa ConnectMiles can be exceptional for intra-LATAM

SOURCES: thepointsguy.com, onemileatatime.com, milesgeek.com, puntosmillasmastercard.com, each program's award chart

${TRANSFER_CONTEXT}

Return EXACTLY this JSON (no markdown, no extra text):
${JSON_SCHEMA}

Return 8–12 deals. Region = "latam" for all.`,
      userMessage: `Today is ${today}. Search the web and find the best Latin American airline award redemption deals available right now. Focus on: Avianca LifeMiles, LATAM Pass, Aeromexico Club Premier, Copa ConnectMiles, GOL Smiles. Include both US→LATAM and intra-LATAM routes. Return JSON only.`,
    },

    {
      region: "transfer_bonus",
      systemPrompt: `You are an expert credit card points transfer bonus researcher. Search the web RIGHT NOW to find all currently active transfer bonuses and the best deals they unlock.

PROGRAMS TO CHECK FOR ACTIVE BONUSES:
- Chase Ultimate Rewards (transfers to: United, Southwest, JetBlue, BA Avios, Aeroplan, Flying Blue, Emirates, Singapore, Virgin Atlantic)
- Amex Membership Rewards (transfers to: Delta, Flying Blue, BA, Singapore, ANA, Cathay, Emirates, Virgin Atlantic, LifeMiles, Aeroplan, JetBlue)
- Citi ThankYou (transfers to: American AAdvantage, Turkish, Flying Blue, Singapore, Virgin Atlantic, JetBlue, Qatar, Etihad, LifeMiles)
- Capital One Miles (transfers to: Turkish, BA, Aeroplan, Flying Blue, LifeMiles, Emirates, Singapore, Cathay)
- Bilt Rewards (transfers to: United, American, Alaska, Flying Blue, BA, Turkish, Virgin, Aeroplan)

FOR EACH ACTIVE BONUS, report as a deal showing:
1. The underlying route/airline the bonus makes compelling
2. Effective points cost AFTER the bonus (recalculate: if 30% bonus, you need 23% fewer points transferred)
3. The expiry date of the bonus
4. How to activate/access the bonus

ALSO LOOK FOR:
- Airline flash sales on award space (e.g., ANA cutting rates for a limited window)
- Program promotions (earning bonuses, redemption discounts)
- Limited-time partner award availability
- New sweet spots created by recent award chart changes

QUALITY: Any bonus ≥ 15% is worth reporting. Include the best route the bonus can be applied to.

SOURCES: thepointsguy.com, onemileatatime.com, frequentmiler.com, viewfromthewing.com, doctorofcredit.com, milestomemories.com

${TRANSFER_CONTEXT}

Return EXACTLY this JSON (no markdown, no extra text):
${JSON_SCHEMA}

Return 8–12 items. Use expiresAt (ISO date string) for every bonus deal. Region = "transfer_bonus" for all.`,
      userMessage: `Today is ${today}. Search the web and find ALL currently active credit card transfer bonuses and the best deals they unlock. Check Chase UR, Amex MR, Citi TY, Capital One, and Bilt for active promotions. For each bonus, show the best route/deal it applies to with the effective discounted points cost. Return JSON only.`,
    },
  ];
}

// ── Single regional agent ───────────────────────────────────────────────────

async function researchRegion(
  client: Anthropic,
  config: RegionConfig,
): Promise<AIDeal[]> {
  const startMs = Date.now();
  console.log(`[aiResearch] Starting ${config.region} agent...`);

  let fullText = "";

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: config.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { type: "web_search_20260209", name: "web_search" } as any,
    ],
    messages: [{ role: "user", content: config.userMessage }],
  });

  const finalMessage = await stream.finalMessage();

  for (const block of finalMessage.content) {
    if (block.type === "text") fullText += block.text;
  }

  const ms = Date.now() - startMs;
  console.log(`[aiResearch] ${config.region} agent done in ${ms}ms, response length: ${fullText.length}`);

  // Parse JSON from response (handle markdown code fences)
  const jsonMatch =
    fullText.match(/```json\s*([\s\S]*?)```/) ||
    fullText.match(/```\s*([\s\S]*?)```/) ||
    fullText.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    console.warn(`[aiResearch] ${config.region}: no JSON found in response`);
    return [];
  }

  let parsed: { deals: AIDeal[] };
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch (err) {
    console.warn(`[aiResearch] ${config.region}: JSON parse error:`, err);
    return [];
  }

  const deals: AIDeal[] = (parsed.deals ?? [])
    .filter((d) => d.origin && d.destination && d.airline && d.program && d.points > 0)
    .map((d) => ({
      origin: String(d.origin).toUpperCase().slice(0, 3),
      destination: String(d.destination).toUpperCase().slice(0, 3),
      airline: String(d.airline),
      program: String(d.program),
      points: Math.round(Number(d.points)),
      cashTaxUSD: Math.round(Number(d.cashTaxUSD ?? 0)),
      cabin: (["economy", "premium_economy", "business", "first"].includes(d.cabin)
        ? d.cabin
        : "business") as AIDeal["cabin"],
      notes: String(d.notes ?? ""),
      sourceUrl: d.sourceUrl ? String(d.sourceUrl) : undefined,
      confirmed: Boolean(d.confirmed),
      cpp: d.cpp != null ? Math.round(Number(d.cpp) * 100) / 100 : undefined,
      transferableFrom: Array.isArray(d.transferableFrom) ? d.transferableFrom.map(String) : undefined,
      expiresAt: d.expiresAt ? String(d.expiresAt) : undefined,
      region: config.region,
    }));

  console.log(`[aiResearch] ${config.region}: ${deals.length} valid deals`);
  return deals;
}

// ── Deduplication ───────────────────────────────────────────────────────────

function deduplicateDeals(deals: AIDeal[]): AIDeal[] {
  const seen = new Map<string, AIDeal>();

  for (const deal of deals) {
    const key = `${deal.origin}:${deal.destination}:${deal.program}:${deal.cabin}`.toLowerCase();
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, deal);
    } else {
      // Keep the deal with better CPP, or fewer points if CPP is tied
      const existingCpp = existing.cpp ?? 0;
      const newCpp = deal.cpp ?? 0;
      if (newCpp > existingCpp || (newCpp === existingCpp && deal.points < existing.points)) {
        seen.set(key, deal);
      }
    }
  }

  return Array.from(seen.values());
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Run all 5 regional agents in parallel and merge results.
 * A failing agent is skipped (logged) so other regions still complete.
 */
export async function researchAllRegions(): Promise<AIResearchResult> {
  const client = new Anthropic();
  const today = new Date().toISOString().split("T")[0];
  const configs = buildRegionConfig(today);

  console.log(`[aiResearch] Launching ${configs.length} regional agents in parallel...`);
  const startMs = Date.now();

  const results = await Promise.allSettled(
    configs.map((cfg) => researchRegion(client, cfg)),
  );

  const allDeals: AIDeal[] = [];
  const regionCounts: Record<string, number> = {};

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const region = configs[i].region;
    if (result.status === "fulfilled") {
      allDeals.push(...result.value);
      regionCounts[region] = result.value.length;
    } else {
      console.error(`[aiResearch] ${region} agent failed:`, result.reason);
      regionCounts[region] = 0;
    }
  }

  const deduplicated = deduplicateDeals(allDeals);

  // Sort by CPP descending
  deduplicated.sort((a, b) => (b.cpp ?? 0) - (a.cpp ?? 0));

  const totalMs = Date.now() - startMs;
  console.log(
    `[aiResearch] All agents done in ${totalMs}ms. ` +
    `${deduplicated.length} unique deals from ${allDeals.length} raw deals.`
  );

  const regionSummary = Object.entries(regionCounts)
    .filter(([, n]) => n > 0)
    .map(([r, n]) => `${n} ${r}`)
    .join(", ");

  const summary =
    `Today's research found ${deduplicated.length} award deals across all regions ` +
    `(${regionSummary}). Deals span US domestic, Europe, Asia-Pacific, Latin America, ` +
    `and active transfer bonuses — sorted by cents-per-point value.`;

  return {
    deals: deduplicated,
    researchedAt: new Date().toISOString(),
    summary,
  };
}

/**
 * @deprecated Use researchAllRegions() instead.
 * Kept for backward compatibility with the cron endpoint.
 */
export const researchDeals = researchAllRegions;
