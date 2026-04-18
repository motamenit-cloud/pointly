/**
 * Air France / KLM Flying Blue Award Search (Claude browser agent)
 *
 * Flying Blue is the loyalty program for Air France and KLM. It also shows
 * availability for SkyTeam partners including Delta (DL), Korean Air (KE),
 * China Southern, and others. Public search available without login.
 *
 * Target: https://wwws.airfrance.us/search/offers?cabin={}&passengers=1
 */

import pino from "pino";
import { getContext, releaseContext } from "../pool.js";
import { runClaudeAgent } from "../claude-agent.js";
import type { AwardResult, ScrapeRequest, ClaudeAgentConfig } from "../types.js";

const logger = pino({ level: "info" });

const SYSTEM_PROMPT = `You are an expert at navigating Air France's Flying Blue award flight search to find real-time award availability.

Your goal: search Air France / Flying Blue for award flights and extract all available options with their Miles cost.

Key facts about Flying Blue award search:
- Available at https://wwws.airfrance.us/search/offers (US site) or https://wwws.airfrance.fr
- Shows flights by Air France (AF), KLM (KL), Delta (DL), Korean Air (KE), and other SkyTeam partners
- Prices in Miles (Flying Blue Miles) + taxes
- Cabin classes: Economy, Premium Economy, Business, First (La Première)
- Dynamic pricing: Miles cost varies by date and demand
- Look for the "Pay with Miles" or "Miles + Cash" option toggle

Instructions:
1. Navigate to https://wwws.airfrance.us/search/offers
2. Take a screenshot to see the current page state
3. Accept any cookie consent banners
4. Look for a toggle to switch to "Miles" payment (not cash fares)
5. Enter the origin airport code
6. Enter the destination airport code
7. Select the travel date
8. Select 1 adult passenger
9. Select the cabin class
10. Search for flights
11. Wait for results and take a screenshot
12. Switch to Miles view if not already showing Miles
13. Extract ALL award options: carrier, Miles cost, taxes, cabin, stops, seats remaining
14. Call return_award_results with the data

Use source: "flyingblue" and sourceName: "Air France/KLM Flying Blue" for all results.
If no award flights are available, call return_award_results with an empty array.`;

const CONFIG: ClaudeAgentConfig = {
  airlineName: "Air France/KLM Flying Blue",
  systemPrompt: SYSTEM_PROMPT,
};

export async function scrapeFlyingBlue(request: ScrapeRequest): Promise<AwardResult[]> {
  const context = await getContext();
  const page = await context.newPage();

  try {
    logger.info(
      { route: `${request.origin}-${request.destination}`, cabin: request.cabin },
      "Starting Flying Blue scrape",
    );

    const results = await runClaudeAgent(CONFIG, request, page);

    logger.info(
      { route: `${request.origin}-${request.destination}`, count: results.length },
      "Flying Blue scrape complete",
    );

    return results;
  } catch (err) {
    logger.error({ err }, "Flying Blue scrape error");
    throw err;
  } finally {
    await page.close();
    await releaseContext(context);
  }
}
