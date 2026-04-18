/**
 * Shared types for scraper worker communication.
 * Used by both the Next.js client and the scraper worker service.
 */

import type { AwardResult, CabinClass } from "../providers/types";

/** Request to scrape award availability for a specific airline. */
export interface ScrapeRequest {
  carrier: string; // IATA code: "AA", "DL", "AC", "BA", "AF", "WN", "B6"
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  cabin: CabinClass;
}

/** Status of a scrape job. */
export type ScrapeJobStatus =
  | "pending"
  | "scraping"
  | "complete"
  | "failed";

/** A scrape job returned by the worker. */
export interface ScrapeJob {
  jobId: string;
  status: ScrapeJobStatus;
  carrier: string;
  /** Award results when status is "complete". */
  results?: AwardResult[];
  /** Error message when status is "failed". */
  error?: string;
  /** When the job was created. */
  createdAt: string;
  /** When the job finished (complete or failed). */
  completedAt?: string;
}

/** Configuration for connecting to the scraper worker. */
export interface ScraperConfig {
  /** Base URL of the scraper worker (e.g. http://localhost:4000). */
  workerUrl: string;
  /** Shared API key for authentication. */
  apiKey: string;
  /** Request timeout in ms (default 30000). */
  timeout: number;
}

/** Cache entry for scraped award data. */
export interface CacheEntry {
  results: AwardResult[];
  scrapedAt: string; // ISO timestamp
  expiresAt: number; // Unix timestamp in ms
}

/** Airlines that support live scraping via the scraper worker. */
export const SCRAPABLE_CARRIERS = [
  "AA",  // American Airlines — Playwright, direct
  "DL",  // Delta SkyMiles — Playwright, via Virgin Atlantic
  "AC",  // Air Canada Aeroplan — Claude agent (Star Alliance)
  "BA",  // British Airways Avios — Claude agent (oneworld)
  "AF",  // Air France/KLM Flying Blue — Claude agent (SkyTeam)
  "WN",  // Southwest Rapid Rewards — Claude agent
  "B6",  // JetBlue TrueBlue — Claude agent
] as const;
export type ScrapableCarrier = (typeof SCRAPABLE_CARRIERS)[number];

/** TTL per carrier in seconds. */
export const CACHE_TTL: Record<ScrapableCarrier, number> = {
  AA: 900,   // 15 minutes
  DL: 600,   // 10 minutes (volatile dynamic pricing)
  AC: 900,   // 15 minutes
  BA: 900,   // 15 minutes
  AF: 900,   // 15 minutes
  WN: 600,   // 10 minutes (revenue-based, changes with demand)
  B6: 600,   // 10 minutes
};

/** Maximum age for stale cache fallback (2 hours). */
export const STALE_TTL = 7200;
