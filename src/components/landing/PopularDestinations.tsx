import { ScrollClouds } from "@/components/ui/ScrollClouds";

const destinations = [
  {
    name: "Paris, France",
    points: "25,000",
    scene: "paris" as const,
  },
  {
    name: "Tokyo, Japan",
    points: "38,000",
    scene: "tokyo" as const,
  },
  {
    name: "Amalfi Coast, Italy",
    points: "31,500",
    scene: "amalfi" as const,
  },
];

function ParisScene() {
  return (
    <svg viewBox="0 0 300 400" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Sky gradient — warm golden sunset */}
      <defs>
        <linearGradient id="paris-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7EBCE6" />
          <stop offset="40%" stopColor="#F8C97C" />
          <stop offset="70%" stopColor="#F4A261" />
          <stop offset="100%" stopColor="#E8935A" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#paris-sky)" />

      {/* Wispy clouds */}
      <ellipse cx="60" cy="50" rx="45" ry="12" fill="white" opacity="0.4" />
      <ellipse cx="220" cy="35" rx="35" ry="10" fill="white" opacity="0.3" />
      <ellipse cx="260" cy="65" rx="28" ry="8" fill="white" opacity="0.25" />

      {/* Distant buildings left skyline */}
      <rect x="0" y="200" width="22" height="130" fill="#C47A3A" opacity="0.5" />
      <rect x="18" y="215" width="18" height="115" fill="#B06830" opacity="0.5" />
      <rect x="32" y="195" width="20" height="135" fill="#C47A3A" opacity="0.45" />

      {/* Distant buildings right skyline */}
      <rect x="248" y="205" width="20" height="125" fill="#C47A3A" opacity="0.5" />
      <rect x="265" y="190" width="18" height="140" fill="#B06830" opacity="0.45" />
      <rect x="280" y="210" width="20" height="120" fill="#C47A3A" opacity="0.5" />

      {/* === EIFFEL TOWER === */}
      {/* Main tower body — tapered shape */}
      <polygon points="150,55 138,190 162,190" fill="#D4872E" />
      <polygon points="138,190 126,310 174,310 162,190" fill="#C47A28" />
      <polygon points="126,310 118,370 182,370 174,310" fill="#B06D22" />

      {/* Tower lattice details — horizontal platforms */}
      <rect x="143" y="100" width="14" height="4" rx="1" fill="#A06020" />
      <rect x="139" y="130" width="22" height="5" rx="1.5" fill="#A06020" />
      {/* Observation deck 1 */}
      <rect x="130" y="188" width="40" height="7" rx="2" fill="#A06020" />
      <rect x="127" y="185" width="46" height="5" rx="2" fill="#C47A28" />
      {/* Observation deck 2 */}
      <rect x="121" y="308" width="58" height="7" rx="2" fill="#9A5A1A" />
      <rect x="118" y="305" width="64" height="5" rx="2" fill="#B06D22" />

      {/* Tower arches at base */}
      <path d="M126 370 Q150 340 174 370" fill="url(#paris-sky)" />

      {/* Tower lattice cross-hatching */}
      <line x1="142" y1="140" x2="158" y2="180" stroke="#A06020" strokeWidth="1" opacity="0.5" />
      <line x1="158" y1="140" x2="142" y2="180" stroke="#A06020" strokeWidth="1" opacity="0.5" />
      <line x1="135" y1="210" x2="165" y2="280" stroke="#9A5A1A" strokeWidth="1" opacity="0.4" />
      <line x1="165" y1="210" x2="135" y2="280" stroke="#9A5A1A" strokeWidth="1" opacity="0.4" />
      <line x1="128" y1="320" x2="172" y2="360" stroke="#9A5A1A" strokeWidth="1" opacity="0.4" />
      <line x1="172" y1="320" x2="128" y2="360" stroke="#9A5A1A" strokeWidth="1" opacity="0.4" />

      {/* Antenna/spire */}
      <line x1="150" y1="55" x2="150" y2="30" stroke="#C47A28" strokeWidth="2.5" />
      <circle cx="150" cy="28" r="2" fill="#D4872E" />

      {/* === RIVER SEINE === */}
      <rect x="0" y="330" width="300" height="70" fill="#5A9EC8" opacity="0.6" />
      <path d="M0 340 Q40 335 80 342 Q120 348 160 340 Q200 332 240 340 Q270 345 300 338" stroke="#7CB8D8" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M0 355 Q50 350 100 358 Q150 365 200 355 Q250 348 300 356" stroke="#7CB8D8" strokeWidth="1" fill="none" opacity="0.4" />

      {/* === BRIDGE === */}
      <rect x="10" y="325" width="280" height="12" rx="2" fill="#C4956A" />
      {/* Bridge arches */}
      <path d="M30 337 Q55 352 80 337" fill="#5A9EC8" opacity="0.5" />
      <path d="M90 337 Q115 352 140 337" fill="#5A9EC8" opacity="0.5" />
      <path d="M150 337 Q175 352 200 337" fill="#5A9EC8" opacity="0.5" />
      <path d="M210 337 Q235 352 260 337" fill="#5A9EC8" opacity="0.5" />
      {/* Bridge railing */}
      <rect x="10" y="322" width="280" height="4" rx="1" fill="#D4A878" />
      {/* Bridge pillars */}
      <rect x="28" y="322" width="4" height="16" fill="#B88A60" />
      <rect x="88" y="322" width="4" height="16" fill="#B88A60" />
      <rect x="148" y="322" width="4" height="16" fill="#B88A60" />
      <rect x="208" y="322" width="4" height="16" fill="#B88A60" />
      <rect x="268" y="322" width="4" height="16" fill="#B88A60" />

      {/* Street lamps on bridge */}
      <line x1="58" y1="322" x2="58" y2="306" stroke="#7A6040" strokeWidth="2" />
      <circle cx="58" cy="304" r="4" fill="#FFE4A0" opacity="0.9" />
      <circle cx="58" cy="304" r="7" fill="#FFE4A0" opacity="0.3" />
      <line x1="178" y1="322" x2="178" y2="306" stroke="#7A6040" strokeWidth="2" />
      <circle cx="178" cy="304" r="4" fill="#FFE4A0" opacity="0.9" />
      <circle cx="178" cy="304" r="7" fill="#FFE4A0" opacity="0.3" />

      {/* === AUTUMN TREES === */}
      {/* Left tree cluster */}
      <rect x="30" y="280" width="5" height="45" fill="#6B4226" />
      <circle cx="32" cy="270" r="18" fill="#D4602E" opacity="0.85" />
      <circle cx="22" cy="278" r="14" fill="#E87C3E" opacity="0.7" />
      <circle cx="42" cy="276" r="12" fill="#C75030" opacity="0.75" />
      <circle cx="30" cy="260" r="10" fill="#F09A64" opacity="0.7" />

      {/* Right tree cluster */}
      <rect x="252" y="285" width="5" height="40" fill="#6B4226" />
      <circle cx="254" cy="275" r="16" fill="#D4602E" opacity="0.8" />
      <circle cx="244" cy="280" r="12" fill="#E87C3E" opacity="0.7" />
      <circle cx="264" cy="278" r="11" fill="#C75030" opacity="0.75" />

      {/* Small tree right of tower */}
      <rect x="195" y="300" width="4" height="25" fill="#6B4226" />
      <circle cx="197" cy="292" r="12" fill="#E87C3E" opacity="0.8" />
      <circle cx="190" cy="298" r="9" fill="#F09A64" opacity="0.65" />

      {/* Foreground ground/path */}
      <rect x="0" y="370" width="300" height="30" fill="#D4A060" opacity="0.4" />

      {/* Left foreground buildings */}
      <rect x="0" y="250" width="18" height="80" fill="#C47A3A" opacity="0.7" />
      <rect x="5" y="260" width="4" height="6" fill="#FFE4A0" opacity="0.6" />
      <rect x="10" y="260" width="4" height="6" fill="#FFE4A0" opacity="0.6" />
      <rect x="5" y="272" width="4" height="6" fill="#FFE4A0" opacity="0.6" />
      <rect x="10" y="272" width="4" height="6" fill="#FFE4A0" opacity="0.6" />

      {/* Right foreground buildings */}
      <rect x="280" y="255" width="20" height="75" fill="#C47A3A" opacity="0.7" />
      <rect x="285" y="265" width="4" height="6" fill="#FFE4A0" opacity="0.6" />
      <rect x="291" y="265" width="4" height="6" fill="#FFE4A0" opacity="0.6" />
      <rect x="285" y="277" width="4" height="6" fill="#FFE4A0" opacity="0.6" />
    </svg>
  );
}

function TokyoScene() {
  return (
    <svg viewBox="0 0 300 400" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Sky gradient — soft peachy warm sky */}
      <defs>
        <linearGradient id="tokyo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8E0F0" />
          <stop offset="35%" stopColor="#E8D8C8" />
          <stop offset="65%" stopColor="#F0D8B0" />
          <stop offset="100%" stopColor="#E8C8A0" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#tokyo-sky)" />

      {/* Distant mountains */}
      <polygon points="0,180 60,120 120,180" fill="#8EB89C" opacity="0.35" />
      <polygon points="80,180 160,100 240,180" fill="#7AA88C" opacity="0.3" />
      <polygon points="180,180 260,110 300,160 300,180" fill="#8EB89C" opacity="0.3" />

      {/* Wispy clouds */}
      <ellipse cx="50" cy="45" rx="35" ry="8" fill="white" opacity="0.5" />
      <ellipse cx="240" cy="55" rx="40" ry="9" fill="white" opacity="0.4" />
      <ellipse cx="160" cy="30" rx="25" ry="6" fill="white" opacity="0.35" />

      {/* === LAYERED FOLIAGE BEHIND PAGODA === */}
      {/* Back layer — darkest green, rounded hedge shapes */}
      <ellipse cx="60" cy="310" rx="55" ry="45" fill="#2D5A3A" opacity="0.9" />
      <ellipse cx="150" cy="300" rx="50" ry="40" fill="#2D5A3A" opacity="0.85" />
      <ellipse cx="240" cy="310" rx="55" ry="45" fill="#2D5A3A" opacity="0.9" />
      <ellipse cx="100" cy="290" rx="45" ry="35" fill="#336644" opacity="0.8" />
      <ellipse cx="200" cy="290" rx="45" ry="35" fill="#336644" opacity="0.8" />

      {/* Mid-layer foliage — medium green */}
      <ellipse cx="40" cy="330" rx="45" ry="35" fill="#3D7A4A" opacity="0.9" />
      <ellipse cx="120" cy="325" rx="50" ry="38" fill="#3D7A4A" opacity="0.85" />
      <ellipse cx="200" cy="330" rx="48" ry="36" fill="#3D7A4A" opacity="0.9" />
      <ellipse cx="270" cy="335" rx="42" ry="32" fill="#3D7A4A" opacity="0.85" />

      {/* === PAGODA TOWER (5 tiers) === */}
      {/* Main body — warm red-orange */}
      <rect x="120" y="95" width="60" height="250" fill="#C83C2E" />
      <rect x="125" y="95" width="50" height="250" fill="#D44A38" />

      {/* Tier 5 — top (smallest) */}
      <polygon points="110,98 190,98 150,78" fill="#8B2020" />
      <path d="M105,98 Q115,105 120,98" fill="#8B2020" />
      <path d="M180,98 Q185,105 195,98" fill="#8B2020" />
      <rect x="115" y="98" width="70" height="4" fill="#7A1A1A" />

      {/* Tier 4 */}
      <polygon points="105,148 195,148 150,130" fill="#8B2020" />
      <path d="M98,148 Q108,156 115,148" fill="#8B2020" />
      <path d="M185,148 Q192,156 202,148" fill="#8B2020" />
      <rect x="108" y="148" width="84" height="4" fill="#7A1A1A" />

      {/* Tier 3 */}
      <polygon points="100,198 200,198 150,178" fill="#8B2020" />
      <path d="M92,198 Q102,207 110,198" fill="#8B2020" />
      <path d="M190,198 Q198,207 208,198" fill="#8B2020" />
      <rect x="102" y="198" width="96" height="4" fill="#7A1A1A" />

      {/* Tier 2 */}
      <polygon points="95,252 205,252 150,232" fill="#8B2020" />
      <path d="M87,252 Q97,262 105,252" fill="#8B2020" />
      <path d="M195,252 Q203,262 213,252" fill="#8B2020" />
      <rect x="97" y="252" width="106" height="4" fill="#7A1A1A" />

      {/* Tier 1 — base (largest) */}
      <polygon points="88,310 212,310 150,288" fill="#8B2020" />
      <path d="M80,310 Q90,322 100,310" fill="#8B2020" />
      <path d="M200,310 Q210,322 220,310" fill="#8B2020" />
      <rect x="90" y="310" width="120" height="5" fill="#7A1A1A" />

      {/* Pagoda windows / doorways */}
      <rect x="140" y="105" width="20" height="28" rx="10" fill="#5A1818" opacity="0.7" />
      <rect x="137" y="155" width="26" height="30" rx="13" fill="#5A1818" opacity="0.7" />
      <rect x="135" y="205" width="30" height="32" rx="15" fill="#5A1818" opacity="0.7" />
      <rect x="132" y="260" width="36" height="18" rx="9" fill="#5A1818" opacity="0.7" />

      {/* Spire / finial at top */}
      <line x1="150" y1="78" x2="150" y2="42" stroke="#C83C2E" strokeWidth="3" />
      <circle cx="150" cy="40" r="4" fill="#FFD166" />
      <line x1="150" y1="42" x2="150" y2="50" stroke="#8B2020" strokeWidth="4" />
      <rect x="146" y="52" width="8" height="4" fill="#C83C2E" />
      <rect x="144" y="56" width="12" height="3" fill="#8B2020" />

      {/* === FRONT FOLIAGE LAYER === */}
      {/* Orange/autumn accents in foliage */}
      <ellipse cx="70" cy="350" rx="40" ry="28" fill="#4A8A55" opacity="0.9" />
      <ellipse cx="230" cy="350" rx="40" ry="28" fill="#4A8A55" opacity="0.9" />
      <ellipse cx="150" cy="360" rx="35" ry="22" fill="#4A8A55" opacity="0.85" />
      <ellipse cx="30" cy="355" rx="35" ry="25" fill="#3D7A4A" opacity="0.9" />
      <ellipse cx="275" cy="355" rx="30" ry="25" fill="#3D7A4A" opacity="0.9" />

      {/* Orange maple accent clusters */}
      <circle cx="80" cy="295" r="8" fill="#E87C3E" opacity="0.7" />
      <circle cx="220" cy="300" r="7" fill="#E87C3E" opacity="0.65" />
      <circle cx="55" cy="310" r="6" fill="#D4602E" opacity="0.6" />
      <circle cx="245" cy="310" r="6" fill="#D4602E" opacity="0.6" />

      {/* Decorative plant / bonsai in foreground */}
      <rect x="145" y="348" width="10" height="20" fill="#6B4226" />
      <circle cx="150" cy="340" r="14" fill="#336644" opacity="0.9" />
      <circle cx="142" cy="336" r="8" fill="#4A8A55" opacity="0.8" />
      <circle cx="158" cy="336" r="8" fill="#3D7A4A" opacity="0.8" />

      {/* Ground */}
      <rect x="0" y="375" width="300" height="25" fill="#4A8A55" opacity="0.5" />
      <rect x="0" y="385" width="300" height="15" fill="#3D7A4A" opacity="0.4" />
    </svg>
  );
}

function AmalfiScene() {
  return (
    <svg viewBox="0 0 300 400" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Sky gradient — bright Mediterranean blue */}
      <defs>
        <linearGradient id="amalfi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5AAFE0" />
          <stop offset="40%" stopColor="#70C0EC" />
          <stop offset="100%" stopColor="#90D4F4" />
        </linearGradient>
        <linearGradient id="amalfi-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3AA0D4" />
          <stop offset="50%" stopColor="#2890C8" />
          <stop offset="100%" stopColor="#1E80B8" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#amalfi-sky)" />

      {/* Wispy clouds */}
      <ellipse cx="220" cy="35" rx="40" ry="10" fill="white" opacity="0.6" />
      <ellipse cx="80" cy="50" rx="30" ry="7" fill="white" opacity="0.45" />
      <ellipse cx="260" cy="60" rx="25" ry="6" fill="white" opacity="0.4" />

      {/* === GREEN MOUNTAINS / CLIFFS === */}
      <polygon points="0,180 50,100 110,140 170,90 230,130 280,95 300,120 300,280 0,280" fill="#4A8A55" />
      <polygon points="0,200 60,140 120,170 180,120 240,160 300,140 300,280 0,280" fill="#3D7A4A" opacity="0.8" />
      <polygon points="0,220 40,180 100,200 150,160 200,190 260,170 300,185 300,280 0,280" fill="#336644" opacity="0.7" />

      {/* === TERRACED BUILDINGS ON HILLSIDE === */}
      {/* Row 1 — Topmost buildings (smallest, highest) */}
      <rect x="108" y="138" width="22" height="30" fill="#FFF5E6" />
      <rect x="108" y="133" width="22" height="7" rx="1" fill="#E87C3E" />
      <rect x="112" y="146" width="5" height="7" fill="#6AAFC8" opacity="0.7" />
      <rect x="121" y="146" width="5" height="7" fill="#6AAFC8" opacity="0.7" />

      <rect x="135" y="128" width="24" height="38" fill="#FFE4B5" />
      <rect x="135" y="123" width="24" height="7" rx="1" fill="#C75050" />
      <rect x="139" y="136" width="5" height="7" fill="#6AAFC8" opacity="0.7" />
      <rect x="150" y="136" width="5" height="7" fill="#6AAFC8" opacity="0.7" />
      <rect x="139" y="148" width="5" height="7" fill="#6AAFC8" opacity="0.7" />
      <rect x="150" y="148" width="5" height="7" fill="#6AAFC8" opacity="0.7" />

      <rect x="164" y="135" width="20" height="32" fill="#FFC8C8" />
      <rect x="164" y="130" width="20" height="7" rx="1" fill="#E87C3E" />
      <rect x="168" y="143" width="5" height="6" fill="#6AAFC8" opacity="0.7" />
      <rect x="175" y="143" width="5" height="6" fill="#6AAFC8" opacity="0.7" />

      {/* Row 2 — Middle buildings */}
      <rect x="60" y="178" width="26" height="42" fill="#FFF5E6" />
      <rect x="60" y="173" width="26" height="7" rx="1" fill="#E8A050" />
      <rect x="64" y="186" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="76" y="186" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="64" y="200" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="90" y="170" width="28" height="50" fill="#FFE4B5" />
      <rect x="90" y="165" width="28" height="7" rx="1" fill="#C75050" />
      <rect x="94" y="178" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="108" y="178" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="94" y="192" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="108" y="192" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="122" y="168" width="30" height="52" fill="#FFF5E6" />
      <rect x="122" y="163" width="30" height="7" rx="1" fill="#E87C3E" />
      <rect x="126" y="176" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="140" y="176" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="126" y="190" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="140" y="190" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="156" y="167" width="26" height="50" fill="#FFD4A0" />
      <rect x="156" y="162" width="26" height="7" rx="1" fill="#FFD166" />
      <rect x="160" y="175" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="172" y="175" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="160" y="189" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="186" y="172" width="28" height="48" fill="#FFC8C8" />
      <rect x="186" y="167" width="28" height="7" rx="1" fill="#C75050" />
      <rect x="190" y="180" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="204" y="180" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="190" y="194" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="218" y="178" width="24" height="42" fill="#FFF5E6" />
      <rect x="218" y="173" width="24" height="7" rx="1" fill="#E87C3E" />
      <rect x="222" y="186" width="5" height="7" fill="#6AAFC8" opacity="0.7" />
      <rect x="233" y="186" width="5" height="7" fill="#6AAFC8" opacity="0.7" />

      {/* Row 3 — Lower buildings near waterline */}
      <rect x="25" y="220" width="30" height="50" fill="#FFE4B5" />
      <rect x="25" y="215" width="30" height="7" rx="1" fill="#C75050" />
      <rect x="30" y="228" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="42" y="228" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="30" y="242" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="42" y="242" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="58" y="220" width="32" height="50" fill="#FFF5E6" />
      <rect x="58" y="215" width="32" height="7" rx="1" fill="#E87C3E" />
      <rect x="62" y="228" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="78" y="228" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="62" y="242" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="94" y="222" width="28" height="48" fill="#FFC8C8" />
      <rect x="94" y="217" width="28" height="7" rx="1" fill="#FFD166" />
      <rect x="98" y="230" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="112" y="230" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="98" y="244" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="126" y="220" width="30" height="50" fill="#FFE4B5" />
      <rect x="126" y="215" width="30" height="7" rx="1" fill="#C75050" />
      <rect x="130" y="228" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="144" y="228" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="160" y="218" width="28" height="52" fill="#FFF5E6" />
      <rect x="160" y="213" width="28" height="7" rx="1" fill="#E87C3E" />
      <rect x="164" y="226" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="178" y="226" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="164" y="240" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="192" y="220" width="26" height="50" fill="#FFD4A0" />
      <rect x="192" y="215" width="26" height="7" rx="1" fill="#E8A050" />
      <rect x="196" y="228" width="5" height="7" fill="#6AAFC8" opacity="0.7" />
      <rect x="208" y="228" width="5" height="7" fill="#6AAFC8" opacity="0.7" />

      <rect x="222" y="222" width="28" height="48" fill="#FFC8C8" />
      <rect x="222" y="217" width="28" height="7" rx="1" fill="#C75050" />
      <rect x="226" y="230" width="6" height="8" fill="#6AAFC8" opacity="0.7" />
      <rect x="240" y="230" width="6" height="8" fill="#6AAFC8" opacity="0.7" />

      <rect x="254" y="225" width="24" height="45" fill="#FFF5E6" />
      <rect x="254" y="220" width="24" height="7" rx="1" fill="#E87C3E" />
      <rect x="258" y="233" width="5" height="7" fill="#6AAFC8" opacity="0.7" />

      {/* Church dome / bell tower accent */}
      <path d="M140 160 Q150 145 160 160" fill="#FFE4B5" />
      <line x1="150" y1="145" x2="150" y2="135" stroke="#7A6040" strokeWidth="1.5" />
      <circle cx="150" cy="133" r="2" fill="#FFD166" />

      {/* === ROCKY COAST / CLIFFS AT WATERLINE === */}
      <path d="M0 270 L25 265 L55 270 L90 268 L125 270 L160 266 L195 270 L230 268 L260 270 L280 267 L300 270 L300 280 L0 280 Z" fill="#8A7A60" opacity="0.6" />
      <path d="M0 273 Q20 268 40 274 Q60 278 80 273 Q100 268 120 274 Q140 278 160 273 Q180 268 200 274 Q220 278 240 273 Q260 268 280 274 Q290 276 300 273 L300 280 L0 280 Z" fill="#A08E70" opacity="0.5" />

      {/* === TURQUOISE SEA === */}
      <rect x="0" y="278" width="300" height="122" fill="url(#amalfi-sea)" />

      {/* Water wave highlights */}
      <path d="M0 290 Q30 285 60 292 Q90 298 120 290 Q150 284 180 292 Q210 298 240 290 Q270 284 300 290" stroke="white" strokeWidth="1" fill="none" opacity="0.25" />
      <path d="M0 310 Q40 305 80 312 Q120 318 160 310 Q200 304 240 312 Q270 317 300 310" stroke="white" strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M0 330 Q35 325 70 332 Q105 338 140 330 Q175 324 210 332 Q245 337 280 330 Q290 328 300 332" stroke="white" strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M0 350 Q50 345 100 352 Q150 358 200 350 Q250 344 300 352" stroke="white" strokeWidth="0.8" fill="none" opacity="0.15" />

      {/* Sun reflection on water */}
      <ellipse cx="150" cy="300" rx="25" ry="4" fill="white" opacity="0.15" />
      <ellipse cx="150" cy="320" rx="15" ry="3" fill="white" opacity="0.1" />

      {/* === SMALL SAILBOAT === */}
      <path d="M210 340 Q220 350 230 340" fill="#FFF8F0" stroke="#D4D4D4" strokeWidth="0.5" />
      <line x1="220" y1="340" x2="220" y2="322" stroke="#7A6040" strokeWidth="1.2" />
      <polygon points="220,322 220,335 232,332" fill="#FFF8F0" opacity="0.9" />

      {/* Small boat 2 */}
      <path d="M65 360 Q72 367 79 360" fill="#FFF8F0" stroke="#D4D4D4" strokeWidth="0.5" />
      <line x1="72" y1="360" x2="72" y2="348" stroke="#7A6040" strokeWidth="1" />
      <polygon points="72,348 72,358 80,356" fill="#E8F4FD" opacity="0.8" />

      {/* Vegetation / trees on cliffs */}
      <circle cx="15" cy="255" r="10" fill="#4A8A55" opacity="0.8" />
      <circle cx="30" cy="260" r="8" fill="#3D7A4A" opacity="0.7" />
      <circle cx="270" cy="258" r="9" fill="#4A8A55" opacity="0.75" />
      <circle cx="285" cy="262" r="7" fill="#3D7A4A" opacity="0.7" />
    </svg>
  );
}

const sceneComponents = {
  paris: ParisScene,
  tokyo: TokyoScene,
  amalfi: AmalfiScene,
};

export function PopularDestinations() {
  return (
    <section className="relative bg-sky-light py-20 md:py-28 overflow-hidden">
      <ScrollClouds />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">
            Popular Destinations
          </h2>
          <p className="mt-3 text-text-secondary text-lg">
            Where your points can take you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {destinations.map((dest) => {
            const SceneComponent = sceneComponents[dest.scene];
            return (
              <div key={dest.name} className="group cursor-pointer">
                {/* Airplane window — oval shape using SVG clip + layered frames */}
                <div className="relative flex justify-center">
                  <svg viewBox="0 0 280 340" className="w-full max-w-[280px] drop-shadow-lg group-hover:drop-shadow-xl transition-all">
                    <defs>
                      {/* Oval clip for the scene — matches inner dark ring exactly */}
                      <clipPath id={`window-clip-${dest.scene}`}>
                        <ellipse cx="140" cy="170" rx="104" ry="129" />
                      </clipPath>
                      {/* Gradient for outer frame */}
                      <linearGradient id={`frame-grad-${dest.scene}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D0D8E0" />
                        <stop offset="50%" stopColor="#B8C2CC" />
                        <stop offset="100%" stopColor="#A8B2BC" />
                      </linearGradient>
                      {/* Gradient for inner bezel */}
                      <linearGradient id={`bezel-grad-${dest.scene}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C8D0D8" />
                        <stop offset="100%" stopColor="#9AA4AE" />
                      </linearGradient>
                    </defs>

                    {/* Outer frame — thick gray oval */}
                    <ellipse cx="140" cy="170" rx="130" ry="160" fill={`url(#frame-grad-${dest.scene})`} />

                    {/* Inner bezel ring */}
                    <ellipse cx="140" cy="170" rx="112" ry="138" fill={`url(#bezel-grad-${dest.scene})`} />

                    {/* Inner dark ring (recess shadow) */}
                    <ellipse cx="140" cy="170" rx="104" ry="129" fill="#8892A0" />

                    {/* Scene viewport — clipped to oval, covers full dark ring area */}
                    <g clipPath={`url(#window-clip-${dest.scene})`}>
                      <rect x="36" y="41" width="208" height="258" fill="#E8F4FD" />
                      <foreignObject x="36" y="41" width="208" height="258">
                        <div style={{ width: "100%", height: "100%" }}>
                          <SceneComponent />
                        </div>
                      </foreignObject>
                    </g>

                    {/* Glass reflection */}
                    <ellipse cx="120" cy="130" rx="60" ry="70" fill="white" opacity="0.08" />

                    {/* Inner shadow on glass edge */}
                    <ellipse cx="140" cy="170" rx="104" ry="129" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />

                    {/* Window shade handle at top */}
                    <rect x="115" y="52" width="50" height="12" rx="6" fill="#B8C2CC" />
                    <rect x="118" y="54" width="44" height="8" rx="4" fill="#C8D0D8" />
                  </svg>
                </div>

                {/* Text below window */}
                <div className="mt-5 text-center">
                  <h3 className="text-lg font-bold text-navy">
                    {dest.name}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    From {dest.points} points
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
