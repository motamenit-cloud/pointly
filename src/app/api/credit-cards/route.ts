import { NextRequest, NextResponse } from "next/server";
import { CREDIT_CARDS, getCardById, getCardsByIssuer, getCardsByType } from "@/lib/creditCards";
import type { Issuer, CardType } from "@/lib/creditCards";

/**
 * GET /api/credit-cards
 *
 * Query params:
 *   ?id=amex-platinum        → returns single card
 *   ?issuer=amex             → returns all cards for issuer
 *   ?type=travel             → returns all cards of that type
 *   (no params)              → returns full catalog
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const id = searchParams.get("id");
  const issuer = searchParams.get("issuer") as Issuer | null;
  const type = searchParams.get("type") as CardType | null;

  if (id) {
    const card = getCardById(id);
    if (!card) {
      return NextResponse.json({ error: `Card not found: ${id}` }, { status: 404 });
    }
    return NextResponse.json(card);
  }

  if (issuer) {
    return NextResponse.json(getCardsByIssuer(issuer));
  }

  if (type) {
    return NextResponse.json(getCardsByType(type));
  }

  return NextResponse.json(CREDIT_CARDS);
}
