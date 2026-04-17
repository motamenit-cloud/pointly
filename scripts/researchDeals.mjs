/**
 * Standalone script: runs Claude AI deal research and saves to Upstash Redis.
 * Called by GitHub Actions daily — no Vercel timeout constraints.
 *
 * Usage: node scripts/researchDeals.mjs
 * Required env vars: ANTHROPIC_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

import Anthropic from "@anthropic-ai/sdk";

const AI_DEALS_CACHE_KEY = "ai-deals:v1:latest";
const AI_DEALS_TTL = 25 * 3600;

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

async function researchDeals() {
  const client = new Anthropic();
  const today = new Date().toISOString().split("T")[0];

  console.log(`[researchDeals] Starting research for ${today}...`);

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
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [{ type: "web_search_20260209", name: "web_search" }],
    messages: [{ role: "user", content: userMessage }],
  });

  const finalMessage = await stream.finalMessage();

  for (const block of finalMessage.content) {
    if (block.type === "text") fullText += block.text;
  }

  console.log(`[researchDeals] Got response (${fullText.length} chars)`);

  const jsonMatch =
    fullText.match(/```json\s*([\s\S]*?)```/) ||
    fullText.match(/```\s*([\s\S]*?)```/) ||
    fullText.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) throw new Error("No JSON found in Claude response");

  const parsed = JSON.parse(jsonMatch[1]);

  const deals = (parsed.deals ?? [])
    .filter((d) => d.origin && d.destination && d.airline && d.program && d.points > 0)
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

async function saveToRedis(result) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");

  const response = await fetch(`${url}/set/${AI_DEALS_CACHE_KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([JSON.stringify(result), "EX", AI_DEALS_TTL]),
  });

  if (!response.ok) throw new Error(`Redis set failed: ${response.statusText}`);
  console.log(`[researchDeals] Saved ${result.deals.length} deals to Redis`);
}

// Main
try {
  const result = await researchDeals();
  await saveToRedis(result);
  console.log(`✓ Done — ${result.deals.length} deals saved`);
  console.log(`Summary: ${result.summary}`);
} catch (err) {
  console.error("✗ Failed:", err);
  process.exit(1);
}
