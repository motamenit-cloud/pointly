"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";

const KEYFRAMES = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes floatBadge {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-3px); }
  }
  @keyframes fadeUp {
    0%   { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes cardIn {
    0%   { transform: translateY(24px) scale(0.96); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes lockBounce {
    0%,100% { transform: rotate(0deg) scale(1); }
    25%     { transform: rotate(-12deg) scale(1.15); }
    75%     { transform: rotate(12deg) scale(1.15); }
  }
`;

/* ─────────────────────────────────────────────
   Cards — sorted by points descending (most → least)
───────────────────────────────────────────── */
const CARDS = [
  // 1st: Amex Platinum — most points
  {
    id: "amex-platinum",
    name: "American Express Platinum",
    shortName: "The Platinum Card",
    holder: "Alex Rivera",
    number: "•••• •••••• •1007",
    pointsRaw: 87200,
    points: "87,200",
    network: "AMEX",
    // Realistic Amex Platinum: dark gunmetal silver like the real metal card
    gradient: "linear-gradient(135deg, #484f58 0%, #5c6572 10%, #6e7a88 20%, #7e8c9c 30%, #8896a6 40%, #808e9e 50%, #6e7c8c 60%, #5c6a7a 70%, #4e5a6a 80%, #424e5c 90%, #3a4450 100%)",
    chipColor: "#c8a832",
    textColor: "#e8eef4",
    subColor: "rgba(232,238,244,0.55)",
    logoEl: "amex",
  },
  // 2nd: Chase Sapphire Preferred
  {
    id: "chase",
    name: "Chase Sapphire Preferred",
    shortName: "Sapphire Preferred",
    holder: "Alex Rivera",
    number: "•••• •••• •••• 4892",
    pointsRaw: 42500,
    points: "42,500",
    network: "VISA",
    // Realistic Chase Sapphire: rich sapphire blue gem gradient
    gradient: "linear-gradient(145deg, #0a1e58 0%, #152f7a 18%, #1c3f9e 38%, #1a3a92 55%, #0f2568 75%, #07174a 100%)",
    chipColor: "#c8a832",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.6)",
    logoEl: "visa",
  },
  // 3rd: Apple Card — fewest points
  {
    id: "apple",
    name: "Apple Card",
    shortName: "Apple Card",
    holder: "Alex Rivera",
    number: "Virtual",
    pointsRaw: 12840,
    points: "12,840",
    network: "MC",
    // Realistic Apple Card: pure titanium white
    gradient: "linear-gradient(145deg, #f5f5f7 0%, #ffffff 25%, #eeeeef 55%, #e3e3e5 78%, #d8d8da 100%)",
    chipColor: "#a8a8a8",
    textColor: "#1d1d1f",
    subColor: "rgba(0,0,0,0.35)",
    logoEl: "mc",
  },
];

/* ─────────────────────────────────────────────
   Transfer deals data
───────────────────────────────────────────── */
const DEALS = [
  {
    id: "chase-af",
    card: "Chase Sapphire",
    cardColor: "#1a3a6b",
    partner: "Air France / KLM",
    partnerShort: "Flying Blue",
    bonus: "30% Bonus",
    description: "Transfer Chase Ultimate Rewards to Flying Blue and get 30% more miles on every transfer.",
    expires: "Apr 30, 2026",
    href: "#",
  },
  {
    id: "amex-ba",
    card: "Amex Platinum",
    cardColor: "#6e8899",
    partner: "British Airways",
    partnerShort: "Avios",
    bonus: "25% Bonus",
    description: "Transfer Amex Membership Rewards to Avios and earn a 25% bonus on all transfers this month.",
    expires: "Apr 25, 2026",
    href: "#",
  },
  {
    id: "chase-united",
    card: "Chase Sapphire",
    cardColor: "#1a3a6b",
    partner: "United Airlines",
    partnerShort: "MileagePlus",
    bonus: "2x Transfer",
    description: "Double your miles — every 1,000 Chase points transfers as 2,000 United MileagePlus miles.",
    expires: "May 15, 2026",
    href: "#",
  },
  {
    id: "amex-delta",
    card: "Amex Platinum",
    cardColor: "#6e8899",
    partner: "Delta Air Lines",
    partnerShort: "SkyMiles",
    bonus: "20% Bonus",
    description: "Transfer Amex points to Delta SkyMiles with a 20% bonus through the end of the month.",
    expires: "Apr 30, 2026",
    href: "#",
  },
];

const TIPS = [
  { emoji: "🍽️", category: "Dining",       card: "Amex Platinum",      detail: "4x points at restaurants worldwide + delivery apps", cardColor: "#c8922a" },
  { emoji: "✈️", category: "Flights",       card: "Chase Sapphire", detail: "3x points on travel + 25 transfer partners",          cardColor: "#1a3a6b" },
  { emoji: "🛒", category: "Groceries",     card: "Amex Platinum",      detail: "4x at US supermarkets up to $25k/year",              cardColor: "#c8922a" },
  { emoji: "🏨", category: "Hotels",        card: "Chase Sapphire", detail: "3x on hotels + 10% bonus on redemptions",            cardColor: "#1a3a6b" },
  { emoji: "🍎", category: "Apple Pay",     card: "Apple Card",     detail: "3% Daily Cash on Apple purchases — zero fees",       cardColor: "#555" },
  { emoji: "⛽", category: "Gas & Transit", card: "Chase Sapphire", detail: "3x on transit, parking, tolls & ride-shares",        cardColor: "#1a3a6b" },
];

/* ─────────────────────────────────────────────
   Network logos
───────────────────────────────────────────── */
function NetworkLogo({ type }) {
  if (type === "visa") {
    return (
      <svg viewBox="0 0 80 26" style={{ width: 52, height: 17 }}>
        <text x="0" y="22" fontFamily="Georgia, serif" fontSize="26" fontWeight="900"
          fill="white" letterSpacing="-1">VISA</text>
      </svg>
    );
  }
  if (type === "amex") {
    return (
      <span style={{ fontFamily: "Arial Black, sans-serif", fontSize: 11, fontWeight: 900, color: "rgba(232,238,244,0.85)", letterSpacing: 2 }}>
        AMEX
      </span>
    );
  }
  if (type === "mc") {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#eb001b" }} />
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#ff5f00", marginLeft: -10, opacity: 0.95 }} />
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f79e1b", marginLeft: -10, opacity: 0.88 }} />
      </div>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────
   Program icon top-left
───────────────────────────────────────────── */
function ProgramIcon({ cardId }) {
  if (cardId === "amex-platinum") {
    return (
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(232,238,244,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 900, color: "rgba(232,238,244,0.9)",
        letterSpacing: 1, flexShrink: 0,
      }}>MR</div>
    );
  }
  if (cardId === "chase") {
    return (
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.9)",
        letterSpacing: 1, flexShrink: 0,
      }}>UR</div>
    );
  }
  if (cardId === "apple") {
    // Apple logo (SVG path)
    return (
      <svg viewBox="0 0 814 1000" style={{ width: 22, height: 22, flexShrink: 0 }} fill="rgba(0,0,0,0.35)">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.6-155.5-127.4C46 790.9 0 661.7 0 538.3 0 319 133.4 201.3 264.4 201.3c64.2 0 117.6 42.8 157.6 42.8 38.2 0 97.9-45.5 168.1-45.5 27.1 0 109.8 2.6 165.1 99.3zM538.2 130.3C507.4 162.8 460 188.9 410.3 188.9c-6.4 0-12.8-.6-19.2-1.9 2.6-49 24.7-99.3 56.5-132.5 35.1-36.5 88.3-63.9 138.9-66.5 2 6.4 3.2 12.8 3.2 19.8 0 47.5-20 95.5-51.5 122.5z" />
      </svg>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────
   Centurion for Amex Platinum — right-facing profile
───────────────────────────────────────────── */
function CenturionWatermark() {
  return (
    <svg viewBox="0 0 80 130" style={{
      position: "absolute", right: 0, bottom: 0,
      height: "92%", opacity: 0.22, pointerEvents: "none",
    }} fill="#c8d8e8">
      {/* ── Plume: tall upward crest, the most iconic Amex feature ── */}
      <ellipse cx="38" cy="6" rx="5" ry="9" />
      <path d="M33,12 Q38,8 43,12 L45,22 L31,22 Z" />

      {/* ── Helmet dome ── */}
      <path d="M16,36 C16,22 24,16 38,16 C52,16 62,22 62,36 C62,48 56,56 38,56 C22,56 16,48 16,36 Z" />

      {/* ── Helmet brim ── */}
      <path d="M12,44 L64,44 L66,50 L10,50 Z" />

      {/* ── Left cheek guard ── */}
      <path d="M12,50 Q8,58 10,64 Q16,62 18,56 Z" />

      {/* ── Face visor opening (slightly lighter) ── */}
      <path d="M26,30 C28,24 34,22 42,26 C50,30 54,38 52,46 C50,52 44,56 38,54 C32,52 24,46 26,36 Z"
        fill="rgba(40,50,60,0.35)" />

      {/* ── Eye ── */}
      <circle cx="44" cy="36" r="2.5" fill="rgba(40,50,60,0.5)" />

      {/* ── Nose bridge (profile detail) ── */}
      <path d="M52,32 L58,38 L54,42" fill="none" stroke="#c8d8e8" strokeWidth="1.8" strokeLinecap="round" />

      {/* ── Neck ── */}
      <rect x="29" y="56" width="16" height="11" rx="3" />

      {/* ── Pauldrons (shoulder armour) ── */}
      <path d="M4,67 C12,61 23,63 38,65 C53,63 64,61 74,69 L72,79 C60,73 50,71 38,73 C26,71 16,73 6,79 Z" />

      {/* ── Breastplate / cuirass ── */}
      <path d="M6,79 L70,79 L66,116 L10,116 Z" />

      {/* ── Muscle-line engravings on breastplate ── */}
      <path d="M22,87 Q38,83 54,87" fill="none" stroke="rgba(40,50,60,0.4)" strokeWidth="1.5" />
      <path d="M20,96 Q38,92 56,96" fill="none" stroke="rgba(40,50,60,0.4)" strokeWidth="1.5" />
      <path d="M36,79 L36,116" fill="none" stroke="rgba(40,50,60,0.3)" strokeWidth="1" />

      {/* ── Belt ── */}
      <rect x="10" y="114" width="56" height="7" rx="2" />

      {/* ── Pteruges (waist skirt strips) ── */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={i} x={12 + i * 7} y="121" width="5" height="18" rx="2.5" />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   CreditCard — flat layout matching screenshot
───────────────────────────────────────────── */
function CreditCard({ card, index, visible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        maxWidth: 320,
        aspectRatio: "1.586 / 1",
        borderRadius: 20,
        background: card.gradient,
        padding: "22px 24px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        border: card.id === "apple" ? "1px solid #ddd" : "none",
        boxShadow: hovered
          ? "0 20px 48px rgba(0,0,0,0.38)"
          : "0 6px 24px rgba(0,0,0,0.22)",
        animation: visible ? `cardIn 0.5s ease ${index * 0.12}s both` : "none",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        userSelect: "none",
        flexShrink: 0,
        flex: "1 1 240px",
        minWidth: 220,
      }}
    >
      {/* Gloss overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "45%",
        background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)",
        borderRadius: "20px 20px 0 0", pointerEvents: "none",
      }} />
      {/* Shimmer sweep */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
        backgroundSize: "600px 100%",
        animation: "shimmer 4s infinite linear",
        pointerEvents: "none",
      }} />

      {/* Amex Platinum: brushed metal texture */}
      {card.id === "amex-platinum" && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)",
          borderRadius: 20,
        }} />
      )}
      {/* Amex Platinum: centurion watermark */}
      {card.id === "amex-platinum" && <CenturionWatermark />}

      {/* Chase Sapphire: gem radial glow */}
      {card.id === "chase" && (
        <div style={{
          position: "absolute", top: "20%", left: "55%",
          width: 180, height: 180,
          background: "radial-gradient(circle, rgba(80,130,220,0.35) 0%, rgba(30,70,160,0.1) 50%, transparent 75%)",
          borderRadius: "50%", pointerEvents: "none",
          transform: "translate(-50%,-50%)",
        }} />
      )}

      {/* Apple Card: centered Apple logo watermark */}
      {card.id === "apple" && (
        <svg viewBox="0 0 814 1000" style={{
          position: "absolute", left: "50%", top: "46%",
          transform: "translate(-50%,-50%)",
          width: 64, height: 64, opacity: 0.09, pointerEvents: "none",
        }} fill="#1d1d1f">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.6-155.5-127.4C46 790.9 0 661.7 0 538.3 0 319 133.4 201.3 264.4 201.3c64.2 0 117.6 42.8 157.6 42.8 38.2 0 97.9-45.5 168.1-45.5 27.1 0 109.8 2.6 165.1 99.3zM538.2 130.3C507.4 162.8 460 188.9 410.3 188.9c-6.4 0-12.8-.6-19.2-1.9 2.6-49 24.7-99.3 56.5-132.5 35.1-36.5 88.3-63.9 138.9-66.5 2 6.4 3.2 12.8 3.2 19.8 0 47.5-20 95.5-51.5 122.5z"/>
        </svg>
      )}

      {/* Top row: program icon + name + chip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProgramIcon cardId={card.id} />
          <div style={{ fontSize: 11, fontWeight: 700, color: card.textColor, opacity: 0.7, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {card.shortName}
          </div>
        </div>
        {/* EMV Chip */}
        <div style={{
          width: 38, height: 30,
          background: `linear-gradient(135deg, ${card.chipColor} 0%, #f5e070 50%, ${card.chipColor} 100%)`,
          borderRadius: 5,
          border: "1px solid rgba(0,0,0,0.12)",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr", gap: 2, padding: 3,
        }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.12)", borderRadius: 1 }} />
          ))}
        </div>
      </div>

      {/* Points — large number */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontSize: "clamp(28px, 5vw, 38px)",
          fontWeight: 800,
          color: card.textColor,
          lineHeight: 1,
          letterSpacing: -1,
        }}>
          {card.points}
        </div>
        <div style={{ fontSize: 11, color: card.textColor, opacity: 0.5, marginTop: 3, fontWeight: 600, letterSpacing: 0.6 }}>
          POINTS
        </div>
      </div>

      {/* Bottom row: cardholder + number + network */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 9, color: card.textColor, opacity: 0.45, letterSpacing: 1.5, marginBottom: 2, fontWeight: 700 }}>
            CARD HOLDER
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: card.textColor, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {card.holder}
          </div>
          <div style={{ fontSize: 11, color: card.textColor, opacity: 0.4, marginTop: 2, letterSpacing: 1.5, fontFamily: "'Courier New', monospace" }}>
            {card.number}
          </div>
        </div>
        <NetworkLogo type={card.logoEl} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TipCard
───────────────────────────────────────────── */
function TipCard({ tip, index, visible }) {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div
      onClick={() => setUnlocked(!unlocked)}
      style={{
        background: "#fff",
        border: `1px solid ${unlocked ? "#E87C3E" : "#dce8f2"}`,
        borderRadius: 12,
        padding: "14px 18px",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.4s ease ${index * 0.07}s, transform 0.4s ease ${index * 0.07}s, border 0.2s ease`,
        boxShadow: unlocked ? "0 4px 16px rgba(232,124,62,0.12)" : "0 1px 4px rgba(27,58,92,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 16, animation: unlocked ? "lockBounce 0.4s ease" : "none", flexShrink: 0, color: unlocked ? "#E87C3E" : "#8FA5B8" }}>
          {unlocked ? "🔓" : "🔒"}
        </div>
        <div style={{ fontSize: 20, flexShrink: 0 }}>{tip.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1B3A5C" }}>{tip.category}</span>
            <span style={{ color: "#B8DCF4", fontSize: 13 }}>→</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E87C3E" }}>{tip.card}</span>
          </div>
          <div style={{
            fontSize: 13, color: "#4A6B8A",
            overflow: "hidden", maxHeight: unlocked ? 40 : 0,
            transition: "max-height 0.3s ease", marginTop: unlocked ? 4 : 0,
          }}>
            {tip.detail}
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: unlocked ? "#E87C3E" : "#8FA5B8",
          background: unlocked ? "rgba(232,124,62,0.08)" : "#F5EDE0",
          borderRadius: 6, padding: "2px 8px",
          flexShrink: 0, letterSpacing: 0.5, textTransform: "uppercase",
        }}>
          {unlocked ? "Unlocked" : "Tap"}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DealCard
───────────────────────────────────────────── */
function DealCard({ deal }) {
  return (
    <div className="bg-white rounded-xl border border-navy/8 shadow-sm p-5 flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-pill text-white" style={{ background: deal.cardColor }}>
            {deal.card}
          </span>
          <span className="text-text-muted text-sm">→</span>
          <span className="text-sm font-semibold text-navy">{deal.partner}</span>
        </div>
        <span className="text-xs font-bold text-white bg-coral px-2.5 py-1 rounded-pill whitespace-nowrap flex-shrink-0">
          {deal.bonus}
        </span>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed flex-1">{deal.description}</p>
      <div className="flex items-center justify-between pt-1 border-t border-navy/5">
        <span className="text-xs text-text-muted">
          Expires <span className="font-medium text-navy">{deal.expires}</span>
        </span>
        <a href={deal.href} className="text-xs font-semibold text-coral hover:text-coral-dark transition-colors" onClick={e => e.stopPropagation()}>
          Learn more →
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DealsCarousel
───────────────────────────────────────────── */
function DealsCarousel() {
  const [index, setIndex] = useState(0);
  const perPage = 2;
  const maxIndex = Math.ceil(DEALS.length / perPage) - 1;
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-navy">Current deals with your credit cards</h2>
          <p className="text-sm text-text-secondary mt-1">Limited-time transfer bonuses for your linked cards</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-coral bg-coral/10 px-3 py-1 rounded-pill">{DEALS.length} active</span>
          <div className="flex gap-2">
            <button onClick={prev} disabled={index === 0} className="w-8 h-8 rounded-full border border-navy/15 flex items-center justify-center text-navy hover:bg-sky-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-lg">‹</button>
            <button onClick={next} disabled={index === maxIndex} className="w-8 h-8 rounded-full border border-navy/15 flex items-center justify-center text-navy hover:bg-sky-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-lg">›</button>
          </div>
        </div>
      </div>
      <div style={{ overflow: "hidden" }}>
        <div style={{
          display: "flex", gap: 16,
          transform: `translateX(calc(-${index * 100}% - ${index * 16}px))`,
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}>
          {DEALS.map(deal => (
            <div key={deal.id} style={{ minWidth: "calc(50% - 8px)", maxWidth: "calc(50% - 8px)" }}>
              <DealCard deal={deal} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-5">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className="cursor-pointer transition-all" style={{
            width: i === index ? 20 : 8, height: 8, borderRadius: 9999,
            background: i === index ? "#E87C3E" : "#B8DCF4", border: "none", padding: 0,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function WalletPage() {
  const [cardsVisible, setCardsVisible] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [tipsVisible, setTipsVisible] = useState(false);
  const tipsRef = useRef(null);

  const totalPoints = CARDS.reduce((sum, c) => sum + c.pointsRaw, 0).toLocaleString();

  // First 4 in primary row, rest overflow
  const primaryCards = CARDS.slice(0, 4);
  const overflowCards = CARDS.slice(4);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setHeaderVisible(true), 80);
    const t2 = setTimeout(() => setCardsVisible(true), 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const el = tipsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setTipsVisible(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-12 pb-20">

        {/* Page header */}
        <div className="mb-8" style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
          <div className="inline-block bg-coral/10 text-coral text-xs font-semibold px-4 py-1.5 rounded-pill mb-4 tracking-wide uppercase">
            Your Points Universe
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight">My Wallet</h1>
              <p className="mt-2 text-text-secondary text-base">
                {CARDS.length} cards · {totalPoints} total points · Sorted by highest balance
              </p>
            </div>
            <div className="bg-white rounded-xl border border-navy/8 shadow-sm px-5 py-3">
              <div className="text-xs text-text-muted font-medium uppercase tracking-wide mb-0.5">Total Balance</div>
              <div className="text-2xl font-bold text-coral">{totalPoints} pts</div>
            </div>
          </div>
        </div>

        {/* Primary cards row (up to 4) */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: overflowCards.length > 0 ? 16 : 0,
        }}>
          {primaryCards.map((card, i) => (
            <CreditCard key={card.id} card={card} index={i} visible={cardsVisible} />
          ))}
        </div>

        {/* Overflow row (5th card onwards) */}
        {overflowCards.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            {overflowCards.map((card, i) => (
              <CreditCard key={card.id} card={card} index={primaryCards.length + i} visible={cardsVisible} />
            ))}
          </div>
        )}

        {/* Deals carousel */}
        <div className="mt-14">
          <DealsCarousel />
        </div>

        {/* Tips section */}
        <div ref={tipsRef} className="mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-coral/10 text-coral text-xs font-semibold px-4 py-1.5 rounded-pill mb-4 tracking-wide uppercase">
              <span>🔐</span><span>Secret Optimization Tips</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-navy" style={{ opacity: tipsVisible ? 1 : 0, transform: tipsVisible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
              Unlock Hidden Value
            </h2>
            <p className="mt-2 text-text-secondary text-sm" style={{ opacity: tipsVisible ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}>
              Tap any tip to reveal the full strategy
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-navy/8 shadow-sm p-6">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TIPS.map((tip, i) => (
                <TipCard key={tip.category} tip={tip} index={i} visible={tipsVisible} />
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-navy/5 text-center">
              <span className="text-xs text-text-muted font-medium tracking-wide uppercase">
                Pointly Intelligence · Personalized for your cards
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
