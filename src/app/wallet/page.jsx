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
/* ─────────────────────────────────────────────
   Wallet display cards — demo data
   (matches the 3 cards a typical user would have linked)
   pointsRaw / holder / number are user-specific and live here,
   while card metadata (benefits, gradient, cpp) comes from the API.
───────────────────────────────────────────── */
const WALLET_CARDS_SEED = [
  {
    apiId: "amex-platinum",        // matches CreditCard.id in the database
    holder: "Alex Rivera",
    number: "•••• •••••• •1007",
    pointsRaw: 87200,
    points: "87,200",
    // Visual overrides to match real Amex Platinum metal card look
    gradient: "linear-gradient(145deg, #c0c8d0 0%, #d4dce4 18%, #e4ecf2 34%, #eef4f8 48%, #e6eef4 62%, #d0d8e0 78%, #bcc4cc 92%, #b4bcc4 100%)",
    textColor: "#1c2430",
    subColor: "rgba(28,36,48,0.55)",
  },
  {
    apiId: "chase-sapphire-preferred",
    holder: "Alex Rivera",
    number: "•••• •••• •••• 4892",
    pointsRaw: 42500,
    points: "42,500",
  },
  {
    apiId: "apple-card",
    holder: "Alex Rivera",
    number: "Virtual",
    pointsRaw: 12840,
    points: "12,840",
  },
];

/* ─────────────────────────────────────────────
   Dollar value helpers
───────────────────────────────────────────── */
function formatValue(pointsRaw, cpp) {
  const dollars = Math.round((pointsRaw * cpp) / 100);
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`;
  return `$${dollars.toLocaleString("en-US")}`;
}

/* DEALS are fetched from /api/credit-cards/offers — see WalletPage */

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
   Shared card shell styles
───────────────────────────────────────────── */
function cardShell(hovered, index, visible, extra = {}) {
  return {
    width: "100%", aspectRatio: "1.586 / 1",
    borderRadius: 18, padding: "20px 22px",
    position: "relative", overflow: "hidden", cursor: "pointer",
    boxShadow: hovered ? "0 22px 52px rgba(0,0,0,0.4)" : "0 6px 24px rgba(0,0,0,0.22)",
    animation: visible ? `cardIn 0.5s ease ${index * 0.12}s both` : "none",
    transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    userSelect: "none",
    ...extra,
  };
}

/* EMV chip */
function Chip({ color = "#c8a832" }) {
  return (
    <div style={{
      width: 38, height: 30,
      background: `linear-gradient(135deg, ${color} 0%, #f5e070 50%, ${color} 100%)`,
      borderRadius: 5, border: "1px solid rgba(0,0,0,0.15)",
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
      gridTemplateRows: "1fr 1fr 1fr", gap: 2, padding: 3, flexShrink: 0,
    }}>
      {[...Array(9)].map((_, i) => (
        <div key={i} style={{ background: "rgba(0,0,0,0.12)", borderRadius: 1 }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Amex Platinum — matches the real card layout
───────────────────────────────────────────── */
function AmexPlatinumCard({ card, index, visible }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardShell(hovered, index, visible, {
        background: "linear-gradient(145deg, #c0c8d0 0%, #d4dce4 18%, #e4ecf2 34%, #eef4f8 48%, #e6eef4 62%, #d0d8e0 78%, #bcc4cc 92%, #b4bcc4 100%)",
      })}
    >
      {/* Metallic sheen overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
        background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 45%, rgba(0,0,0,0.04) 100%)",
      }} />
      {/* Shimmer */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
        backgroundSize: "600px 100%", animation: "shimmer 5s infinite linear",
      }} />
      {/* Decorative border (like the real card) */}
      <div style={{
        position: "absolute", inset: 7, borderRadius: 13, pointerEvents: "none",
        border: "1px solid rgba(40,50,60,0.2)",
      }} />

      {/* ── AMERICAN EXPRESS at top ── */}
      <div style={{
        position: "relative", zIndex: 1,
        textAlign: "center",
        fontFamily: "Arial Black, sans-serif",
        fontSize: 12, fontWeight: 900,
        color: "rgba(28,36,46,0.82)",
        letterSpacing: 2.5,
      }}>
        AMERICAN EXPRESS
      </div>

      {/* ── Middle: chip · centurion oval · right info ── */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      }}>
        {/* Chip on left */}
        <Chip color="#b8a030" />

        {/* Centurion in oval — the signature Amex feature */}
        <div style={{
          width: 82, height: 88,
          borderRadius: "50%",
          border: "2px solid rgba(28,36,46,0.5)",
          background: "linear-gradient(145deg, rgba(140,158,176,0.7) 0%, rgba(100,120,140,0.6) 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", flexShrink: 0, position: "relative",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.22)",
        }}>
          {/* Right-facing centurion profile — single compound silhouette */}
          <svg viewBox="0 0 58 84" style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid meet">
            {/* ── Full outer silhouette ─────────────────────────────
                 Traces: plume (top) → helmet front & nose protrusion →
                 cheek/chin → neck → pauldrons → breastplate → back neck →
                 back of helmet → plume base
            ──────────────────────────────────────────────────────── */}
            <path
              fill="rgba(20,30,44,0.9)"
              d="M 11,22
                 C 9,16 10,8 16,4
                 C 20,1 24,0 29,0
                 C 34,0 38,1 42,4
                 C 48,8 49,16 47,22
                 Q 52,25 55,31 L 57,35
                 Q 56,42 51,46
                 Q 47,50 43,54
                 L 41,59
                 Q 48,61 53,68 L 53,84
                 L 5,84 L 5,68
                 Q 10,61 17,59
                 L 15,54
                 Q 11,50 7,46
                 Q 2,42 3,35
                 Q 3,27 11,22 Z"
            />

            {/* ── Plume hair texture — subtle lighter lines fanning upward ── */}
            <path
              d="M 16,21 C 14,15 15,7 19,3
                 M 23,20 C 21,13 21,5 25,2
                 M 29,20 C 29,13 29,5 29,0
                 M 35,20 C 36,13 37,5 35,2
                 M 41,21 C 43,15 44,7 41,4"
              fill="none" stroke="rgba(215,228,240,0.28)" strokeWidth="1.6" strokeLinecap="round"
            />

            {/* ── Corinthian helmet eye slit (right side visor opening) ── */}
            <rect x="43" y="30" width="12" height="5" rx="2.5" fill="rgba(185,205,224,0.65)" />

            {/* ── Belt / waist line ── */}
            <path d="M 6,70 L 52,70" stroke="rgba(215,228,240,0.28)" strokeWidth="2.4" fill="none" />

            {/* ── Pectoral engraving on breastplate ── */}
            <path d="M 10,65 Q 29,61 48,65" fill="none" stroke="rgba(215,228,240,0.22)" strokeWidth="1.6" />
          </svg>
        </div>

        {/* Right: contactless + last 4 + member since */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 15, color: "rgba(28,36,46,0.6)", lineHeight: 1 }}>
            &#x29B8;&#x29B8;
          </div>
          <div style={{
            fontFamily: "Courier New, monospace", fontWeight: 700,
            fontSize: 12, color: "rgba(28,36,46,0.7)", marginTop: 3,
          }}>
            {card.number.slice(-4)}
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{
              border: "1px solid rgba(28,36,46,0.35)", borderRadius: 3,
              padding: "1px 3px", fontSize: 7, fontWeight: 800,
              color: "rgba(28,36,46,0.55)", letterSpacing: 0.4, textAlign: "center",
            }}>MEMBER SINCE</div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "rgba(28,36,46,0.65)",
              textAlign: "center", marginTop: 1,
            }}>09</div>
          </div>
        </div>
      </div>

      {/* ── Bottom: name + points · AMEX ── */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: 13, fontWeight: 800,
            color: "rgba(28,36,46,0.82)", letterSpacing: 1, textTransform: "uppercase",
          }}>
            {card.holder}
          </div>
          <div style={{ fontSize: 10, color: "rgba(28,36,46,0.5)", marginTop: 1, fontWeight: 600 }}>
            {card.points} MR pts
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 10, fontWeight: 900, letterSpacing: 2,
            color: "rgba(28,36,46,0.55)", fontFamily: "Arial Black, sans-serif",
          }}>AMEX</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CreditCard — generic layout (Chase, Apple, etc.)
───────────────────────────────────────────── */
function CreditCard({ card, index, visible }) {
  const [hovered, setHovered] = useState(false);

  if (card.id === "amex-platinum") {
    return <AmexPlatinumCard card={card} index={index} visible={visible} />;
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardShell(hovered, index, visible, {
        background: card.gradient,
        border: card.id === "apple" ? "1px solid #ddd" : "none",
      })}
    >
      {/* Gloss overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "45%",
        background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)",
        borderRadius: "18px 18px 0 0", pointerEvents: "none",
      }} />
      {/* Shimmer */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
        backgroundSize: "600px 100%", animation: "shimmer 4s infinite linear",
      }} />

      {/* Chase Sapphire: gem radial glow */}
      {card.id === "chase" && (
        <div style={{
          position: "absolute", top: "20%", left: "55%",
          width: 180, height: 180,
          background: "radial-gradient(circle, rgba(80,130,220,0.35) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
          transform: "translate(-50%,-50%)",
        }} />
      )}

      {/* Apple Card: Apple logo watermark */}
      {card.id === "apple" && (
        <svg viewBox="0 0 814 1000" style={{
          position: "absolute", left: "50%", top: "46%",
          transform: "translate(-50%,-50%)",
          width: 64, height: 64, opacity: 0.09, pointerEvents: "none",
        }} fill="#1d1d1f">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.6-155.5-127.4C46 790.9 0 661.7 0 538.3 0 319 133.4 201.3 264.4 201.3c64.2 0 117.6 42.8 157.6 42.8 38.2 0 97.9-45.5 168.1-45.5 27.1 0 109.8 2.6 165.1 99.3zM538.2 130.3C507.4 162.8 460 188.9 410.3 188.9c-6.4 0-12.8-.6-19.2-1.9 2.6-49 24.7-99.3 56.5-132.5 35.1-36.5 88.3-63.9 138.9-66.5 2 6.4 3.2 12.8 3.2 19.8 0 47.5-20 95.5-51.5 122.5z"/>
        </svg>
      )}

      {/* Top: program badge + card name + chip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProgramIcon cardId={card.id} />
          <div style={{ fontSize: 11, fontWeight: 700, color: card.textColor, opacity: 0.7, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {card.shortName}
          </div>
        </div>
        <Chip color={card.chipColor} />
      </div>

      {/* Points */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 800, color: card.textColor, lineHeight: 1, letterSpacing: -1 }}>
          {card.points}
        </div>
        <div style={{ fontSize: 11, color: card.textColor, opacity: 0.5, marginTop: 3, fontWeight: 600, letterSpacing: 0.6 }}>
          POINTS
        </div>
      </div>

      {/* Bottom: cardholder + number + network */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 9, color: card.textColor, opacity: 0.45, letterSpacing: 1.5, marginBottom: 2, fontWeight: 700 }}>CARD HOLDER</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: card.textColor, letterSpacing: 0.5, textTransform: "uppercase" }}>{card.holder}</div>
          <div style={{ fontSize: 11, color: card.textColor, opacity: 0.4, marginTop: 2, letterSpacing: 1.5, fontFamily: "'Courier New', monospace" }}>{card.number}</div>
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
    <div style={{
      borderRadius: 20, overflow: "hidden", position: "relative",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      aspectRatio: "4/5", display: "flex", flexDirection: "column",
      minHeight: 280,
    }}>
      {/* Background photo */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${deal.bg})`,
        backgroundSize: "cover", backgroundPosition: "center",
        filter: "brightness(0.72)",
      }} />

      {/* Gradient overlay — dark at bottom for legibility */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* Bonus pill — top right */}
      <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2 }}>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: 0.4,
          background: "#E87C3E", color: "#fff",
          borderRadius: 999, padding: "4px 12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}>{deal.bonus}</span>
      </div>

      {/* Expires pill — top left */}
      <div style={{ position: "absolute", top: 14, left: 14, zIndex: 2 }}>
        <span style={{
          fontSize: 10, fontWeight: 600,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
          color: "rgba(255,255,255,0.85)",
          borderRadius: 999, padding: "3px 10px",
        }}>Expires {deal.expires}</span>
      </div>

      {/* White card panel — bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        borderRadius: "0 0 20px 20px",
        padding: "18px 20px 16px",
      }}>
        {/* From: card program */}
        <div style={{ marginBottom: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: deal.cardColor, letterSpacing: 0.5, lineHeight: 1 }}>
            {deal.cardLogo}
          </div>
          <div style={{ fontSize: 9, fontWeight: 600, color: "#8FA5B8", letterSpacing: 0.3, textTransform: "lowercase", marginTop: 1 }}>
            {deal.cardSub}
          </div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1B3A5C", lineHeight: 1.1, marginBottom: 2 }}>
          {deal.ptsFrom.toLocaleString()} pts
        </div>

        {/* VS badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(27,58,92,0.1)" }} />
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#E87C3E",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: 0.3, flexShrink: 0,
          }}>vs.</div>
          <div style={{ flex: 1, height: 1, background: "rgba(27,58,92,0.1)" }} />
        </div>

        {/* To: partner */}
        <div style={{ marginBottom: 2 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#8FA5B8", letterSpacing: 0.2 }}>
            {deal.partnerShort}
          </div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: deal.partnerColor, lineHeight: 1.1 }}>
          {deal.ptsTo.toLocaleString()} pts
        </div>

        {/* Footer */}
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#8FA5B8", fontWeight: 500 }}>
            Per 10,000 pts transferred
          </span>
          <a href={deal.href} style={{
            fontSize: 11, fontWeight: 700, color: "#E87C3E",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 3,
          }} onClick={e => e.stopPropagation()}>
            Transfer →
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DealsCarousel
───────────────────────────────────────────── */
function DealsCarousel({ deals }) {
  const [index, setIndex] = useState(0);
  const [perPage, setPerPage] = useState(2);
  useEffect(() => {
    const update = () => setPerPage(window.innerWidth < 640 ? 1 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const maxIndex = Math.max(0, Math.ceil(deals.length / perPage) - 1);
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-navy">Current deals with your credit cards</h2>
          <p className="text-sm text-text-secondary mt-1">Limited-time transfer bonuses for your linked cards</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-coral bg-coral/10 px-3 py-1 rounded-pill">{deals.length} active</span>
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
          {deals.map(deal => (
            <div key={deal.id} style={{
              minWidth: perPage === 1 ? "100%" : "calc(50% - 8px)",
              maxWidth: perPage === 1 ? "100%" : "calc(50% - 8px)",
            }}>
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
   Opportunity Alert
───────────────────────────────────────────── */
function OpportunityAlert({ totalPointsRaw, totalDollars, visible }) {

  return (
    <div style={{
      marginTop: 32,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #fffbf5 0%, #fff8ee 100%)",
        border: "1.5px solid rgba(232,124,62,0.28)",
        borderRadius: 14,
        padding: "16px 20px",
        boxShadow: "0 2px 12px rgba(232,124,62,0.08)",
      }}>
        <div className="flex items-start gap-3.5">
          {/* Icon */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #E87C3E, #d4621e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, marginTop: 1,
            boxShadow: "0 2px 8px rgba(232,124,62,0.3)",
          }}>💡</div>

          {/* Text + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#E87C3E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                Maximize Your Points
              </div>
              <p style={{ fontSize: 14, color: "#1B3A5C", lineHeight: 1.65, margin: 0 }}>
                You're sitting on <strong>{totalDollars} in travel value.</strong> Transfer your{" "}
                <strong>Chase points → World of Hyatt</strong> to book the{" "}
                <strong>Park Hyatt Maldives</strong> for just 35k pts/night (worth $1,800+) — then use your{" "}
                <strong>Amex points → Delta SkyMiles</strong> to cover the flights and make it a full dream trip.
              </p>
            </div>

            {/* CTA */}
            <a href="#" style={{
              flexShrink: 0, fontSize: 12, fontWeight: 700,
              color: "#E87C3E", background: "rgba(232,124,62,0.1)",
              border: "1px solid rgba(232,124,62,0.25)",
              borderRadius: 999, padding: "6px 14px",
              textDecoration: "none", whiteSpace: "nowrap",
              transition: "background 0.15s", alignSelf: "flex-start",
            }}>
              See how →
            </a>
          </div>
        </div>
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
  const [cards, setCards] = useState([]);
  const [deals, setDeals] = useState([]);
  const tipsRef = useRef(null);

  // Fetch card catalog and active offers from the API, merge with wallet seed data
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all card definitions and all active offers in parallel
        const [cardsRes, offersRes] = await Promise.all([
          fetch("/api/credit-cards"),
          fetch("/api/credit-cards/offers"),
        ]);
        const cardCatalog = await cardsRes.json();
        const offers = await offersRes.json();

        // Merge catalog data with the user's wallet seed (points balance, card number, etc.)
        const merged = WALLET_CARDS_SEED
          .map((seed) => {
            const meta = cardCatalog.find((c) => c.id === seed.apiId);
            if (!meta) return null;
            return {
              ...meta,
              ...seed,        // seed overrides: holder, number, pointsRaw, points, gradient overrides
              id: seed.apiId, // ensure id is consistent
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.pointsRaw - a.pointsRaw); // sort highest pts first

        setCards(merged);
        setDeals(offers);
      } catch (err) {
        console.error("Failed to load credit card data:", err);
      }
    }
    loadData();
  }, []);

  const totalPointsRaw = cards.reduce((sum, c) => sum + (c.pointsRaw ?? 0), 0);
  const totalPoints = totalPointsRaw.toLocaleString();
  const totalDollarsRaw = cards.reduce((sum, c) => sum + Math.round(((c.pointsRaw ?? 0) * (c.cpp ?? 1)) / 100), 0);
  const totalDollars = totalDollarsRaw >= 1000
    ? `$${(totalDollarsRaw / 1000).toFixed(1)}k`
    : `$${totalDollarsRaw.toLocaleString("en-US")}`;

  // First 4 in primary row, rest overflow
  const primaryCards = cards.slice(0, 4);
  const overflowCards = cards.slice(4);

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-20">

        {/* Page header */}
        <div className="mb-8" style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight">My Wallet</h1>
              <p className="mt-2 text-text-secondary text-base">
                {cards.length} cards · {totalPoints} total points · Sorted by highest balance
              </p>
            </div>
            <div className="bg-white rounded-xl border border-navy/8 shadow-sm px-4 sm:px-5 py-3 shrink-0">
              <div className="text-xs text-text-muted font-medium uppercase tracking-wide mb-0.5">Total Balance</div>
              <div className="text-2xl font-bold text-coral">{totalPoints} pts</div>
              <div className="text-sm font-semibold text-navy/50 mt-0.5">≈ {totalDollars} est. value</div>
            </div>
          </div>
        </div>

        {/* Primary cards row (up to 4) */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center"
          style={{ marginBottom: overflowCards.length > 0 ? 16 : 0 }}
        >
          {primaryCards.map((card, i) => (
            <div key={card.id} style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <CreditCard card={card} index={i} visible={cardsVisible} />
              <div style={{
                fontSize: 13, fontWeight: 700, color: "#4A6B8A",
                opacity: cardsVisible ? 1 : 0,
                transition: `opacity 0.5s ease ${i * 0.12 + 0.4}s`,
              }}>
                ≈ {formatValue(card.pointsRaw, card.cpp)} est. value
              </div>
              {/* Benefit pills */}
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
                opacity: cardsVisible ? 1 : 0,
                transition: `opacity 0.5s ease ${i * 0.12 + 0.55}s`,
              }}>
                {card.benefits.map((b) => (
                  <span key={b} style={{
                    fontSize: 11, fontWeight: 600,
                    color: "#2E5278",
                    background: "rgba(27,58,92,0.07)",
                    border: "1px solid rgba(27,58,92,0.12)",
                    borderRadius: 999,
                    padding: "3px 10px",
                    whiteSpace: "nowrap",
                  }}>{b}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Overflow row (5th card onwards) */}
        {overflowCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
            {overflowCards.map((card, i) => (
              <div key={card.id} style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <CreditCard card={card} index={primaryCards.length + i} visible={cardsVisible} />
                <div style={{
                  fontSize: 13, fontWeight: 700, color: "#4A6B8A",
                  opacity: cardsVisible ? 1 : 0,
                  transition: `opacity 0.5s ease ${(primaryCards.length + i) * 0.12 + 0.4}s`,
                }}>
                  ≈ {formatValue(card.pointsRaw, card.cpp)} est. value
                </div>
                {/* Benefit pills */}
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
                  opacity: cardsVisible ? 1 : 0,
                  transition: `opacity 0.5s ease ${(primaryCards.length + i) * 0.12 + 0.55}s`,
                }}>
                  {card.benefits.map((b) => (
                    <span key={b} style={{
                      fontSize: 11, fontWeight: 600,
                      color: "#2E5278",
                      background: "rgba(27,58,92,0.07)",
                      border: "1px solid rgba(27,58,92,0.12)",
                      borderRadius: 999,
                      padding: "3px 10px",
                      whiteSpace: "nowrap",
                    }}>{b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Opportunity Alert ── */}
        <OpportunityAlert totalPointsRaw={totalPointsRaw} totalDollars={totalDollars} visible={cardsVisible} />

        {/* Deals carousel */}
        <div className="mt-14">
          <DealsCarousel deals={deals} />
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
