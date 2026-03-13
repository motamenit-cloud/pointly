/**
 * Inline SVG airline logos — recognizable silhouettes in brand colors.
 * Used in flight result cards and filter sidebar.
 */

function BALogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#075AAA" />
      {/* Ribbon / speedmarque shape */}
      <path d="M10 26 L18 14 L22 14 L30 26 Z" fill="#C8102E" opacity="0.9" />
      <path d="M12 25 L18 16 L22 16 L28 25 Z" fill="white" />
      <text x="20" y="24" textAnchor="middle" fontSize="8" fontWeight="700" fill="#075AAA" fontFamily="sans-serif">BA</text>
    </svg>
  );
}

function VSLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#B80024" />
      {/* Stylized V shape */}
      <path d="M12 13 L20 28 L28 13" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="30" r="1.5" fill="white" />
    </svg>
  );
}

function UALogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#002244" />
      {/* Globe / tulip shape */}
      <ellipse cx="20" cy="18" rx="8" ry="8" fill="none" stroke="#0066CC" strokeWidth="1.5" />
      <path d="M14 18 Q20 10 26 18 Q20 24 14 18 Z" fill="#0066CC" opacity="0.6" />
      <path d="M17 18 Q20 13 23 18 Q20 22 17 18 Z" fill="white" opacity="0.8" />
      <text x="20" y="33" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="white" fontFamily="sans-serif">UNITED</text>
    </svg>
  );
}

function AALogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#B6322D" />
      {/* Eagle / A shape */}
      <path d="M13 28 L20 11 L27 28" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="23" x2="24" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Eagle wing accents */}
      <path d="M20 14 L28 18 L32 15" stroke="#5CACEE" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M20 14 L12 18 L8 15" stroke="#5CACEE" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function AFLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#002157" />
      {/* Winged horse / chevron */}
      <path d="M10 24 L20 14 L30 24" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 27 L20 20 L26 27" stroke="#C8102E" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="20" y="34" textAnchor="middle" fontSize="5" fontWeight="600" fill="white" fontFamily="sans-serif" letterSpacing="0.5">AIR FRANCE</text>
    </svg>
  );
}

function DLLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#003366" />
      {/* Delta triangle / widget */}
      <polygon points="20,10 30,28 10,28" fill="#C8102E" />
      <polygon points="20,14 27,26 13,26" fill="#003366" />
      <polygon points="20,17 24.5,24.5 15.5,24.5" fill="white" opacity="0.9" />
    </svg>
  );
}

/* ── Map of airline code → logo component ── */
const logoMap: Record<string, () => React.JSX.Element> = {
  BA: BALogo,
  VS: VSLogo,
  UA: UALogo,
  AA: AALogo,
  AF: AFLogo,
  DL: DLLogo,
};

/* ── Public component ── */
export function AirlineLogo({
  code,
  size = 40,
}: {
  code: string;
  color?: string;
  size?: number;
}) {
  const LogoComponent = logoMap[code];

  if (LogoComponent) {
    return (
      <div className="shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
        <LogoComponent />
      </div>
    );
  }

  /* Fallback: colored circle with code */
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold bg-navy"
      style={{ width: size, height: size }}
    >
      {code}
    </div>
  );
}
