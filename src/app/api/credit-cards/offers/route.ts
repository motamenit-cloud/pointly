import { NextRequest, NextResponse } from "next/server";
import { getActiveOffers, getOffersByCard } from "@/lib/creditCards";

/**
 * GET /api/credit-cards/offers
 *
 * Query params:
 *   ?cardId=amex-platinum    → offers for a specific card only
 *   (no params)              → all active offers
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cardId = searchParams.get("cardId");

  if (cardId) {
    return NextResponse.json(getOffersByCard(cardId));
  }

  return NextResponse.json(getActiveOffers());
}
