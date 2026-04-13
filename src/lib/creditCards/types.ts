/* ─────────────────────────────────────────────────────────────────────────────
   Credit Card Domain Types
   Single source of truth for all credit card data shapes used across Pointly.
───────────────────────────────────────────────────────────────────────────── */

export type Issuer = "amex" | "chase" | "citi" | "capital-one" | "apple" | "other";
export type Network = "visa" | "mastercard" | "amex" | "discover";
export type CardType = "travel" | "cashback" | "business" | "student";
export type PartnerCategory = "airline" | "hotel";
export type LogoEl = "amex" | "visa" | "mc";

/** A single earning rate rule for a spending category */
export interface EarningRate {
  category: string;    // e.g. "Dining", "Travel", "All purchases"
  multiplier: number;  // e.g. 4 means 4x points per dollar
  cap?: number;        // annual spend cap in USD (undefined = unlimited)
  note?: string;       // e.g. "at US supermarkets"
}

/** An annual statement credit or recurring benefit with dollar value */
export interface AnnualCredit {
  name: string;        // e.g. "$200 Uber Cash"
  value: number;       // dollar value
  description: string; // how to redeem / conditions
}

/** A loyalty program this card's points can be transferred to */
export interface TransferPartner {
  programId: string;         // e.g. "delta", "hyatt", "flying-blue"
  name: string;              // e.g. "Delta SkyMiles"
  ratio: string;             // e.g. "1:1" or "2:1"
  category: PartnerCategory;
}

/** Full credit card definition */
export interface CreditCard {
  id: string;
  name: string;
  shortName: string;
  issuer: Issuer;
  network: Network;
  cardType: CardType;

  // Financials
  annualFee: number;
  rewardsProgram: string;  // e.g. "Membership Rewards", "Ultimate Rewards"
  cpp: number;             // cents per point at best travel redemption

  // Visual (used by wallet card renderer)
  gradient: string;
  chipColor: string;
  textColor: string;
  subColor: string;
  logoEl: LogoEl;

  // Benefits
  earningRates: EarningRate[];
  annualCredits: AnnualCredit[];
  transferPartners: TransferPartner[];

  /** Short pill labels shown in the wallet UI */
  benefits: string[];
}

/** A limited-time transfer bonus or promotional offer */
export interface CardOffer {
  id: string;
  cardId: string;       // references CreditCard.id
  cardName: string;
  cardColor: string;    // hex color for card badge
  cardLogo: string;     // e.g. "CHASE", "AMEX"
  cardSub: string;      // e.g. "ultimate rewards®"
  partner: string;      // full partner name
  partnerShort: string; // abbreviated name e.g. "Flying Blue"
  partnerColor: string; // partner brand color
  bonus: string;        // e.g. "30% Bonus", "2x Transfer"
  ptsFrom: number;      // points in (per unit, e.g. 10000)
  ptsTo: number;        // points out after bonus (e.g. 13000)
  bg: string;           // destination photo URL (Unsplash)
  expires: string;      // human-readable date e.g. "Apr 30, 2026"
  href: string;
  isActive: boolean;
}
