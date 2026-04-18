/**
 * JetBlue TrueBlue Award Search (Claude browser agent)
 *
 * JetBlue uses revenue-based pricing. Their website shows real-time TrueBlue
 * points prices directly. No login required to view points pricing.
 *
 * Target: https://www.jetblue.com/book-a-flight
 */

import pino from "pino";
import { getContext, releaseContext } from "../pool.js";
import { runClaudeAgent } from "../claude-agent.js";
import type { AwardResult, ScrapeRequest, ClaudeAgentConfig } from "../types.js";

const logger = pino({ level: "info" });

const SYSTEM_PROMPT = `You are an expert at navigating JetBlue's website to find real-time TrueBlue points pricing for award flights.

Your goal: search jetblue.com for award flights and extract the actual TrueBlue points required.

Key facts about JetBlue TrueBlue award search:
- URL: https://www.jetblue.com/book-a-flight
- Toggle to "Points" view to see TrueBlue pricing instead of cash fares
- JetBlue has Economy and Mint (business) cabins on select routes
- Revenue-based: points = cash price / 0.013 (approx 1.3 cents per point)
- No login required to view points availability
- JetBlue primarily serves US domestic, Caribbean, and select transatlantic routes (LHR, LGW, AMS)
- Taxes on award flights are typically $5.60

Instructions:
1. Navigate to https://www.jetblue.com/book-a-flight
2. Take a screenshot to see the current page state
3. Accept any cookie consent banners
4. Click "Points" tab or toggle to switch to points view
5. Select "One-way" trip type if round-trip is default
6. Enter the origin airport in the "Depart from" field
7. Enter the destination airport in the "Fly to" field
8. Select the travel date
9. Set 1 passenger
10. Select cabin if applicable (Economy or Mint)
11. Click Search / Find flights
12. Wait for results and take a screenshot
13. Extract the lowest available points price and all fare types shown
14. Note if it's Mint (business) or regular (economy) class
15. Call return_award_results with the data

Use source: "jetblue" and sourceName: "JetBlue TrueBlue" for all results.
If JetBlue doesn't serve this route or no flights are available, call return_award_results with an empty array.`;

const CONFIG: ClaudeAgentConfig = {
  airlineName: "JetBlue TrueBlue",
  systemPrompt: SYSTEM_PROMPT,
};

export async function scrapeJetBlue(request: ScrapeRequest): Promise<AwardResult[]> {
  const context = await getContext();
  const page = await context.newPage();

  try {
    logger.info(
      { route: `${request.origin}-${request.destination}` },
      "Starting JetBlue TrueBlue scrape",
    );

    const results = await runClaudeAgent(CONFIG, request, page);

    logger.info(
      { route: `${request.origin}-${request.destination}`, count: results.length },
      "JetBlue TrueBlue scrape complete",
    );

    return results;
  } catch (err) {
    logger.error({ err }, "JetBlue scrape error");
    throw err;
  } finally {
    await page.close();
    await releaseContext(context);
  }
}
