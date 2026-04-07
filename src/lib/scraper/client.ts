/**
 * HTTP client for communicating with the scraper worker service.
 *
 * The scraper worker runs on a separate VPS (Playwright can't run on Vercel).
 * This client sends scrape requests and polls for results.
 */

import type { ScrapeRequest, ScrapeJob, ScraperConfig } from "./types";

function getConfig(): ScraperConfig | null {
  const workerUrl = process.env.SCRAPER_WORKER_URL;
  const apiKey = process.env.SCRAPER_API_KEY;

  if (!workerUrl || !apiKey) return null;

  return {
    workerUrl: workerUrl.replace(/\/$/, ""), // strip trailing slash
    apiKey,
    timeout: parseInt(process.env.SCRAPER_TIMEOUT || "30000", 10),
  };
}

/** Whether the scraper worker is configured. */
export function isScraperAvailable(): boolean {
  return getConfig() !== null;
}

/**
 * Request the worker to scrape award availability for an airline.
 * Returns a jobId that can be polled via getJobStatus().
 */
export async function requestScrape(
  request: ScrapeRequest,
): Promise<string | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000); // 5s timeout for trigger

    const response = await fetch(`${config.workerUrl}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      console.error(
        `[scraper-client] Trigger failed: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    return data.jobId || null;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[scraper-client] Trigger timed out");
    } else {
      console.error("[scraper-client] Trigger error:", err);
    }
    return null;
  }
}

/**
 * Check the status of a scrape job.
 */
export async function getJobStatus(jobId: string): Promise<ScrapeJob | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${config.workerUrl}/status/${jobId}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      console.error(
        `[scraper-client] Status check failed: ${response.status}`,
      );
      return null;
    }

    return await response.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[scraper-client] Status check timed out");
    } else {
      console.error("[scraper-client] Status check error:", err);
    }
    return null;
  }
}
