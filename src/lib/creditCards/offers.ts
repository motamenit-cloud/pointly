import type { CardOffer } from "./types";

/* ─────────────────────────────────────────────────────────────────────────────
   Credit Card Transfer Bonus Offers
   Limited-time promotional transfer bonuses and partner deals.
   Set isActive: false to hide an expired offer without deleting it.
   Update ptsTo and expires when new promotional periods are announced.
───────────────────────────────────────────────────────────────────────────── */

export const CARD_OFFERS: CardOffer[] = [

  /* ── Chase Sapphire → Air France Flying Blue (30% Bonus) ─────────────── */
  {
    id: "chase-flyingblue-apr26",
    cardId: "chase-sapphire-preferred",
    cardName: "Chase Sapphire",
    cardColor: "#1a3a6b",
    cardLogo: "CHASE",
    cardSub: "ultimate rewards®",
    partner: "Air France / KLM",
    partnerShort: "Flying Blue",
    partnerColor: "#0057b8",
    bonus: "30% Bonus",
    ptsFrom: 10000,
    ptsTo: 13000,
    bg: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80",
    expires: "Apr 30, 2026",
    href: "#",
    isActive: true,
  },

  /* ── Amex Platinum → British Airways Avios (25% Bonus) ──────────────── */
  {
    id: "amex-ba-apr26",
    cardId: "amex-platinum",
    cardName: "Amex Platinum",
    cardColor: "#6e8899",
    cardLogo: "AMEX",
    cardSub: "membership rewards®",
    partner: "British Airways",
    partnerShort: "Avios",
    partnerColor: "#075aaa",
    bonus: "25% Bonus",
    ptsFrom: 10000,
    ptsTo: 12500,
    bg: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",
    expires: "Apr 25, 2026",
    href: "#",
    isActive: true,
  },

  /* ── Chase Sapphire → United MileagePlus (2x Transfer) ──────────────── */
  {
    id: "chase-united-may26",
    cardId: "chase-sapphire-preferred",
    cardName: "Chase Sapphire",
    cardColor: "#1a3a6b",
    cardLogo: "CHASE",
    cardSub: "ultimate rewards®",
    partner: "United Airlines",
    partnerShort: "MileagePlus",
    partnerColor: "#005daa",
    bonus: "2x Transfer",
    ptsFrom: 10000,
    ptsTo: 20000,
    bg: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
    expires: "May 15, 2026",
    href: "#",
    isActive: true,
  },

  /* ── Amex Platinum → Delta SkyMiles (20% Bonus) ─────────────────────── */
  {
    id: "amex-delta-apr26",
    cardId: "amex-platinum",
    cardName: "Amex Platinum",
    cardColor: "#6e8899",
    cardLogo: "AMEX",
    cardSub: "membership rewards®",
    partner: "Delta Air Lines",
    partnerShort: "SkyMiles",
    partnerColor: "#e01933",
    bonus: "20% Bonus",
    ptsFrom: 10000,
    ptsTo: 12000,
    bg: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&q=80",
    expires: "Apr 30, 2026",
    href: "#",
    isActive: true,
  },

  /* ── Citi Premier → Turkish Miles&Smiles (25% Bonus) ────────────────── */
  {
    id: "citi-turkish-may26",
    cardId: "citi-premier",
    cardName: "Citi Premier",
    cardColor: "#003d7a",
    cardLogo: "CITI",
    cardSub: "thankyou points®",
    partner: "Turkish Airlines",
    partnerShort: "Miles&Smiles",
    partnerColor: "#c8102e",
    bonus: "25% Bonus",
    ptsFrom: 10000,
    ptsTo: 12500,
    bg: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",
    expires: "May 31, 2026",
    href: "#",
    isActive: true,
  },

  /* ── Capital One Venture X → Air Canada Aeroplan (15% Bonus) ────────── */
  {
    id: "c1-aeroplan-may26",
    cardId: "capital-one-venture-x",
    cardName: "Venture X",
    cardColor: "#1a1a1a",
    cardLogo: "VENTURE X",
    cardSub: "capital one miles",
    partner: "Air Canada",
    partnerShort: "Aeroplan",
    partnerColor: "#d2222a",
    bonus: "15% Bonus",
    ptsFrom: 10000,
    ptsTo: 11500,
    bg: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80",
    expires: "May 20, 2026",
    href: "#",
    isActive: true,
  },

];
