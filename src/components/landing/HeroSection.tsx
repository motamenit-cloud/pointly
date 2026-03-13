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
      viewBox="0 0 720 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md lg:max-w-lg"
    >
      {/* ── Ground shadow ── */}
      <ellipse cx="360" cy="520" rx="260" ry="18" fill="#1B2A4A" opacity="0.06" />

      {/* ── Globe (centered, prominent) ── */}
      <circle cx="360" cy="230" r="155" fill="#C8DFF5" />
      {/* Globe grid lines */}
      <ellipse cx="360" cy="230" rx="155" ry="60" fill="none" stroke="#A8CCE8" strokeWidth="1.2" opacity="0.5" />
      <ellipse cx="360" cy="230" rx="155" ry="110" fill="none" stroke="#A8CCE8" strokeWidth="1.2" opacity="0.4" />
      <line x1="360" y1="75" x2="360" y2="385" stroke="#A8CCE8" strokeWidth="1.2" opacity="0.4" />
      <path d="M280 80 Q360 230 280 380" fill="none" stroke="#A8CCE8" strokeWidth="1.2" opacity="0.35" />
      <path d="M440 80 Q360 230 440 380" fill="none" stroke="#A8CCE8" strokeWidth="1.2" opacity="0.35" />
      {/* Continents */}
      <path
        d="M290 160 C305 140, 345 135, 370 155 C395 175, 400 210, 375 225 C350 240, 318 230, 300 210 C282 190, 280 175, 290 160Z"
        fill="#7DB5DA"
      />
      <path
        d="M370 260 C385 248, 425 245, 445 260 C465 278, 455 310, 430 322 C405 334, 378 318, 372 295 C368 275, 370 260, 370 260Z"
        fill="#7DB5DA"
      />
      <path
        d="M275 270 C288 260, 320 256, 335 268 C350 280, 342 305, 320 314 C298 323, 272 308, 272 290 C272 278, 275 270, 275 270Z"
        fill="#7DB5DA"
      />
      <path
        d="M395 145 C405 138, 430 140, 440 152 C450 164, 445 182, 430 188 C415 194, 395 184, 393 170 C391 156, 395 145, 395 145Z"
        fill="#7DB5DA"
      />
      {/* Globe shine */}
      <ellipse cx="310" cy="155" rx="35" ry="25" fill="white" opacity="0.2" transform="rotate(-20 310 155)" />

      {/* ── Small airplane circling the globe ── */}
      <g transform="translate(478, 135) rotate(25)">
        <path d="M0 0 L-12 -4 L-18 0 L-12 2 Z" fill="#E05A3A" />
        <path d="M-8 -1 L-14 -10 L-16 -9 L-11 -1Z" fill="#E05A3A" />
        <path d="M-14 1 L-18 6 L-19 5 L-16 1Z" fill="#E05A3A" />
      </g>
      {/* Airplane trail */}
      <path
        d="M480 140 Q520 170, 510 220 Q500 270, 460 300"
        fill="none"
        stroke="#E05A3A"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.4"
      />

      {/* ── Location pins on globe ── */}
      <g>
        <circle cx="310" cy="175" r="5" fill="#E05A3A" />
        <path d="M310 170 L310 162 L307 165 L310 162 L313 165Z" fill="#E05A3A" />
      </g>
      <g>
        <circle cx="420" cy="268" r="4" fill="#E05A3A" />
        <path d="M420 264 L420 257 L417.5 260 L420 257 L422.5 260Z" fill="#E05A3A" />
      </g>

      {/* ══════════════════════════════════════════ */}
      {/* ── Man (left side, facing right toward globe) ── */}
      {/* ══════════════════════════════════════════ */}

      {/* Head — tilted slightly right (toward globe) */}
      <ellipse cx="175" cy="225" rx="34" ry="36" fill="#F0C9A8" transform="rotate(5 175 225)" />
      {/* Hair — dark, short */}
      <path
        d="M142 218 C140 196, 158 180, 180 180 C200 180, 212 196, 210 212 C206 200, 195 190, 180 190 C162 190, 148 200, 142 218Z"
        fill="#1A1A2E"
      />
      {/* Ear */}
      <ellipse cx="144" cy="228" rx="6" ry="8" fill="#E4B898" />
      {/* Eye — looking right */}
      <circle cx="186" cy="222" r="3" fill="#1A1A2E" />
      <circle cx="187" cy="221" r="1" fill="white" />
      {/* Eyebrow */}
      <path d="M182 216 Q187 213 192 215" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Subtle smile */}
      <path d="M180 236 Q185 240 192 238" stroke="#C4947A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Neck */}
      <rect x="165" y="256" width="22" height="14" rx="4" fill="#F0C9A8" />

      {/* Torso — navy sweater, angled right */}
      <path
        d="M130 270 C130 266, 155 258, 176 258 C197 258, 222 266, 222 270 L228 385 L124 385Z"
        fill="#1B2A4A"
      />
      {/* Collar V */}
      <path d="M164 270 L176 285 L188 270" fill="none" stroke="#2A4068" strokeWidth="2" />

      {/* Left arm — relaxed at side */}
      <path
        d="M130 280 C115 295, 108 330, 112 360"
        stroke="#1B2A4A"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="114" cy="364" rx="10" ry="9" fill="#F0C9A8" />

      {/* Right arm — reaching up to touch globe */}
      <path
        d="M222 280 C240 268, 258 248, 270 232"
        stroke="#1B2A4A"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right hand on globe */}
      <ellipse cx="274" cy="228" rx="11" ry="10" fill="#F0C9A8" />

      {/* Left leg — blue jeans */}
      <path
        d="M140 385 L130 490 C130 495, 136 500, 145 500 L158 500 C164 500, 168 495, 166 490 L160 385Z"
        fill="#3B6FD4"
      />
      {/* Right leg */}
      <path
        d="M166 385 L178 490 C178 495, 183 500, 190 500 L202 500 C208 500, 210 495, 208 490 L200 385Z"
        fill="#3B6FD4"
      />
      {/* Left shoe */}
      <path
        d="M124 492 C120 492, 114 496, 114 501 C114 508, 122 512, 132 512 L160 512 C165 512, 168 508, 166 503 L164 496 L132 496Z"
        fill="#E84545"
      />
      {/* Right shoe */}
      <path
        d="M176 492 C172 492, 166 496, 166 501 C166 508, 174 512, 184 512 L208 512 C213 512, 215 508, 213 503 L212 496 L182 496Z"
        fill="#E84545"
      />

      {/* ══════════════════════════════════════════ */}
      {/* ── Woman (right side, facing left toward globe) ── */}
      {/* ══════════════════════════════════════════ */}

      {/* Hair — long, flowing left (behind head) */}
      <path
        d="M528 195 C522 210, 516 250, 518 300 C518 320, 522 340, 524 350 L534 348 C532 330, 527 305, 528 280 C530 250, 533 215, 535 200Z"
        fill="#E05A3A"
      />
      <path
        d="M568 200 C574 215, 578 245, 578 280 C578 310, 576 335, 574 348 L564 346 C566 325, 570 300, 568 275 C566 245, 562 215, 558 200Z"
        fill="#E05A3A"
      />

      {/* Hat — wide brim */}
      <ellipse cx="548" cy="188" rx="46" ry="11" fill="#1B2A4A" />
      <path
        d="M520 188 C520 162, 534 148, 548 148 C562 148, 576 162, 576 188Z"
        fill="#1B2A4A"
      />
      {/* Hat band */}
      <rect x="520" y="183" width="56" height="5" rx="2" fill="#E05A3A" />

      {/* Head — tilted slightly left (toward globe) */}
      <ellipse cx="548" cy="208" rx="30" ry="32" fill="#F0C9A8" transform="rotate(-5 548 208)" />
      {/* Ear (behind hair a bit) */}
      <ellipse cx="576" cy="210" rx="5" ry="7" fill="#E4B898" />
      {/* Eye — looking left */}
      <circle cx="538" cy="205" r="3" fill="#1A1A2E" />
      <circle cx="537" cy="204" r="1" fill="white" />
      {/* Eyebrow */}
      <path d="M532 198 Q537 195 542 197" stroke="#1A1A2E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Smile */}
      <path d="M534 220 Q540 224 548 222" stroke="#C4947A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Neck */}
      <rect x="538" y="236" width="20" height="12" rx="4" fill="#F0C9A8" />

      {/* Torso — coral/rust top */}
      <path
        d="M506 248 C506 244, 528 238, 548 238 C568 238, 590 244, 590 248 L588 370 L508 370Z"
        fill="#D4614E"
      />
      {/* Neckline */}
      <path d="M530 250 Q548 262 566 250" fill="none" stroke="#C4524A" strokeWidth="2" />

      {/* Left arm — reaching up to touch globe */}
      <path
        d="M506 260 C488 248, 470 232, 456 218"
        stroke="#D4614E"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left hand on globe */}
      <ellipse cx="452" cy="214" rx="10" ry="9" fill="#F0C9A8" />

      {/* Right arm — holding suitcase handle */}
      <path
        d="M590 265 C605 275, 618 300, 620 330"
        stroke="#D4614E"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="622" cy="334" rx="9" ry="8" fill="#F0C9A8" />

      {/* Left leg — cream/khaki pants */}
      <path
        d="M516 370 L508 490 C508 495, 514 500, 522 500 L534 500 C540 500, 544 495, 542 490 L538 370Z"
        fill="#F0EDE6"
      />
      {/* Right leg */}
      <path
        d="M544 370 L555 490 C555 495, 560 500, 567 500 L578 500 C584 500, 587 495, 585 490 L580 370Z"
        fill="#F0EDE6"
      />
      {/* Left shoe */}
      <path
        d="M502 492 C498 492, 492 496, 492 501 C492 508, 500 512, 510 512 L536 512 C541 512, 544 508, 542 503 L540 496 L510 496Z"
        fill="#1B2A4A"
      />
      {/* Right shoe */}
      <path
        d="M552 492 C548 492, 542 496, 542 501 C542 508, 550 512, 560 512 L584 512 C589 512, 591 508, 589 503 L588 496 L558 496Z"
        fill="#1B2A4A"
      />

      {/* ══════════════════════════════════════════ */}
      {/* ── Suitcase (right side, beside woman) ── */}
      {/* ══════════════════════════════════════════ */}

      {/* Handle poles */}
      <rect x="632" y="310" width="5" height="50" rx="2.5" fill="#8FABC4" />
      <rect x="653" y="310" width="5" height="50" rx="2.5" fill="#8FABC4" />
      {/* Handle grip */}
      <rect x="628" y="302" width="34" height="12" rx="6" fill="#8FABC4" />

      {/* Main body */}
      <rect x="618" y="360" width="56" height="110" rx="10" fill="#1B2A4A" />
      {/* Stripe */}
      <rect x="618" y="405" width="56" height="3.5" fill="#2A4068" />
      {/* Lock */}
      <circle cx="646" cy="425" r="7" fill="#5B8BC4" />
      <circle cx="646" cy="425" r="3.5" fill="#1B2A4A" />
      {/* Tag */}
      <rect x="675" y="388" width="12" height="18" rx="3" fill="#5B8BC4" />
      <path d="M678 388 L678 383 L684 383 L684 388" stroke="#5B8BC4" strokeWidth="1.5" fill="none" />

      {/* Wheels */}
      <circle cx="632" cy="476" r="6" fill="#2A4068" />
      <circle cx="632" cy="476" r="2.5" fill="#1B2A4A" />
      <circle cx="662" cy="476" r="6" fill="#2A4068" />
      <circle cx="662" cy="476" r="2.5" fill="#1B2A4A" />

      {/* ── Decorative dots (travel vibes) ── */}
      <circle cx="100" cy="150" r="3" fill="#C8DFF5" opacity="0.6" />
      <circle cx="80" cy="300" r="4" fill="#C8DFF5" opacity="0.4" />
      <circle cx="650" cy="140" r="3" fill="#C8DFF5" opacity="0.5" />
      <circle cx="690" cy="220" r="4" fill="#C8DFF5" opacity="0.4" />
      <circle cx="60" cy="420" r="3" fill="#C8DFF5" opacity="0.3" />
    </svg>
  );
}
