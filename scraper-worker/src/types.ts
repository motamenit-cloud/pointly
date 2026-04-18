/** Shared types for the scraper worker. */

export interface ScrapeRequest {
  carrier: string;
  origin: string;
  destination: string;
  date: string;
  cabin: string;
}

export type ScrapeJobStatus = "pending" | "scraping" | "complete" | "failed";

export interface ScrapeJob {
  jobId: string;
  status: ScrapeJobStatus;
  carrier: string;
  results?: AwardResult[];
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/** Matches the AwardResult type in the Next.js app. */
export interface AwardResult {
  source: string;
  sourceName: string;
  carrierCodes: string[];
  origin: string;
  destination: string;
  date: string;
  cabin: string;
  mileageCost: number;
  taxes: number;
  taxesCurrency: string;
  remainingSeats: number;
  isDirect: boolean;
  availabilityId?: string;
  dataQuality?: "live" | "cached" | "estimated";
  scrapedAt?: string;
}

/**
 * Config passed to runClaudeAgent() for each airline.
 * systemPrompt describes the site flow; initialPrompt is the first user message.
 */
export interface ClaudeAgentConfig {
  airlineName: string;
  systemPrompt: string;
}

/** Carriers that have live scraper implementations in this worker. */
export const SCRAPABLE_CARRIERS = ["AA", "DL", "AC", "BA", "AF", "WN", "B6"] as const;
export type ScrapableCarrier = (typeof SCRAPABLE_CARRIERS)[number];
