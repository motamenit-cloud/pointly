import { NextRequest, NextResponse } from "next/server";
import { getJobStatus } from "@/lib/scraper/client";

/**
 * GET /api/scrape/status?jobId=xxx
 *
 * Polls the scraper worker for the status of a scrape job.
 * Returns the job status and results if complete.
 */
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing required parameter: jobId" },
      { status: 400 },
    );
  }

  const job = await getJobStatus(jobId);

  if (!job) {
    return NextResponse.json(
      { error: "Could not reach scraper worker" },
      { status: 503 },
    );
  }

  return NextResponse.json(job);
}
