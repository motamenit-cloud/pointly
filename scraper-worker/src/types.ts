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
