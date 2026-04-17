"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { formatLastSynced, isStale } from "@/lib/programLinks";
import { getUserProfile } from "@/lib/userProfile";
import { createClient } from "@/lib/supabase/client";

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
    apiId: "amex-platinum",
    holder: "Alex Rivera",
    number: "•••• •••••• •1007",
    pointsRaw: 87200,
    points: "87,200",
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
    apiId: "capital-one-venture-x",
    holder: "Alex Rivera",
    number: "•••• •••• •••• 8847",
    pointsRaw: 34500,
    points: "34,500",
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
   Botanical flower overlay for Amex Platinum
───────────────────────────────────────────── */
function BotanicalOverlay() {
  return (
    <svg viewBox="0 0 180 110" style={{
      position: "absolute", right: 0, top: 0,
      width: "68%", height: "100%",
      pointerEvents: "none", opacity: 0.88,
    }} preserveAspectRatio="xMaxYMid slice">
      {/* Main stems — thicker, lusher */}
      <path d="M10,110 C22,82 40,62 56,38 C68,18 80,6 90,0" stroke="#3d7020" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M48,110 C60,86 76,68 96,48 C112,30 130,14 144,4" stroke="#2d6010" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M90,110 C102,90 118,74 138,56 C154,42 168,30 178,20" stroke="#3d7020" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Extra vine branching */}
      <path d="M56,38 C64,30 72,26 80,24" stroke="#4a8028" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M96,48 C106,38 116,32 124,28" stroke="#3a7018" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

      {/* Leaves — bigger, more varied */}
      <ellipse cx="28" cy="90" rx="14" ry="6" fill="#3d7020" transform="rotate(-35 28 90)" opacity="0.75"/>
      <ellipse cx="50" cy="70" rx="13" ry="5.5" fill="#4a8028" transform="rotate(22 50 70)" opacity="0.72"/>
      <ellipse cx="76" cy="50" rx="13" ry="6" fill="#2d6010" transform="rotate(-12 76 50)" opacity="0.72"/>
      <ellipse cx="108" cy="42" rx="12" ry="5.5" fill="#3d7020" transform="rotate(28 108 42)" opacity="0.68"/>
      <ellipse cx="148" cy="52" rx="12" ry="5.5" fill="#4a8028" transform="rotate(-18 148 52)" opacity="0.65"/>
      <ellipse cx="80" cy="24" rx="9" ry="4" fill="#5a9030" transform="rotate(-30 80 24)" opacity="0.6"/>
      <ellipse cx="124" cy="28" rx="9" ry="4" fill="#3d7020" transform="rotate(15 124 28)" opacity="0.6"/>

      {/* Yellow sunflower — large, vivid */}
      <circle cx="58" cy="36" r="15" fill="none" stroke="#f0c818" strokeWidth="7.5" strokeDasharray="6 3.5" opacity="0.92"/>
      <circle cx="58" cy="36" r="7" fill="#d4980c" opacity="0.96"/>
      <circle cx="58" cy="36" r="3.2" fill="#a87008" opacity="0.95"/>

      {/* Blue cornflower — large */}
      <circle cx="146" cy="20" r="13" fill="none" stroke="#4868d8" strokeWidth="6.5" strokeDasharray="5.5 3" opacity="0.88"/>
      <circle cx="146" cy="20" r="6" fill="#2848a8" opacity="0.92"/>
      <circle cx="146" cy="20" r="2.8" fill="#102870" opacity="0.9"/>

      {/* Pink flower — large */}
      <circle cx="166" cy="68" r="12" fill="none" stroke="#e04890" strokeWidth="6" strokeDasharray="5 3" opacity="0.85"/>
      <circle cx="166" cy="68" r="5.5" fill="#b02860" opacity="0.9"/>
      <circle cx="166" cy="68" r="2.4" fill="#801040" opacity="0.9"/>

      {/* Orange flower */}
      <circle cx="18" cy="48" r="11" fill="none" stroke="#e86820" strokeWidth="6" strokeDasharray="5 2.5" opacity="0.85"/>
      <circle cx="18" cy="48" r="5" fill="#c04810" opacity="0.9"/>
      <circle cx="18" cy="48" r="2" fill="#903008" opacity="0.9"/>

      {/* Purple/lavender accent flower */}
      <circle cx="120" cy="76" r="9" fill="none" stroke="#9060d0" strokeWidth="5" strokeDasharray="4 2.5" opacity="0.78"/>
      <circle cx="120" cy="76" r="4" fill="#6038a8" opacity="0.85"/>
      <circle cx="120" cy="76" r="1.8" fill="#401880" opacity="0.85"/>

      {/* Small yellow accent */}
      <circle cx="30" cy="20" r="7" fill="none" stroke="#f0c818" strokeWidth="4" strokeDasharray="4 2" opacity="0.75"/>
      <circle cx="30" cy="20" r="3" fill="#d4980c" opacity="0.88"/>

      {/* Buds — more prominent */}
      <ellipse cx="84" cy="12" rx="4" ry="7" fill="#7ab830" opacity="0.65" transform="rotate(-18 84 12)"/>
      <ellipse cx="118" cy="96" rx="3.5" ry="6.5" fill="#e070a8" opacity="0.58" transform="rotate(12 118 96)"/>
      <ellipse cx="174" cy="88" rx="3" ry="5.5" fill="#7ab830" opacity="0.55" transform="rotate(6 174 88)"/>
      <ellipse cx="100" cy="6" rx="3" ry="5" fill="#4868d8" opacity="0.52" transform="rotate(-8 100 6)"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Capital One logo
───────────────────────────────────────────── */
function CapitalOneLogo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
      <svg viewBox="0 0 46 14" style={{ width: 42, height: 13 }}>
        <path
          d="M 3,12 C 7,5 14,1 23,1 C 32,1 39,5 43,11 C 44,13 42,14 40,12 C 36,7 30,4 23,4 C 16,4 10,7 6,12 C 4,14 2,14 3,12 Z"
          fill="rgba(185,208,238,0.88)"
        />
      </svg>
      <div style={{ fontSize: 11.5, lineHeight: 1, letterSpacing: -0.2, color: "rgba(185,208,238,0.88)" }}>
        <span style={{ fontStyle: "italic", fontWeight: 400, fontFamily: "Georgia, 'Times New Roman', serif" }}>Capital</span>
        <span style={{ fontWeight: 700, fontFamily: "Arial, Helvetica, sans-serif" }}>One</span>
      </div>
    </div>
  );
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
      {/* Botanical flower overlay */}
      <BotanicalOverlay />

      {/* Decorative ornate border */}
      <div style={{
        position: "absolute", inset: 7, borderRadius: 13, pointerEvents: "none",
        border: "1px solid rgba(40,50,60,0.22)",
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
   Apple Card — titanium white, ultra-minimal
───────────────────────────────────────────── */
function AppleCard({ card, index, visible }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardShell(hovered, index, visible, {
        background: "linear-gradient(145deg, #f2f2f4 0%, #fafafa 28%, #ffffff 50%, #f4f4f6 75%, #ebebed 100%)",
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: hovered ? "0 22px 52px rgba(0,0,0,0.22)" : "0 6px 24px rgba(0,0,0,0.12)",
      })}
    >
      {/* Titanium brushed sheen */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
        background: "linear-gradient(120deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 40%, rgba(200,200,210,0.15) 100%)",
      }} />
      {/* Subtle rainbow shimmer on hover — Apple's iridescent titanium effect */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
        backgroundSize: "600px 100%", animation: "shimmer 7s infinite linear",
        opacity: hovered ? 1 : 0.5,
        transition: "opacity 0.3s ease",
      }} />

      {/* Apple logo watermark — centered */}
      <svg viewBox="0 0 814 1000" style={{
        position: "absolute", left: "50%", top: "46%",
        transform: "translate(-50%,-50%)",
        width: 72, height: 72, opacity: 0.07, pointerEvents: "none",
      }} fill="#1d1d1f">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.6-155.5-127.4C46 790.9 0 661.7 0 538.3 0 319 133.4 201.3 264.4 201.3c64.2 0 117.6 42.8 157.6 42.8 38.2 0 97.9-45.5 168.1-45.5 27.1 0 109.8 2.6 165.1 99.3zM538.2 130.3C507.4 162.8 460 188.9 410.3 188.9c-6.4 0-12.8-.6-19.2-1.9 2.6-49 24.7-99.3 56.5-132.5 35.1-36.5 88.3-63.9 138.9-66.5 2 6.4 3.2 12.8 3.2 19.8 0 47.5-20 95.5-51.5 122.5z"/>
      </svg>

      {/* Top: "apple card" wordmark — minimal, lower-case style */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 300, letterSpacing: 1.5,
          color: "rgba(0,0,0,0.38)", fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
        }}>
          apple card
        </div>
        {/* No chip on front — real Apple Card titanium has no numbers or chip on front */}
      </div>

      {/* Daily Cash balance */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontSize: "clamp(26px,4.5vw,36px)", fontWeight: 600,
          color: "#1d1d1f", lineHeight: 1, letterSpacing: -1,
          fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
        }}>
          {card.points}
        </div>
        <div style={{
          fontSize: 10, color: "rgba(0,0,0,0.38)", marginTop: 3,
          fontWeight: 400, letterSpacing: 1.2,
          fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
        }}>
          DAILY CASH
        </div>
      </div>

      {/* Bottom: name + Mastercard */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.72)",
            letterSpacing: 1.5, textTransform: "uppercase",
            fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
          }}>
            {card.holder}
          </div>
        </div>
        {/* Mastercard interlocking circles */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(180,0,0,0.55)" }} />
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(220,80,0,0.5)", marginLeft: -10 }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Chase octagon logo
───────────────────────────────────────────── */
function ChaseOctagonLogo() {
  return (
    <svg viewBox="0 0 38 38" style={{ width: 30, height: 30, flexShrink: 0 }}>
      {/* Octagon outline */}
      <polygon
        points="13,1 25,1 37,13 37,25 25,37 13,37 1,25 1,13"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="1.6"
      />
      {/* Chase mark — two curved arcs forming the stylized C */}
      <path d="M19,7 C27,7 32,12 32,19" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M19,31 C11,31 6,26 6,19" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.8" strokeLinecap="round"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Chase Sapphire Preferred — iconic dark sapphire blue
───────────────────────────────────────────── */
function ChaseSapphireCard({ card, index, visible }) {
  const [hovered, setHovered] = useState(false);
  const isSapphireReserve = card.id === "chase-sapphire-reserve";
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardShell(hovered, index, visible, {
        background: isSapphireReserve
          ? "linear-gradient(145deg, #111822 0%, #1a2438 30%, #1e2c48 55%, #141e30 80%, #0c1220 100%)"
          : "linear-gradient(145deg, #0a1e58 0%, #112680 25%, #1a3aa8 45%, #122e90 65%, #0a1e60 100%)",
      })}
    >
      {/* Sapphire gem radial glow — the signature visual */}
      <div style={{
        position: "absolute", top: "44%", left: "60%",
        width: 200, height: 200,
        background: isSapphireReserve
          ? "radial-gradient(circle, rgba(120,160,240,0.32) 0%, rgba(70,110,200,0.15) 40%, transparent 70%)"
          : "radial-gradient(circle, rgba(100,160,255,0.38) 0%, rgba(50,100,230,0.18) 40%, transparent 70%)",
        transform: "translate(-50%,-50%)", pointerEvents: "none", borderRadius: "50%",
      }} />
      {/* Secondary softer glow */}
      <div style={{
        position: "absolute", top: "52%", left: "55%",
        width: 120, height: 120,
        background: "radial-gradient(circle, rgba(180,210,255,0.18) 0%, transparent 70%)",
        transform: "translate(-50%,-50%)", pointerEvents: "none", borderRadius: "50%",
      }} />
      {/* Metallic sheen */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 45%, transparent 100%)",
      }} />
      {/* Shimmer */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)",
        backgroundSize: "600px 100%", animation: "shimmer 5s infinite linear",
      }} />

      {/* Top: Chase logo + card name */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <ChaseOctagonLogo />
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: 1.2,
            color: "rgba(255,255,255,0.78)", textTransform: "uppercase",
          }}>
            {isSapphireReserve ? "Sapphire Reserve" : "Sapphire Preferred"}
          </div>
        </div>
        <Chip color="#c8a832" />
      </div>

      {/* Points balance */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontSize: "clamp(26px,4.5vw,36px)", fontWeight: 800,
          color: "#ffffff", lineHeight: 1, letterSpacing: -1,
        }}>
          {card.points}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 3, fontWeight: 600, letterSpacing: 1.2 }}>
          ULTIMATE REWARDS
        </div>
      </div>

      {/* Bottom: cardholder + Visa */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, marginBottom: 2, fontWeight: 700 }}>CARD HOLDER</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: 0.5, textTransform: "uppercase" }}>
            {card.holder}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2, letterSpacing: 1.5, fontFamily: "'Courier New', monospace" }}>
            {card.number}
          </div>
        </div>
        <NetworkLogo type="visa" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Capital One Venture X — deep navy blue
───────────────────────────────────────────── */
function VentureXCard({ card, index, visible }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardShell(hovered, index, visible, {
        background: "linear-gradient(150deg, #081420 0%, #0d1f40 28%, #102850 55%, #0a1a36 80%, #05101c 100%)",
      })}
    >
      {/* Subtle blue depth glow */}
      <div style={{
        position: "absolute", top: "35%", left: "58%",
        width: 200, height: 160,
        background: "radial-gradient(ellipse, rgba(25,70,170,0.28) 0%, transparent 70%)",
        transform: "translate(-50%,-50%)", pointerEvents: "none",
      }} />
      {/* Metallic sheen */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 40%, transparent 100%)",
      }} />
      {/* Shimmer */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
        backgroundSize: "600px 100%", animation: "shimmer 6s infinite linear",
      }} />

      {/* Top: Capital One logo — right-aligned */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "flex-end" }}>
        <CapitalOneLogo />
      </div>

      {/* Middle: Chip + contactless */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <Chip color="#7a8ea0" />
        {/* Contactless arcs */}
        <svg viewBox="0 0 18 22" style={{ width: 15, height: 19 }} fill="none">
          <circle cx="5" cy="11" r="1.4" fill="rgba(175,200,230,0.75)"/>
          <path d="M 8,6.5 Q 13,8.5 13,11 Q 13,13.5 8,15.5" stroke="rgba(175,200,230,0.65)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          <path d="M 9.5,4 Q 15.5,7 15.5,11 Q 15.5,15 9.5,18" stroke="rgba(175,200,230,0.45)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      {/* VENTURE X lettering */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: "'Arial', 'Helvetica', sans-serif",
          fontSize: 16, fontWeight: 300, letterSpacing: 5.5,
          color: "rgba(182,206,238,0.9)",
          textShadow: "0 0 18px rgba(80,130,230,0.22)",
        }}>
          VENTURE X
        </div>
      </div>

      {/* Bottom: cardholder + Visa */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 9, color: "rgba(175,200,230,0.45)", letterSpacing: 1.5, marginBottom: 2, fontWeight: 700 }}>CARD HOLDER</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(182,206,238,0.92)", letterSpacing: 0.8, textTransform: "uppercase" }}>
            {card.holder}
          </div>
          <div style={{ fontSize: 10, color: "rgba(175,200,230,0.35)", marginTop: 2, letterSpacing: 1.5, fontFamily: "'Courier New', monospace" }}>
            {card.number}
          </div>
        </div>
        <NetworkLogo type="visa" />
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
  if (card.id === "chase-sapphire-preferred" || card.id === "chase-sapphire-reserve") {
    return <ChaseSapphireCard card={card} index={index} visible={visible} />;
  }
  if (card.id === "capital-one-venture-x") {
    return <VentureXCard card={card} index={index} visible={visible} />;
  }
  if (card.id === "apple-card") {
    return <AppleCard card={card} index={index} visible={visible} />;
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
   Locked / unauthenticated state
───────────────────────────────────────────── */
function WalletLockedState() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center text-center">

        {/* Globe + cards illustration */}
        <div className="relative mb-10 select-none" style={{ width: 320, height: 300 }}>
          <svg viewBox="0 0 320 300" width="320" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="globe-grad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#7ec8e3" />
                <stop offset="45%" stopColor="#2b7dc8" />
                <stop offset="100%" stopColor="#0d3b8c" />
              </radialGradient>
              <radialGradient id="globe-shine" cx="32%" cy="25%" r="42%">
                <stop offset="0%" stopColor="white" stopOpacity="0.22" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="limb-dark" cx="50%" cy="50%" r="50%">
                <stop offset="68%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,10,50,0.55)" />
              </radialGradient>
              <clipPath id="globe-clip">
                <circle cx="160" cy="155" r="105" />
              </clipPath>
              <filter id="card-shadow">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* Atmosphere glow */}
            <circle cx="160" cy="155" r="113" fill="rgba(100,180,255,0.12)" />
            <circle cx="160" cy="155" r="109" fill="rgba(100,180,255,0.08)" />

            {/* Globe body */}
            <circle cx="160" cy="155" r="105" fill="url(#globe-grad)" />

            {/* ── Grid lines (latitude + longitude) ── */}
            <g clipPath="url(#globe-clip)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" fill="none">
              {/* Latitude lines */}
              <ellipse cx="160" cy="103" rx="91"  ry="12" />  {/* 30°N */}
              <ellipse cx="160" cy="155" rx="105" ry="14" />  {/* Equator */}
              <ellipse cx="160" cy="207" rx="91"  ry="12" />  {/* 30°S */}
              <ellipse cx="160" cy="64"  rx="52"  ry="7"  />  {/* 60°N */}
              <ellipse cx="160" cy="246" rx="52"  ry="7"  />  {/* 60°S */}
              {/* Longitude lines */}
              <line x1="160" y1="50" x2="160" y2="260" />
              <ellipse cx="160" cy="155" rx="52"  ry="105" />
              <ellipse cx="160" cy="155" rx="91"  ry="105" />
            </g>

            {/* ── Continent shapes ── */}
            <g clipPath="url(#globe-clip)" fill="#3ecf7a" opacity="0.62">
              {/* Greenland */}
              <path d="M138,54 Q150,48 158,56 Q163,64 156,73 Q147,80 137,74 Q129,67 138,54 Z" />
              {/* North America */}
              <path d="M88,72 Q84,88 77,106 Q72,124 74,142 Q78,158 88,168 Q98,177 108,182 Q116,188 120,197
                       Q113,202 106,195 Q96,178 90,160 Q84,140 88,116 Q93,94 108,80 Q120,70 136,65
                       Q122,58 108,57 Q96,58 88,72 Z" />
              {/* Florida */}
              <path d="M108,182 Q114,195 110,200 Q104,199 103,189 Z" />
              {/* South America */}
              <path d="M112,200 Q124,194 134,199 Q148,208 150,228 Q148,252 136,265
                       Q125,272 114,263 Q102,250 102,230 Q102,210 112,200 Z" />
              {/* Europe (Iberia + Britain) */}
              <path d="M170,82 Q180,78 188,84 Q192,92 188,100 Q184,107 175,106
                       Q167,103 164,96 Q164,87 170,82 Z" />
              <path d="M179,74 Q186,72 190,78 Q191,83 186,86 Q181,86 178,81 Z" />
              {/* Africa */}
              <path d="M168,112 Q182,108 192,120 Q200,134 198,158 Q195,182 184,203
                       Q173,220 161,216 Q149,210 146,193 Q143,172 150,150
                       Q156,128 168,112 Z" />
              {/* Partial Asia (right edge) */}
              <path d="M198,88 Q215,84 228,92 Q236,102 230,116 Q222,126 208,124
                       Q196,120 194,108 Z" />
            </g>

            {/* Limb darkening — makes sphere look 3D */}
            <circle cx="160" cy="155" r="105" fill="url(#limb-dark)" />

            {/* Globe shine */}
            <circle cx="160" cy="155" r="105" fill="url(#globe-shine)" />

            {/* Location pins */}
            {[
              { x: 112, y: 130, label: "NYC" },
              { x: 178, y: 100, label: "LON" },
              { x: 213, y: 112, label: "DXB" },
              { x: 168, y: 178, label: "JNB" },
              { x: 124, y: 182, label: "GRU" },
            ].map(({ x, y, label }) => (
              <g key={label}>
                <circle cx={x} cy={y} r="5" fill="#f97316" opacity="0.92" />
                <circle cx={x} cy={y} r="2.5" fill="white" opacity="0.95" />
              </g>
            ))}

            {/* Route lines */}
            <g clipPath="url(#globe-clip)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" strokeDasharray="3 4">
              <path d="M112,130 Q145,92 178,100" />
              <path d="M178,100 Q196,106 213,112" />
              <path d="M112,130 Q118,156 124,182" />
            </g>

            {/* Red card — right */}
            <g transform="rotate(12, 258, 160)" filter="url(#card-shadow)">
              <rect x="216" y="130" width="88" height="56" rx="7" fill="url(#red-grad)" />
              <defs>
                <linearGradient id="red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>
              <rect x="226" y="148" width="18" height="14" rx="2" fill="#fca5a5" opacity="0.5" />
              <rect x="226" y="168" width="50" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
              <rect x="226" y="175" width="30" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
            </g>

            {/* Sparkle decorations */}
            {[
              { x: 52, y: 48, s: 0.8 }, { x: 270, y: 42, s: 1 },
              { x: 290, y: 200, s: 0.7 }, { x: 40, y: 240, s: 0.9 },
            ].map(({ x, y, s }, i) => (
              <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
                <path d="M0,-10 C1,-4 1,-4 6,0 C1,4 1,4 0,10 C-1,4 -1,4 -6,0 C-1,-4 -1,-4 0,-10 Z" fill="#C9A020" opacity="0.7" />
              </g>
            ))}
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-bold text-navy leading-tight mb-4">
          Unlock deals tailored<br />to your wallet
        </h1>

        {/* Body copy */}
        <p className="text-base text-text-muted max-w-md mb-8 leading-relaxed">
          Add your cards and points balances to see exactly which awards you can book today — and how close you are to the rest.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            "Personalized deal matches",
            "Points gap tracker",
            "Transfer partner suggestions",
          ].map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-sm font-medium text-navy bg-white border border-navy/10 px-4 py-2 rounded-full shadow-sm">
              <span className="text-coral">✦</span> {f}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/signup"
            className="bg-coral text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-coral/90 transition-colors shadow-sm"
          >
            Create free account
          </a>
          <a href="/signin" className="text-sm font-medium text-navy hover:text-coral transition-colors">
            Already have an account? <span className="font-semibold underline underline-offset-2">Log in</span>
          </a>
        </div>
      </main>
      <Footer />
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
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const tipsRef = useRef(null);

  // Auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

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

        // Load user profile for lastSyncedAt timestamps
        const userProfile = getUserProfile();
        // Map card apiId → profile programId (wallet cards to loyalty program IDs)
        const CARD_TO_PROGRAM = {
          "amex-platinum":            "amex-mr",
          "amex-gold":                "amex-mr",
          "chase-sapphire-preferred": "chase-ur",
          "chase-sapphire-reserve":   "chase-ur",
          "chase-freedom-unlimited":  "chase-ur",
          "chase-ink-business-preferred": "chase-ur",
          "citi-premier":             "citi-ty",
          "citi-double-cash":         "citi-ty",
          "capital-one-venture-x":    "cap1-miles",
          "capital-one-venture":      "cap1-miles",
          "bilt-mastercard":          "bilt",
          "apple-card":               null, // cashback, no program
        };

        // Merge catalog data with the user's wallet seed (points balance, card number, etc.)
        const merged = WALLET_CARDS_SEED
          .map((seed) => {
            const meta = cardCatalog.find((c) => c.id === seed.apiId);
            if (!meta) return null;
            const programId = CARD_TO_PROGRAM[seed.apiId] ?? null;
            const programEntry = programId
              ? userProfile?.programs?.find((p) => p.programId === programId)
              : null;
            // If the user has a saved balance for this program, use it — otherwise fall back to seed
            const liveBalance = programEntry?.balance ?? null;
            const pointsRaw = liveBalance !== null ? liveBalance : seed.pointsRaw;
            const points = pointsRaw.toLocaleString("en-US");

            return {
              ...meta,
              ...seed,        // seed overrides: holder, number, gradient overrides
              id: seed.apiId, // ensure id is consistent
              pointsRaw,      // live balance from profile (or seed fallback)
              points,         // formatted string
              lastSyncedAt: programEntry?.lastSyncedAt ?? null,
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

  // Show locked state for unauthenticated users
  if (user === null) return <WalletLockedState />;

  // Loading spinner while auth resolves
  if (user === undefined) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-navy/20 border-t-navy animate-spin" />
    </div>
  );

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
                opacity: cardsVisible ? 1 : 0,
                transition: `opacity 0.5s ease ${i * 0.12 + 0.4}s`,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#4A6B8A" }}>
                  ≈ {formatValue(card.pointsRaw, card.cpp)} est. value
                </div>
                <div style={{ fontSize: 11, color: isStale(card.lastSyncedAt) ? "#f59e0b" : "#94a3b8", marginTop: 2 }}>
                  {formatLastSynced(card.lastSyncedAt)}
                </div>
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
                  opacity: cardsVisible ? 1 : 0,
                  transition: `opacity 0.5s ease ${(primaryCards.length + i) * 0.12 + 0.4}s`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#4A6B8A" }}>
                    ≈ {formatValue(card.pointsRaw, card.cpp)} est. value
                  </div>
                  <div style={{ fontSize: 11, color: isStale(card.lastSyncedAt) ? "#f59e0b" : "#94a3b8", marginTop: 2 }}>
                    {formatLastSynced(card.lastSyncedAt)}
                  </div>
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
