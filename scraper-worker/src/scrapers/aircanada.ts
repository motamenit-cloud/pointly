/**
 * Air Canada Aeroplan Award Search (Claude browser agent)
 *
 * Aeroplan is one of the most valuable programs to search because it shows
 * availability across the entire Star Alliance network — United, Lufthansa,
 * ANA, Swiss, Air Canada, Singapore, TAP, and more — all without login.
 *
 * Target: https://www.aircanada.com/aeroplan/redeem/flights/
 */

import pino from "pino";
import { getContext, releaseContext } from "../pool.js";
import { runClaudeAgent } from "../claude-agent.js";
import type { AwardResult, ScrapeRequest, ClaudeAgentConfig } from "../types.js";

const logger = pino({ level: "info" });

const SYSTEM_PROMPT = `You are an expert at navigating Air Canada's Aeroplan award flight search to find real-time award availability.

Your goal: search https://www.aircanada.com/aeroplan/redeem/flights/ for award flights matching the requested parameters, then extract all available award options.

Key facts about the Aeroplan search page:
- It's a public search — no login required
- There are fields for origin airport, destination airport, travel date, and cabin class
- After searching, results show each available flight with points required and taxes
- Results may include flights operated by United (UA), Lufthansa (LH), ANA (NH), Air Canada (AC), Swiss (LX), and other Star Alliance partners
- The cabin selector typically offers: Economy, Premium Economy, Business, First

Instructions:
1. Navigate to https://www.aircanada.com/aeroplan/redeem/flights/
2. Take a screenshot to see the current page state
3. Accept any cookie consent banners
4. Fill in the origin airport code
5. Fill in the destination airport code
6. Select the travel date
7. Select the requested cabin class
8. Click the Search button
9. Wait for results to load (this may take 5-15 seconds)
10. Take a screenshot to see the results
11. Extract ALL available award options — for each option record:
    - The operating airline IATA code(s) (e.g. UA, LH, AC)
    - Points required
    - Taxes/fees amount and currency
    - Whether it's a direct/nonstop flight
    - Number of seats remaining (if shown)
    - Cabin class
12. Call return_award_results with the extracted data

Use source: "aeroplan" and sourceName: "Air Canada Aeroplan" for all results.
If the page shows an error or no flights are available, call return_award_results with an empty array.`;

const CONFIG: ClaudeAgentConfig = {
  airlineName: "Air Canada Aeroplan",
  systemPrompt: SYSTEM_PROMPT,
};

export async function scrapeAirCanada(request: ScrapeRequest): Promise<AwardResult[]> {
  const context = await getContext();
  const page = await context.newPage();

  try {
    logger.info(
      { route: `${request.origin}-${request.destination}`, cabin: request.cabin },
      "Starting Air Canada Aeroplan scrape",
    );

    const results = await runClaudeAgent(CONFIG, request, page);

    logger.info(
      { route: `${request.origin}-${request.destination}`, count: results.length },
      "Air Canada Aeroplan scrape complete",
    );

    return results;
  } catch (err) {
    logger.error({ err }, "Air Canada Aeroplan scrape error");
    throw err;
  } finally {
    await page.close();
    await releaseContext(context);
  }
}
