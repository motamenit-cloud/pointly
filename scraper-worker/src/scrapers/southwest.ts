/**
 * Southwest Airlines Rapid Rewards Award Search (Claude browser agent)
 *
 * Southwest uses revenue-based pricing — points are directly tied to cash fares.
 * Their website shows the real-time Rapid Rewards points price for every fare
 * bucket without requiring login.
 *
 * Target: https://www.southwest.com/air/booking/
 */

import pino from "pino";
import { getContext, releaseContext } from "../pool.js";
import { runClaudeAgent } from "../claude-agent.js";
import type { AwardResult, ScrapeRequest, ClaudeAgentConfig } from "../types.js";

const logger = pino({ level: "info" });

const SYSTEM_PROMPT = `You are an expert at navigating Southwest Airlines' website to find real-time Rapid Rewards points pricing for award flights.

Your goal: search southwest.com for award flights showing the actual Rapid Rewards points required.

Key facts about Southwest award search:
- URL: https://www.southwest.com/air/booking/
- Toggle search type to "Points" to see Rapid Rewards pricing (not cash fares)
- Southwest only has one cabin (Economy) but multiple fare types: Wanna Get Away, Wanna Get Away+, Anytime, Business Select
- All fare types show their points price when searching with Points toggle ON
- No login required to see points prices
- Southwest does NOT appear in GDS/third-party sites — this is the only way to get real pricing
- Points = cash price / 0.014 (approx 1.4 cents per point)
- Taxes on award flights are $5.60 each way

Instructions:
1. Navigate to https://www.southwest.com/air/booking/
2. Take a screenshot to see the current page state
3. Accept any cookie consent or privacy banners
4. Click the "Points" radio button or toggle (to switch from $ to points)
5. Select "One-way" trip type
6. Enter the origin airport/city
7. Enter the destination airport/city
8. Select the travel date
9. Set passengers to 1 adult
10. Click Search
11. Wait for results and take a screenshot
12. Extract the LOWEST points option (Wanna Get Away rate) and the cabin class
13. Taxes for Southwest awards are $5.60 = 560 cents
14. Call return_award_results with the data

Use source: "southwest" and sourceName: "Southwest Rapid Rewards" for all results.
Southwest only operates on domestic US + near-international routes. If the route is not served, call return_award_results with an empty array.`;

const CONFIG: ClaudeAgentConfig = {
  airlineName: "Southwest Rapid Rewards",
  systemPrompt: SYSTEM_PROMPT,
};

export async function scrapeSouthwest(request: ScrapeRequest): Promise<AwardResult[]> {
  const context = await getContext();
  const page = await context.newPage();

  try {
    logger.info(
      { route: `${request.origin}-${request.destination}` },
      "Starting Southwest Rapid Rewards scrape",
    );

    const results = await runClaudeAgent(CONFIG, request, page);

    logger.info(
      { route: `${request.origin}-${request.destination}`, count: results.length },
      "Southwest Rapid Rewards scrape complete",
    );

    return results;
  } catch (err) {
    logger.error({ err }, "Southwest scrape error");
    throw err;
  } finally {
    await page.close();
    await releaseContext(context);
  }
}
