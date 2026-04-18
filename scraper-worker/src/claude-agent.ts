/**
 * Claude-powered browser agent for live airline award search.
 *
 * Uses Claude's tool-use API to drive a Playwright browser page. Claude takes
 * screenshots, navigates to airline websites, fills search forms, and extracts
 * real-time award pricing — adapting to UI changes without hardcoded selectors.
 *
 * Flow:
 * 1. Caller provides a ClaudeAgentConfig with an airline-specific system prompt
 * 2. Agent loop: Claude calls browser tools, Playwright executes them
 * 3. Claude calls return_award_results() when it has extracted the data
 * 4. Results returned as AwardResult[]
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Page } from "playwright";
import pino from "pino";
import type { AwardResult, ClaudeAgentConfig, ScrapeRequest } from "./types.js";

const logger = pino({ level: "info" });

const MAX_TURNS = 12;
const MODEL = "claude-haiku-4-5-20251001";

// Tool definitions passed to Claude on every turn
const BROWSER_TOOLS: Anthropic.Tool[] = [
  {
    name: "navigate_to",
    description: "Navigate the browser to a URL. Use this to go to airline award search pages.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "The full URL to navigate to" },
      },
      required: ["url"],
    },
  },
  {
    name: "take_screenshot",
    description: "Take a screenshot of the current page so you can see its state. Use this after navigating or after interactions to understand what's on screen.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "click",
    description: "Click on an element. Provide a CSS selector or descriptive text of the element to click (e.g. 'Search flights button', '#submit-btn', 'text=Accept'). Try text-based descriptions first.",
    input_schema: {
      type: "object" as const,
      properties: {
        target: { type: "string", description: "CSS selector or text description of element to click" },
      },
      required: ["target"],
    },
  },
  {
    name: "fill_input",
    description: "Fill a text input field. Provide a selector or description, and the value to type.",
    input_schema: {
      type: "object" as const,
      properties: {
        target: { type: "string", description: "CSS selector or description of the input field" },
        value: { type: "string", description: "Text to type into the field" },
      },
      required: ["target", "value"],
    },
  },
  {
    name: "select_option",
    description: "Select an option from a <select> dropdown. Provide a selector and the option value or label.",
    input_schema: {
      type: "object" as const,
      properties: {
        target: { type: "string", description: "CSS selector for the <select> element" },
        value: { type: "string", description: "Option value or visible label text to select" },
      },
      required: ["target", "value"],
    },
  },
  {
    name: "press_key",
    description: "Press a keyboard key (e.g. Enter, Tab, Escape, ArrowDown). Use after filling inputs or to dismiss dialogs.",
    input_schema: {
      type: "object" as const,
      properties: {
        key: { type: "string", description: "Key name e.g. Enter, Tab, Escape, ArrowDown" },
      },
      required: ["key"],
    },
  },
  {
    name: "wait_for_content",
    description: "Wait for a specific element or text to appear on the page. Use after clicking Search to wait for results.",
    input_schema: {
      type: "object" as const,
      properties: {
        selector: { type: "string", description: "CSS selector or text to wait for" },
        timeout_ms: { type: "number", description: "How long to wait in milliseconds (default 15000)" },
      },
      required: ["selector"],
    },
  },
  {
    name: "get_page_text",
    description: "Extract all visible text from the current page. Use this to read flight results, error messages, or page content when a screenshot isn't sufficient.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "return_award_results",
    description: "Call this when you have successfully extracted award flight data. This ends the search and returns the results. If no award flights are available for this route/date, call this with an empty array.",
    input_schema: {
      type: "object" as const,
      properties: {
        results: {
          type: "array",
          description: "Array of award flight results extracted from the page",
          items: {
            type: "object",
            properties: {
              source: { type: "string", description: "Loyalty program key e.g. 'aeroplan', 'ba', 'flyingblue', 'southwest', 'jetblue'" },
              sourceName: { type: "string", description: "Human-readable program name e.g. 'Air Canada Aeroplan'" },
              carrierCodes: { type: "array", items: { type: "string" }, description: "IATA codes of operating airlines e.g. ['UA', 'AC']" },
              mileageCost: { type: "number", description: "Points/miles required (integer)" },
              taxes: { type: "number", description: "Taxes in cents (e.g. $45.00 = 4500)" },
              taxesCurrency: { type: "string", description: "Currency code e.g. USD, CAD, GBP" },
              cabin: { type: "string", description: "Cabin class: economy, premium_economy, business, or first" },
              isDirect: { type: "boolean", description: "True if this is a nonstop/direct flight" },
              remainingSeats: { type: "number", description: "Seats remaining (0 if unknown)" },
            },
            required: ["source", "sourceName", "carrierCodes", "mileageCost", "taxes", "taxesCurrency", "cabin", "isDirect", "remainingSeats"],
          },
        },
      },
      required: ["results"],
    },
  },
];

/** Execute a single browser tool call against the Playwright page. */
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  page: Page,
): Promise<string | Anthropic.ImageBlockParam> {
  try {
    switch (toolName) {
      case "navigate_to": {
        const url = toolInput.url as string;
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(1500 + Math.random() * 1000);
        return `Navigated to ${url}`;
      }

      case "take_screenshot": {
        const buffer = await page.screenshot({ type: "jpeg", quality: 60 });
        const base64 = buffer.toString("base64");
        return {
          type: "image",
          source: { type: "base64", media_type: "image/jpeg", data: base64 },
        };
      }

      case "click": {
        const target = toolInput.target as string;
        // Try CSS selector first, then text-based locator
        try {
          await page.click(target, { timeout: 5000 });
        } catch {
          try {
            await page.locator(`text=${target}`).first().click({ timeout: 5000 });
          } catch {
            await page.locator(target).first().click({ timeout: 5000 });
          }
        }
        await page.waitForTimeout(500);
        return `Clicked: ${target}`;
      }

      case "fill_input": {
        const target = toolInput.target as string;
        const value = toolInput.value as string;
        try {
          await page.fill(target, value, { timeout: 5000 });
        } catch {
          await page.locator(target).first().fill(value);
        }
        await page.waitForTimeout(300);
        return `Filled "${target}" with "${value}"`;
      }

      case "select_option": {
        const target = toolInput.target as string;
        const value = toolInput.value as string;
        try {
          await page.selectOption(target, { label: value }, { timeout: 5000 });
        } catch {
          await page.selectOption(target, { value }, { timeout: 5000 });
        }
        return `Selected "${value}" in ${target}`;
      }

      case "press_key": {
        const key = toolInput.key as string;
        await page.keyboard.press(key);
        await page.waitForTimeout(300);
        return `Pressed ${key}`;
      }

      case "wait_for_content": {
        const selector = toolInput.selector as string;
        const timeout = (toolInput.timeout_ms as number) || 15000;
        try {
          await page.waitForSelector(selector, { timeout });
          return `Found: ${selector}`;
        } catch {
          // Try text match as fallback
          await page.waitForFunction(
            (text: string) => document.body.innerText.includes(text),
            selector,
            { timeout },
          );
          return `Found text: ${selector}`;
        }
      }

      case "get_page_text": {
        const text = await page.evaluate(
          () => document.body.innerText.slice(0, 8000),
        );
        return text || "(empty page)";
      }

      // return_award_results is handled at the call site — should not reach here
      default:
        return `Unknown tool: ${toolName}`;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `Error executing ${toolName}: ${msg}`;
  }
}

/**
 * Run a Claude browser agent for a single airline search.
 *
 * @param config  Airline-specific system prompt describing the site flow
 * @param request Search parameters (origin, destination, date, cabin)
 * @param page    Playwright page from the browser pool
 */
export async function runClaudeAgent(
  config: ClaudeAgentConfig,
  request: ScrapeRequest,
  page: Page,
): Promise<AwardResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set — Claude agents require this env var");
  }

  const anthropic = new Anthropic({ apiKey });
  const now = new Date().toISOString();

  const initialUserMessage = `Search for award flights with these parameters:
- Origin: ${request.origin}
- Destination: ${request.destination}
- Date: ${request.date}
- Cabin: ${request.cabin}

Start by navigating to the airline's award search page. Take a screenshot after loading to see the current state, then fill in the search parameters and submit. Once results appear, extract all available award options and call return_award_results.`;

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: initialUserMessage },
  ];

  logger.info(
    { airline: config.airlineName, route: `${request.origin}-${request.destination}` },
    "Starting Claude agent search",
  );

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: config.systemPrompt,
      tools: BROWSER_TOOLS,
      messages,
    });

    logger.info(
      { airline: config.airlineName, turn, stopReason: response.stop_reason },
      "Claude agent turn",
    );

    if (response.stop_reason === "end_turn") {
      logger.warn({ airline: config.airlineName }, "Claude agent ended without calling return_award_results");
      break;
    }

    // Collect tool results for this turn
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    let finalResults: AwardResult[] | null = null;

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      if (block.name === "return_award_results") {
        // Terminal tool — build AwardResult[] from Claude's output
        const raw = (block.input as { results: Array<Record<string, unknown>> }).results;
        finalResults = raw.map((r, i) => ({
          source: String(r.source),
          sourceName: String(r.sourceName),
          carrierCodes: (r.carrierCodes as string[]) || [],
          origin: request.origin,
          destination: request.destination,
          date: request.date,
          cabin: String(r.cabin),
          mileageCost: Number(r.mileageCost),
          taxes: Number(r.taxes),
          taxesCurrency: String(r.taxesCurrency || "USD"),
          remainingSeats: Number(r.remainingSeats || 0),
          isDirect: Boolean(r.isDirect),
          availabilityId: `${r.source}-live-${request.origin}-${request.destination}-${i}`,
          dataQuality: "live" as const,
          scrapedAt: now,
        }));
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: "Results recorded. Done.",
        });
        break;
      }

      // Execute browser tool
      const result = await executeTool(
        block.name,
        block.input as Record<string, unknown>,
        page,
      );

      if (typeof result === "string") {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      } else {
        // Image block (screenshot)
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: [result],
        });
      }
    }

    if (finalResults !== null) {
      logger.info(
        { airline: config.airlineName, count: finalResults.length },
        "Claude agent returned results",
      );
      return finalResults;
    }

    // Append assistant turn + tool results and continue
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  logger.warn({ airline: config.airlineName }, "Claude agent reached max turns without results");
  return [];
}
