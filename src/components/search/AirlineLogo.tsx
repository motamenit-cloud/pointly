/**
 * Inline SVG airline logos — recognizable silhouettes in brand colors.
 * Used in flight result cards and filter sidebar.
 */

function BALogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#075AAA" />
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
      <path d="M12 13 L20 28 L28 13" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="30" r="1.5" fill="white" />
    </svg>
  );
}

function UALogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#002244" />
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
      <path d="M13 28 L20 11 L27 28" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="23" x2="24" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 14 L28 18 L32 15" stroke="#5CACEE" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M20 14 L12 18 L8 15" stroke="#5CACEE" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function AFLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#002157" />
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
      <polygon points="20,10 30,28 10,28" fill="#C8102E" />
      <polygon points="20,14 27,26 13,26" fill="#003366" />
      <polygon points="20,17 24.5,24.5 15.5,24.5" fill="white" opacity="0.9" />
    </svg>
  );
}

function EKLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#D71921" />
      <text x="20" y="18" textAnchor="middle" fontSize="6" fontWeight="700" fill="white" fontFamily="sans-serif" letterSpacing="0.3">EMIR</text>
      <text x="20" y="25" textAnchor="middle" fontSize="6" fontWeight="700" fill="white" fontFamily="sans-serif" letterSpacing="0.3">ATES</text>
      <path d="M12 29 Q20 33 28 29" stroke="#C5A355" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function QRLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#5C0632" />
      <path d="M14 14 L20 10 L26 14 L26 24 L20 28 L14 24 Z" fill="none" stroke="#C8A96E" strokeWidth="1.5" />
      <text x="20" y="22" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" fontFamily="sans-serif">QR</text>
    </svg>
  );
}

function SQLogp() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#F5A623" />
      <path d="M15 12 L20 8 L25 12 L25 20 L20 24 L15 20 Z" fill="none" stroke="white" strokeWidth="1.2" />
      <text x="20" y="33" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="white" fontFamily="sans-serif">SIA</text>
      <circle cx="20" cy="16" r="3" fill="white" opacity="0.9" />
    </svg>
  );
}

function LHLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#05164D" />
      <circle cx="20" cy="19" r="9" fill="none" stroke="#F0C14B" strokeWidth="1.5" />
      <path d="M14 19 L20 13 L26 19 L20 25 Z" fill="none" stroke="#F0C14B" strokeWidth="1.2" />
      <path d="M17 19 L20 16 L23 19 L20 22 Z" fill="#F0C14B" opacity="0.8" />
    </svg>
  );
}

function CXLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#006564" />
      <path d="M12 16 Q20 8 28 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M12 22 Q20 14 28 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x="20" y="33" textAnchor="middle" fontSize="5" fontWeight="600" fill="white" fontFamily="sans-serif">CATHAY</text>
    </svg>
  );
}

function NHLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#13448F" />
      <text x="20" y="23" textAnchor="middle" fontSize="10" fontWeight="800" fill="white" fontFamily="sans-serif">ANA</text>
      <path d="M10 28 L30 28" stroke="#5AC8FA" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function JLLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#C8102E" />
      <circle cx="20" cy="18" r="7" fill="white" />
      <circle cx="20" cy="18" r="4" fill="#C8102E" />
      <text x="20" y="33" textAnchor="middle" fontSize="5" fontWeight="700" fill="white" fontFamily="sans-serif">JAL</text>
    </svg>
  );
}

function ACLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#D92228" />
      <path d="M15 14 L20 10 L25 14 L25 24 L20 28 L15 24 Z" fill="none" stroke="white" strokeWidth="1.2" />
      <path d="M16 19 L24 19" stroke="white" strokeWidth="1" />
      <path d="M20 14 L20 24" stroke="white" strokeWidth="1" />
      <text x="20" y="35" textAnchor="middle" fontSize="4.5" fontWeight="600" fill="white" fontFamily="sans-serif">AIR CANADA</text>
    </svg>
  );
}

function ASLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#01426A" />
      <circle cx="20" cy="16" r="6" fill="none" stroke="white" strokeWidth="1.2" />
      <path d="M16 16 Q20 12 24 16" fill="white" opacity="0.8" />
      <text x="20" y="32" textAnchor="middle" fontSize="5" fontWeight="700" fill="white" fontFamily="sans-serif">ALASKA</text>
    </svg>
  );
}

function B6Logo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#003876" />
      <circle cx="14" cy="18" r="4" fill="#0095DA" opacity="0.8" />
      <circle cx="22" cy="14" r="3" fill="#0095DA" opacity="0.6" />
      <circle cx="26" cy="20" r="3.5" fill="#0095DA" opacity="0.7" />
      <text x="20" y="33" textAnchor="middle" fontSize="5" fontWeight="700" fill="white" fontFamily="sans-serif">JETBLUE</text>
    </svg>
  );
}

function WNLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#304CB2" />
      <circle cx="20" cy="17" r="7" fill="#FFBF27" />
      <circle cx="20" cy="17" r="4.5" fill="#C8102E" />
      <circle cx="20" cy="17" r="2" fill="#FFBF27" />
      <text x="20" y="33" textAnchor="middle" fontSize="4" fontWeight="700" fill="white" fontFamily="sans-serif">SOUTHWEST</text>
    </svg>
  );
}

function TKLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#C7222A" />
      <path d="M14 16 Q20 10 26 16 Q20 22 14 16 Z" fill="white" opacity="0.9" />
      <text x="20" y="33" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="white" fontFamily="sans-serif">TURKISH</text>
    </svg>
  );
}

function IBLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#D71A21" />
      <text x="20" y="18" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#FFC72C" fontFamily="sans-serif">IBERIA</text>
      <circle cx="20" cy="24" r="4" fill="#FFC72C" opacity="0.9" />
      <circle cx="20" cy="24" r="2" fill="#D71A21" />
    </svg>
  );
}

function EYLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#BD8B13" />
      <path d="M14 12 L26 12 L26 26 L20 30 L14 26 Z" fill="none" stroke="white" strokeWidth="1.2" />
      <text x="20" y="23" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" fontFamily="sans-serif">EY</text>
    </svg>
  );
}

function KLLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#00A1DE" />
      <path d="M15 14 L20 10 L25 14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 20 L20 13 L27 20" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="20" y="31" textAnchor="middle" fontSize="6" fontWeight="700" fill="white" fontFamily="sans-serif">KLM</text>
    </svg>
  );
}

function AVLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#E31837" />
      <path d="M12 22 L20 12 L28 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="20" y="32" textAnchor="middle" fontSize="5" fontWeight="600" fill="white" fontFamily="sans-serif">AVIANCA</text>
    </svg>
  );
}

function TPLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#00956B" />
      <circle cx="16" cy="18" r="4" fill="#FF0000" opacity="0.9" />
      <circle cx="24" cy="18" r="4" fill="#00956B" stroke="white" strokeWidth="1" />
      <text x="20" y="31" textAnchor="middle" fontSize="5" fontWeight="700" fill="white" fontFamily="sans-serif">TAP</text>
    </svg>
  );
}

function LXLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#E2001A" />
      <path d="M16 14 L24 22 M24 14 L16 22" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <text x="20" y="33" textAnchor="middle" fontSize="5" fontWeight="700" fill="white" fontFamily="sans-serif">SWISS</text>
    </svg>
  );
}

function AYLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#0B1560" />
      <text x="20" y="22" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" fontFamily="sans-serif">FIN</text>
      <path d="M12 27 Q20 31 28 27" stroke="#0095DA" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SKLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#00205B" />
      <text x="20" y="23" textAnchor="middle" fontSize="10" fontWeight="800" fill="white" fontFamily="sans-serif">SAS</text>
    </svg>
  );
}

function OSLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#E2001A" />
      <path d="M12 16 L28 16" stroke="white" strokeWidth="2" />
      <path d="M12 20 L28 20" stroke="white" strokeWidth="2" />
      <path d="M12 24 L28 24" stroke="white" strokeWidth="2" />
      <text x="20" y="34" textAnchor="middle" fontSize="4.5" fontWeight="600" fill="white" fontFamily="sans-serif">AUSTRIAN</text>
    </svg>
  );
}

function SNLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full">
      <rect width="40" height="40" rx="20" fill="#003399" />
      <circle cx="16" cy="16" r="3.5" fill="#FFD700" />
      <circle cx="24" cy="16" r="3.5" fill="#FFD700" />
      <circle cx="16" cy="23" r="3.5" fill="#FFD700" />
      <circle cx="24" cy="23" r="3.5" fill="#FFD700" />
      <text x="20" y="35" textAnchor="middle" fontSize="4" fontWeight="600" fill="white" fontFamily="sans-serif">BRUSSELS</text>
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
  EK: EKLogo,
  QR: QRLogo,
  SQ: SQLogp,
  LH: LHLogo,
  CX: CXLogo,
  NH: NHLogo,
  JL: JLLogo,
  AC: ACLogo,
  AS: ASLogo,
  B6: B6Logo,
  WN: WNLogo,
  TK: TKLogo,
  IB: IBLogo,
  EY: EYLogo,
  KL: KLLogo,
  AV: AVLogo,
  TP: TPLogo,
  LX: LXLogo,
  AY: AYLogo,
  SK: SKLogo,
  OS: OSLogo,
  SN: SNLogo,
};

/* ── Public component ── */
export function AirlineLogo({
  code,
  color,
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

  /* Fallback: colored circle with airline code */
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold"
      style={{ width: size, height: size, backgroundColor: color || "#1a2744" }}
    >
      {code}
    </div>
  );
}
