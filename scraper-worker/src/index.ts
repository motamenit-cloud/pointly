/**
 * Scraper Worker Service
 *
 * Express server that accepts scrape requests, runs Playwright-based scrapers,
 * and returns award availability results.
 *
 * Endpoints:
 *   POST /scrape     — trigger a new scrape job
 *   GET /status/:id  — check job status / get results
 *   GET /health      — health check
 */

import express from "express";
import pino from "pino";
import { v4 as uuid } from "uuid";
import { getBrowserPool } from "./pool.js";
import { scrapeAA } from "./scrapers/aa.js";
import { scrapeDelta } from "./scrapers/delta.js";
import type { ScrapeJob, ScrapeRequest } from "./types.js";

const logger = pino({ level: "info" });

const app = express();
app.use(express.json());

/* ── Job store (in-memory) ── */
const jobs = new Map<string, ScrapeJob>();

// Clean up old jobs every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000; // 30 min
  for (const [id, job] of jobs) {
    if (new Date(job.createdAt).getTime() < cutoff) {
      jobs.delete(id);
    }
  }
}, 5 * 60 * 1000);

/* ── Auth middleware ── */
function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) {
    // No auth configured — allow all (dev mode)
    next();
    return;
  }

  const auth = req.headers.authorization;
  if (auth !== `Bearer ${apiKey}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

app.use(authMiddleware);

/* ── POST /scrape ── */
app.post("/scrape", (req, res) => {
  const body = req.body as ScrapeRequest;

  if (!body.carrier || !body.origin || !body.destination || !body.date || !body.cabin) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const jobId = uuid();
  const job: ScrapeJob = {
    jobId,
    status: "pending",
    carrier: body.carrier,
    createdAt: new Date().toISOString(),
  };

  jobs.set(jobId, job);
  logger.info({ jobId, carrier: body.carrier, route: `${body.origin}-${body.destination}` }, "Scrape job created");

  // Run scraper in background
  runScraper(jobId, body).catch((err) => {
    logger.error({ jobId, err }, "Scraper failed");
  });

  res.json({ jobId });
});

/* ── GET /status/:id ── */
app.get("/status/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(job);
});

/* ── GET /health ── */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", jobs: jobs.size });
});

/* ── Scraper runner ── */
async function runScraper(jobId: string, request: ScrapeRequest) {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = "scraping";

  try {
    let results;

    switch (request.carrier) {
      case "AA":
        results = await scrapeAA(request);
        break;
      case "DL":
        results = await scrapeDelta(request);
        break;
      default:
        throw new Error(`Unsupported carrier: ${request.carrier}`);
    }

    job.status = "complete";
    job.results = results;
    job.completedAt = new Date().toISOString();
    logger.info({ jobId, carrier: request.carrier, resultCount: results.length }, "Scrape complete");
  } catch (err) {
    job.status = "failed";
    job.error = err instanceof Error ? err.message : "Unknown error";
    job.completedAt = new Date().toISOString();
    logger.error({ jobId, carrier: request.carrier, error: job.error }, "Scrape failed");
  }
}

/* ── Start server ── */
const PORT = parseInt(process.env.PORT || "4000", 10);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Scraper worker started");

  // Pre-warm browser pool
  getBrowserPool().then(() => {
    logger.info("Browser pool initialized");
  }).catch((err) => {
    logger.error({ err }, "Failed to init browser pool");
  });
});

export type { ScrapeRequest, ScrapeJob };
