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
  // 1st: Amex Gold — most points
  {
    id: "amex",
    name: "American Express Gold",
    shortName: "Amex Gold",
    holder: "Alex Rivera",
    number: "•••• •••••• •1007",
    pointsRaw: 87200,
    points: "87,200",
    network: "AMEX",
    // Realistic Amex Gold: warm gold/brown gradient
    gradient: "linear-gradient(135deg, #c8922a 0%, #e8c05a 35%, #f5d472 50%, #d4a832 70%, #a87420 100%)",
    chipColor: "#8b6010",
    textColor: "#3d2000",
    subColor: "rgba(61,32,0,0.6)",
    logoEl: "amex",
  },
  // 2nd: Chase Sapphire Preferred
  {
    id: "chase",
    name: "Chase Sapphire Preferred",
    shortName: "Chase Sapphire",
    holder: "Alex Rivera",
    number: "•••• •••• •••• 4892",
    pointsRaw: 42500,
    points: "42,500",
    network: "VISA",
    // Realistic Chase Sapphire: deep navy/sapphire with subtle shimmer
    gradient: "linear-gradient(135deg, #0a1628 0%, #1a3a6b 40%, #2255a0 65%, #1a3a6b 100%)",
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
    number: "•••• •••• •••• 3371",
    pointsRaw: 12840,
    points: "12,840",
    network: "MC",
    // Realistic Apple Card: titanium white gradient
    gradient: "linear-gradient(145deg, #f0f0f0 0%, #ffffff 40%, #e8e8e8 70%, #d8d8d8 100%)",
    chipColor: "#a0a0a0",
    textColor: "#1a1a1a",
    subColor: "rgba(0,0,0,0.4)",
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
    card: "Amex Gold",
    cardColor: "#c8922a",
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
    card: "Amex Gold",
    cardColor: "#c8922a",
    partner: "Delta Air Lines",
    partnerShort: "SkyMiles",
    bonus: "20% Bonus",
    description: "Transfer Amex points to Delta SkyMiles with a 20% bonus through the end of the month.",
    expires: "Apr 30, 2026",
    href: "#",
  },
];

const TIPS = [
  { emoji: "🍽️", category: "Dining",       card: "Amex Gold",      detail: "4x points at restaurants worldwide + delivery apps", cardColor: "#c8922a" },
  { emoji: "✈️", category: "Flights",       card: "Chase Sapphire", detail: "3x points on travel + 25 transfer partners",          cardColor: "#1a3a6b" },
  { emoji: "🛒", category: "Groceries",     card: "Amex Gold",      detail: "4x at US supermarkets up to $25k/year",              cardColor: "#c8922a" },
  { emoji: "🏨", category: "Hotels",        card: "Chase Sapphire", detail: "3x on hotels + 10% bonus on redemptions",            cardColor: "#1a3a6b" },
  { emoji: "🍎", category: "Apple Pay",     card: "Apple Card",     detail: "3% Daily Cash on Apple purchases — zero fees",       cardColor: "#555" },
  { emoji: "⛽", category: "Gas & Transit", card: "Chase Sapphire", detail: "3x on transit, parking, tolls & ride-shares",        cardColor: "#1a3a6b" },
];

/* ─────────────────────────────────────────────
   Network logos
───────────────────────────────────────────── */
function NetworkLogo({ type, textColor }) {
  if (type === "visa") {
    return (
      <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.9)", letterSpacing: -0.5 }}>
        VISA
      </span>
    );
  }
  if (type === "amex") {
    return (
      <span style={{ fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 900, color: "rgba(61,32,0,0.8)", letterSpacing: 1 }}>
        AMEX
      </span>
    );
  }
  if (type === "mc") {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#eb001b", opacity: 0.9 }} />
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f79e1b", opacity: 0.9, marginLeft: -10 }} />
      </div>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────
   Program icon top-left (like screenshot)
───────────────────────────────────────────── */
function ProgramIcon({ cardId, textColor }) {
  const style = {
    width: 32, height: 32, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 800,
    background: "rgba(0,0,0,0.18)",
    color: textColor,
    flexShrink: 0,
  };
  const icons = { chase: "✦", amex: "★", apple: "" };
  const labels = { chase: "UR", amex: "MR", apple: "" };

  if (cardId === "apple") {
    return (
      <div style={{ ...style, background: "rgba(0,0,0,0.08)", fontSize: 16 }}>

      </div>
    );
  }
  return <div style={style}>{labels[cardId]}</div>;
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
        background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
        borderRadius: "20px 20px 0 0", pointerEvents: "none",
      }} />
      {/* Shimmer */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)",
        backgroundSize: "600px 100%",
        animation: "shimmer 4s infinite linear",
        pointerEvents: "none",
      }} />

      {/* Top row: program icon + name + chip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProgramIcon cardId={card.id} textColor={card.textColor} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: card.textColor, opacity: 0.7, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {card.shortName}
            </div>
          </div>
        </div>
        {/* EMV Chip */}
        <div style={{
          width: 36, height: 28,
          background: `linear-gradient(135deg, ${card.chipColor} 0%, #f0d878 50%, ${card.chipColor} 100%)`,
          borderRadius: 5,
          border: "1px solid rgba(0,0,0,0.1)",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr", gap: 2, padding: 3,
        }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.1)", borderRadius: 1 }} />
          ))}
        </div>
      </div>

      {/* Points — large number like the screenshot */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontSize: "clamp(28px, 5vw, 38px)",
          fontWeight: 800,
          color: card.textColor,
          lineHeight: 1,
          letterSpacing: -1,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {card.points}
        </div>
        <div style={{ fontSize: 11, color: card.textColor, opacity: 0.55, marginTop: 3, fontWeight: 600, letterSpacing: 0.5 }}>
          POINTS
        </div>
      </div>

      {/* Bottom row: cardholder + number + network */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 9, color: card.textColor, opacity: 0.5, letterSpacing: 1.5, marginBottom: 2, fontWeight: 700 }}>
            CARD HOLDER
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: card.textColor, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {card.holder}
          </div>
          <div style={{ fontSize: 11, color: card.textColor, opacity: 0.45, marginTop: 2, letterSpacing: 1.5, fontFamily: "'Courier New', monospace" }}>
            {card.number.slice(-4).padStart(card.number.length, "•").replace(/(.{4})/g, "$1 ").trim()}
          </div>
        </div>
        <NetworkLogo type={card.logoEl} textColor={card.textColor} />
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
