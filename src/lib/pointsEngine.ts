import { TRANSFER_PARTNERS, CARRIER_TO_PROGRAM } from "./transferPartners";
import type { TransferOption } from "@/components/search/FlightResultCard";

// Cents-per-point valuations by cabin class.
// We divide the cash price by these to estimate how many points an award booking costs.
const CPP_VALUATIONS: Record<string, number> = {
  economy: 0.015,
  "premium economy": 0.018,
  business: 0.02,
  first: 0.025,
};

/**
 * Estimate award cost in points from a cash price.
 * cashPrice is in USD. Returns estimated points.
 */
export function estimateAwardCost(cashPrice: number, cabin: string): number {
  const cpp = CPP_VALUATIONS[cabin.toLowerCase()] ?? 0.015;
  const raw = Math.round(cashPrice / cpp);
  // Round to nearest 500
  return Math.round(raw / 500) * 500;
}

/**
 * Build all transfer options for a given airline carrier code and estimated points cost.
 */
export function buildTransferOptions(
  carrierCode: string,
  pointsCost: number,
): TransferOption[] {
  const programKey = CARRIER_TO_PROGRAM[carrierCode];
  if (!programKey) {
    // No known transfer partners for this airline — return direct-only
    return [{ program: carrierCode, points: pointsCost }];
  }

  // Find all credit card programs that transfer to this airline program
  const partners = TRANSFER_PARTNERS.filter((p) => p.to === programKey);

  const options: TransferOption[] = partners.map((p) => ({
    program: p.toName,
    points: Math.ceil(pointsCost / p.ratio),
    transferFrom: p.fromName,
    transferRatio: p.ratio === 1.0 ? "1:1" : `${Math.round(1 / p.ratio)}:1`,
    transferFromId: p.from,
    programKey: p.to,
  }));

  // Sort by points ascending, then deduplicate by transferFrom
  options.sort((a, b) => a.points - b.points);

  // Mark the cheapest as "best"
  if (options.length > 0) {
    options[0].badge = "best";
  }

  return options;
}
