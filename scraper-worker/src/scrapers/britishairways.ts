/**
 * British Airways Executive Club Avios Award Search (Claude browser agent)
 *
 * BA's award search reveals availability across the entire oneworld network —
 * American Airlines (AA), Iberia, Qatar Airways, Japan Airlines (JL), Cathay
 * Pacific (CX), Finnair, and others — without requiring login for search.
 *
 * Target: https://www.britishairways.com/travel/redeem/execclub/_gf/en_gb
 */

import pino from "pino";
import { getContext, releaseContext } from "../pool.js";
import { runClaudeAgent } from "../claude-agent.js";
import type { AwardResult, ScrapeRequest, ClaudeAgentConfig } from "../types.js";

const logger = pino({ level: "info" });

const SYSTEM_PROMPT = `You are an expert at navigating British Airways' Executive Club Avios award flight search to find real-time award availability.

Your goal: search British Airways for award flights and extract all available options.

Key facts about BA's award search:
- Public search at https://www.britishairways.com/travel/redeem/execclub/_gf/en_gb
- Shows availability across the oneworld alliance: AA (American), IB (Iberia), QR (Qatar), JL (JAL), CX (Cathay), AY (Finnair), RJ (Royal Jordanian)
- Prices are in Avios points + taxes
- Cabin classes: Economy (M class), Premium Economy (W class), Business/Club World (J class), First (F class)
- Results are grouped by fare type; look for the lowest Avios option

Instructions:
1. Navigate to https://www.britishairways.com/travel/redeem/execclub/_gf/en_gb
2. Take a screenshot to see the current page state
3. Accept any cookie consent banners
4. Select "One Way" if round-trip is pre-selected
5. Enter the origin airport in the "From" field
6. Enter the destination airport in the "To" field
7. Select the travel date using the date picker
8. Select the number of passengers (1 adult)
9. Click Search
10. Wait for results to load (may take 5-15 seconds)
11. Take a screenshot to see the results
12. Extract ALL available flights with their Avios cost, taxes, operating carrier, stops, and cabin
13. Call return_award_results with the data

Use source: "ba" and sourceName: "British Airways Executive Club" for all results.
If no flights are available or an error occurs, call return_award_results with an empty array.`;

const CONFIG: ClaudeAgentConfig = {
  airlineName: "British Airways Executive Club",
  systemPrompt: SYSTEM_PROMPT,
};

export async function scrapeBA(request: ScrapeRequest): Promise<AwardResult[]> {
  const context = await getContext();
  const page = await context.newPage();

  try {
    logger.info(
      { route: `${request.origin}-${request.destination}`, cabin: request.cabin },
      "Starting British Airways Avios scrape",
    );

    const results = await runClaudeAgent(CONFIG, request, page);

    logger.info(
      { route: `${request.origin}-${request.destination}`, count: results.length },
      "British Airways Avios scrape complete",
    );

    return results;
  } catch (err) {
    logger.error({ err }, "British Airways Avios scrape error");
    throw err;
  } finally {
    await page.close();
    await releaseContext(context);
  }
}
