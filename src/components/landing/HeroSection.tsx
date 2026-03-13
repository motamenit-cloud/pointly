export function HeroSection() {
  return (
    <section className="bg-cream pt-6 pb-16 md:pt-10 md:pb-20 lg:pt-10 lg:pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy leading-tight">
            No matter where you want to go,{" "}
            <span className="text-coral">Pointly</span> gets you there
          </h1>
          <div className="mt-6">
            <a
              href="#search"
              className="inline-block bg-navy text-white px-8 py-3.5 rounded-pill text-base font-semibold hover:bg-navy-dark transition-colors"
            >
              Get started
            </a>
          </div>
        </div>

        <div className="hidden md:flex justify-center lg:justify-end">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-xs lg:max-w-sm"
    >
      {/* Globe */}
      <circle cx="280" cy="180" r="120" fill="#D4ECFA" />
      <circle cx="280" cy="180" r="120" stroke="#B8DCF4" strokeWidth="3" />
      {/* Globe lines */}
      <ellipse
        cx="280"
        cy="180"
        rx="50"
        ry="120"
        stroke="#B8DCF4"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="160"
        y1="180"
        x2="400"
        y2="180"
        stroke="#B8DCF4"
        strokeWidth="2"
      />
      <ellipse
        cx="280"
        cy="140"
        rx="95"
        ry="30"
        stroke="#B8DCF4"
        strokeWidth="1.5"
        fill="none"
      />
      <ellipse
        cx="280"
        cy="220"
        rx="95"
        ry="30"
        stroke="#B8DCF4"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Continents simplified */}
      <path
        d="M240 130 C245 120, 260 115, 270 118 C280 121, 275 135, 265 140 C255 145, 235 140, 240 130Z"
        fill="#2A4F75"
        opacity="0.3"
      />
      <path
        d="M300 155 C310 148, 330 150, 335 160 C340 170, 330 185, 315 188 C300 191, 290 178, 295 168 C298 162, 300 155, 300 155Z"
        fill="#2A4F75"
        opacity="0.3"
      />
      <path
        d="M245 190 C250 185, 270 182, 280 190 C290 198, 285 215, 270 218 C255 221, 240 210, 242 200 C243 195, 245 190, 245 190Z"
        fill="#2A4F75"
        opacity="0.3"
      />

      {/* Person 1 — left (navy outfit) */}
      {/* Head */}
      <circle cx="140" cy="260" r="22" fill="#F5C5A3" />
      {/* Hair */}
      <path
        d="M120 255 C120 240, 135 230, 148 232 C160 234, 162 245, 162 252 C162 248, 155 238, 140 238 C125 238, 120 248, 120 255Z"
        fill="#1B3A5C"
      />
      {/* Body */}
      <path
        d="M120 280 C120 280, 118 320, 120 350 L160 350 C162 320, 160 280, 160 280 C160 275, 140 272, 140 272 C140 272, 120 275, 120 280Z"
        fill="#1B3A5C"
      />
      {/* Arms */}
      <path
        d="M120 290 C105 295, 95 310, 100 320"
        stroke="#1B3A5C"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M160 290 C175 285, 195 270, 200 260"
        stroke="#1B3A5C"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hand touching globe */}
      <circle cx="200" cy="258" r="6" fill="#F5C5A3" />
      {/* Legs */}
      <line
        x1="132"
        y1="350"
        x2="128"
        y2="390"
        stroke="#2A4F75"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1="148"
        y1="350"
        x2="152"
        y2="390"
        stroke="#2A4F75"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Shoes */}
      <rect x="120" y="386" width="16" height="8" rx="4" fill="#1B3A5C" />
      <rect x="146" y="386" width="16" height="8" rx="4" fill="#1B3A5C" />

      {/* Person 2 — right (coral outfit) */}
      {/* Head */}
      <circle cx="380" cy="250" r="22" fill="#F5C5A3" />
      {/* Hair */}
      <path
        d="M360 248 C358 230, 375 222, 390 224 C405 226, 405 240, 402 252 C400 240, 392 230, 380 230 C368 230, 362 240, 360 248Z"
        fill="#E87C3E"
      />
      {/* Long hair strands */}
      <path
        d="M362 252 C358 265, 356 280, 358 290"
        stroke="#E87C3E"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M400 248 C405 262, 408 278, 406 290"
        stroke="#E87C3E"
        strokeWidth="4"
        fill="none"
      />
      {/* Body */}
      <path
        d="M360 270 C360 270, 358 310, 360 345 L400 345 C402 310, 400 270, 400 270 C400 265, 380 262, 380 262 C380 262, 360 265, 360 270Z"
        fill="#E87C3E"
      />
      {/* Arms */}
      <path
        d="M360 280 C345 275, 330 265, 325 255"
        stroke="#E87C3E"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M400 285 C415 290, 425 300, 430 310"
        stroke="#E87C3E"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hand touching globe */}
      <circle cx="325" cy="253" r="6" fill="#F5C5A3" />
      {/* Legs */}
      <line
        x1="372"
        y1="345"
        x2="368"
        y2="385"
        stroke="#D06A2E"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1="388"
        y1="345"
        x2="392"
        y2="385"
        stroke="#D06A2E"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Shoes */}
      <rect x="360" y="381" width="16" height="8" rx="4" fill="#E87C3E" />
      <rect x="386" y="381" width="16" height="8" rx="4" fill="#E87C3E" />

      {/* Suitcase */}
      <rect x="420" y="350" width="40" height="45" rx="6" fill="#E87C3E" />
      <rect x="432" y="342" width="16" height="12" rx="3" fill="none" stroke="#D06A2E" strokeWidth="3" />
      <line
        x1="420"
        y1="370"
        x2="460"
        y2="370"
        stroke="#D06A2E"
        strokeWidth="2"
      />
      {/* Suitcase wheels */}
      <circle cx="428" cy="398" r="3" fill="#1B3A5C" />
      <circle cx="452" cy="398" r="3" fill="#1B3A5C" />
      {/* Suitcase handle */}
      <line
        x1="440"
        y1="345"
        x2="440"
        y2="330"
        stroke="#D06A2E"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
