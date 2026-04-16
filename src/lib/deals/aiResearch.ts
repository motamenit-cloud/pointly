/**
 * Claude-powered daily business class deal research agent.
 * Uses Claude Opus 4.6 with the web_search tool to find real-time
 * award deals from blogs, airline sites, transfer bonuses, and flash sales.
 */

import Anthropic from "@anthropic-ai/sdk";

export interface AIDeal {
  /** Origin airport code (e.g. "JFK") */
  origin: string;
  /** Destination airport code (e.g. "LHR") */
  destination: string;
  /** Airline operating the flight */
  airline: string;
  /** Points currency / loyalty program (e.g. "Chase Ultimate Rewards") */
  program: string;
  /** Points cost one-way per person */
  points: number;
  /** Cash taxes/fees in USD */
  cashTaxUSD: number;
  /** Cabin class */
  cabin: "business" | "first";
  /** Human-readable notes (why it's a good deal, how to book, expiry, etc.) */
  notes: string;
  /** Source URL where the deal was found */
  sourceUrl?: string;
  /** Whether availability is confirmed or estimated */
  confirmed: boolean;
  /** CPP value if mentioned in the source */
  cpp?: number;
}

export interface AIResearchResult {
  deals: AIDeal[];
  /** ISO date string when research was run */
  researchedAt: string;
  /** Short summary paragraph from Claude */
  summary: string;
}

const SYSTEM_PROMPT = `You are an expert award travel researcher specializing in business class redemptions using points and miles. Your job is to search the internet right now and find the best current business class award deals available today.

Focus on:
1. Flash sales and limited-time transfer bonuses (Chase, Amex, Citi, Capital One, Bilt)
2. Sweet-spot redemptions on major airlines (ANA, Singapore, Cathay, Air France/KLM, Virgin Atlantic, Avianca, Turkish, etc.)
3. Partner award chart deals (e.g., United miles for ANA business, Virgin Atlantic for ANA/Delta, etc.)
4. Award availability on routes like JFK-LHR, LAX-NRT, JFK-CDG, JFK-SIN, LAX-SYD, ORD-FRA
5. Recent blog posts from The Points Guy, View from the Wing, One Mile at a Time, Seat 31B, Frequent Miler

For each deal you find, extract:
- Route (origin → destination airport codes)
- Airline
- Points program and cost (one-way, per person)
- Estimated taxes/fees
- Why it's valuable (CPP, compared to normal rates)
- How to book it
- Any expiry or availability notes

You MUST respond with valid JSON matching this exact schema:
{
  "summary": "2-3 sentence overview of today's deal landscape",
  "deals": [
    {
      "origin": "JFK",
      "destination": "LHR",
      "airline": "British Airways",
      "program": "American Airlines AAdvantage",
      "points": 57500,
      "cashTaxUSD": 250,
      "cabin": "business",
      "notes": "AA miles price on BA Club World. Sweet spot before chart repricing.",
      "sourceUrl": "https://...",
      "confirmed": true,
      "cpp": 5.2
    }
  ]
}

Return 5-15 deals. Only include genuine award redemptions (not cash fares). Prioritize deals available NOW or within the next 60 days.`;

/**
 * Run the Claude web search agent to find today's best business class deals.
 * Uses adaptive thinking + streaming for reliability.
 */
export async function researchDeals(): Promise<AIResearchResult> {
  const client = new Anthropic();

  const today = new Date().toISOString().split("T")[0];

  const userMessage = `Today is ${today}. Search the web right now and find the best business class award redemptions available. Look for:
1. Current transfer bonuses from Chase, Amex, Citi, Capital One, or Bilt transferring to airline programs
2. Flash award sales (like ANA, Singapore Airlines, Air France, etc.)
3. The best sweet-spot redemptions available right now on major business class routes
4. Any new award chart changes or devaluations that make current prices extra valuable
5. Specific routes with confirmed saver availability

Check sources like thepointsguy.com, viewfromthewing.com, onemileatatime.com, frequentmiler.com, and airline sites directly.

Return your findings as JSON.`;

  let fullText = "";

  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
      } as Parameters<typeof client.messages.stream>[0]["tools"][0],
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const finalMessage = await stream.finalMessage();

  // Extract text content from response
  for (const block of finalMessage.content) {
    if (block.type === "text") {
      fullText += block.text;
    }
  }

  // Parse JSON from the response (Claude may wrap it in markdown code fences)
  const jsonMatch =
    fullText.match(/```json\s*([\s\S]*?)```/) ||
    fullText.match(/```\s*([\s\S]*?)```/) ||
    fullText.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    console.error("[aiResearch] No JSON found in response:", fullText.slice(0, 500));
    throw new Error("Claude did not return valid JSON");
  }

  let parsed: { summary: string; deals: AIDeal[] };
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch (err) {
    console.error("[aiResearch] JSON parse error:", err, jsonMatch[1].slice(0, 500));
    throw new Error("Failed to parse Claude JSON response");
  }

  // Validate and sanitize deals
  const deals: AIDeal[] = (parsed.deals ?? [])
    .filter(
      (d) =>
        d.origin &&
        d.destination &&
        d.airline &&
        d.program &&
        d.points > 0,
    )
    .map((d) => ({
      origin: String(d.origin).toUpperCase().slice(0, 3),
      destination: String(d.destination).toUpperCase().slice(0, 3),
      airline: String(d.airline),
      program: String(d.program),
      points: Math.round(Number(d.points)),
      cashTaxUSD: Math.round(Number(d.cashTaxUSD ?? 0)),
      cabin: d.cabin === "first" ? "first" : "business",
      notes: String(d.notes ?? ""),
      sourceUrl: d.sourceUrl ? String(d.sourceUrl) : undefined,
      confirmed: Boolean(d.confirmed),
      cpp: d.cpp != null ? Math.round(Number(d.cpp) * 100) / 100 : undefined,
    }));

  return {
    deals,
    researchedAt: new Date().toISOString(),
    summary: String(parsed.summary ?? ""),
  };
}
