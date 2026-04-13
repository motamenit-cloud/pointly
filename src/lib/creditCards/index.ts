/* ─────────────────────────────────────────────────────────────────────────────
   Credit Cards Library — Public API
   Import from "@/lib/creditCards" for all card data and helpers.
───────────────────────────────────────────────────────────────────────────── */

export * from "./types";
export { CREDIT_CARDS } from "./cards";
export { CARD_OFFERS } from "./offers";

import { CREDIT_CARDS } from "./cards";
import { CARD_OFFERS } from "./offers";
import type { CreditCard, CardOffer, Issuer, CardType } from "./types";

/** Look up a single card by its ID */
export function getCardById(id: string): CreditCard | undefined {
  return CREDIT_CARDS.find((c) => c.id === id);
}

/** All cards for a given issuer (e.g. "amex", "chase") */
export function getCardsByIssuer(issuer: Issuer): CreditCard[] {
  return CREDIT_CARDS.filter((c) => c.issuer === issuer);
}

/** All cards of a given type (e.g. "travel", "cashback") */
export function getCardsByType(type: CardType): CreditCard[] {
  return CREDIT_CARDS.filter((c) => c.cardType === type);
}

/** All currently active offers */
export function getActiveOffers(): CardOffer[] {
  return CARD_OFFERS.filter((o) => o.isActive);
}

/** Active offers filtered to a specific card */
export function getOffersByCard(cardId: string): CardOffer[] {
  return CARD_OFFERS.filter((o) => o.isActive && o.cardId === cardId);
}

/** Total annual credit value for a card */
export function getTotalAnnualCreditValue(cardId: string): number {
  const card = getCardById(cardId);
  if (!card) return 0;
  return card.annualCredits.reduce((sum, c) => sum + c.value, 0);
}

/** Effective annual fee after subtracting annual credits */
export function getEffectiveAnnualFee(cardId: string): number {
  const card = getCardById(cardId);
  if (!card) return 0;
  return card.annualFee - getTotalAnnualCreditValue(cardId);
}

/** Best earning rate for a given spend category */
export function getBestRateForCategory(cardId: string, category: string): number {
  const card = getCardById(cardId);
  if (!card) return 1;
  const matches = card.earningRates.filter((r) =>
    r.category.toLowerCase().includes(category.toLowerCase())
  );
  if (!matches.length) {
    // fall back to "all purchases" rate
    const all = card.earningRates.find((r) =>
      r.category.toLowerCase().includes("all")
    );
    return all?.multiplier ?? 1;
  }
  return Math.max(...matches.map((r) => r.multiplier));
}
