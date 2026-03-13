"use client";

import { useEffect, useRef } from "react";

/**
 * Puffy cumulus cloud shapes with shadow depth.
 * Each variant has pronounced round bumps along the top and a flat bottom.
 */
function CloudShape({
  variant,
  className,
  shadow = false,
}: {
  variant: number;
  className?: string;
  shadow?: boolean;
}) {
  const paths: Record<number, string> = {
    // Very puffy cumulus shapes with pronounced round bumps
    1: "M20 95 Q18 80 30 72 Q28 55 48 48 Q50 30 72 28 Q80 12 105 15 Q118 2 140 8 Q155 -2 178 6 Q195 -4 218 8 Q235 0 255 12 Q272 5 288 18 Q305 10 318 28 Q335 22 345 42 Q358 40 362 58 Q372 65 368 80 Q375 90 365 95 Z",
    2: "M18 92 Q15 75 28 68 Q25 50 45 44 Q48 28 68 25 Q78 10 100 14 Q115 0 138 6 Q155 -5 175 5 Q192 -2 212 8 Q230 0 248 12 Q265 4 280 18 Q298 12 312 30 Q328 25 338 45 Q350 42 352 60 Q362 68 358 82 Q365 90 355 92 Z",
    3: "M22 88 Q20 72 32 65 Q30 48 50 42 Q55 25 75 22 Q85 8 108 12 Q122 -2 145 5 Q162 -5 182 4 Q198 -3 218 6 Q235 -2 252 10 Q268 2 285 16 Q302 8 315 26 Q330 20 340 38 Q352 35 355 55 Q365 62 360 78 Q368 86 358 88 Z",
    4: "M15 90 Q12 74 25 66 Q22 48 42 42 Q45 25 65 22 Q75 8 98 12 Q112 -2 135 5 Q152 -5 172 4 Q190 -3 210 6 Q228 -2 245 10 Q262 2 278 16 Q295 10 308 28 Q322 22 332 40 Q345 38 348 56 Q358 64 354 78 Q362 88 350 90 Z",
    5: "M20 90 Q18 76 30 68 Q28 52 48 45 Q52 28 72 24 Q82 10 105 14 Q120 0 142 7 Q158 -3 178 5 Q195 -5 215 6 Q232 -2 250 10 Q266 2 282 16 Q298 8 312 25 Q326 18 336 38 Q348 34 352 54 Q362 60 358 76 Q366 85 356 90 Z",
  };

  return (
    <svg
      viewBox="0 0 380 100"
      preserveAspectRatio="none"
      className={className}
    >
      {shadow && (
        <>
          <path
            d={paths[variant] || paths[1]}
            fill="#A0B0C0"
            opacity="0.25"
            transform="translate(2, 10)"
          />
          <path
            d={paths[variant] || paths[1]}
            fill="#B8C8D8"
            opacity="0.4"
            transform="translate(1, 5)"
          />
        </>
      )}
      <path d={paths[variant] || paths[1]} fill="white" />
    </svg>
  );
}

export function ScrollClouds() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cloudEls = container.querySelectorAll<HTMLDivElement>("[data-cloud]");
    let rafId: number;
    const startTime = performance.now();

    function update() {
      const section = container!.closest("section");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const sectionH = rect.height;

      const rawProgress = (viewportH - rect.top) / (viewportH + sectionH);
      const progress = Math.max(0, Math.min(1, rawProgress));
      const elapsed = (performance.now() - startTime) / 1000;

      cloudEls.forEach((el) => {
        const driftDir = Number(el.dataset.drift) || 1;
        const speed = Number(el.dataset.speed) || 1;
        const yOffset = Number(el.dataset.yoffset) || 0;

        const easedProgress = progress * progress;
        const horizontalSpread = easedProgress * driftDir * speed * 500;
        const verticalFloat =
          Math.sin(elapsed * 0.5 + speed * 2) * 8 +
          yOffset * easedProgress * -40;
        const opacity = Math.max(0, 1 - Math.max(0, progress - 0.25) * 1.5);

        el.style.transform = `translate(${horizontalSpread}px, ${verticalFloat}px)`;
        el.style.opacity = String(opacity);
      });

      rafId = requestAnimationFrame(update);
    }

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-10"
    >
      {/* ===== TOP-LEFT ===== */}
      <div data-cloud data-drift="-1" data-speed="1.2" data-yoffset="0.2" className="absolute top-[0%] -left-[8%] will-change-transform">
        <CloudShape variant={1} shadow className="w-[500px] h-[140px]" />
        <CloudShape variant={3} className="w-[420px] h-[110px] absolute top-[20px] left-[30px]" />
      </div>

      {/* ===== TOP-RIGHT ===== */}
      <div data-cloud data-drift="1" data-speed="1.1" data-yoffset="0.3" className="absolute top-[1%] -right-[6%] will-change-transform">
        <CloudShape variant={2} shadow className="w-[480px] h-[135px]" />
        <CloudShape variant={5} className="w-[400px] h-[105px] absolute top-[22px] left-[25px]" />
      </div>

      {/* ===== MID-LEFT ===== */}
      <div data-cloud data-drift="-1" data-speed="0.9" data-yoffset="0.5" className="absolute top-[20%] -left-[10%] will-change-transform">
        <CloudShape variant={4} shadow className="w-[520px] h-[145px]" />
        <CloudShape variant={1} className="w-[440px] h-[115px] absolute top-[25px] left-[28px]" />
      </div>

      {/* ===== MID-RIGHT ===== */}
      <div data-cloud data-drift="1" data-speed="0.8" data-yoffset="0.4" className="absolute top-[25%] -right-[8%] will-change-transform">
        <CloudShape variant={3} shadow className="w-[500px] h-[140px]" />
        <CloudShape variant={2} className="w-[420px] h-[110px] absolute top-[22px] left-[25px]" />
      </div>

      {/* ===== CENTER-TOP ===== */}
      <div data-cloud data-drift="-0.4" data-speed="1.5" data-yoffset="0.1" className="absolute top-[10%] left-[15%] will-change-transform">
        <CloudShape variant={5} shadow className="w-[550px] h-[155px]" />
        <CloudShape variant={4} className="w-[460px] h-[120px] absolute top-[28px] left-[32px]" />
      </div>

      {/* ===== LOWER-LEFT ===== */}
      <div data-cloud data-drift="-1" data-speed="1.0" data-yoffset="0.6" className="absolute top-[48%] -left-[6%] will-change-transform">
        <CloudShape variant={2} shadow className="w-[500px] h-[140px]" />
        <CloudShape variant={5} className="w-[420px] h-[108px] absolute top-[24px] left-[28px]" />
      </div>

      {/* ===== LOWER-RIGHT ===== */}
      <div data-cloud data-drift="1" data-speed="1.3" data-yoffset="0.7" className="absolute top-[52%] -right-[7%] will-change-transform">
        <CloudShape variant={1} shadow className="w-[480px] h-[135px]" />
        <CloudShape variant={3} className="w-[400px] h-[105px] absolute top-[22px] left-[26px]" />
      </div>

      {/* ===== CENTER-MID ===== */}
      <div data-cloud data-drift="0.4" data-speed="1.4" data-yoffset="0.5" className="absolute top-[42%] left-[18%] will-change-transform">
        <CloudShape variant={4} shadow className="w-[530px] h-[148px]" />
        <CloudShape variant={1} className="w-[440px] h-[115px] absolute top-[26px] left-[30px]" />
      </div>

      {/* ===== BOTTOM-LEFT ===== */}
      <div data-cloud data-drift="-1" data-speed="0.7" data-yoffset="0.8" className="absolute top-[72%] -left-[8%] will-change-transform">
        <CloudShape variant={3} shadow className="w-[510px] h-[142px]" />
        <CloudShape variant={2} className="w-[430px] h-[112px] absolute top-[24px] left-[28px]" />
      </div>

      {/* ===== BOTTOM-RIGHT ===== */}
      <div data-cloud data-drift="1" data-speed="0.6" data-yoffset="0.9" className="absolute top-[78%] -right-[5%] will-change-transform">
        <CloudShape variant={5} shadow className="w-[490px] h-[138px]" />
        <CloudShape variant={4} className="w-[410px] h-[108px] absolute top-[22px] left-[24px]" />
      </div>

      {/* ===== BOTTOM-CENTER ===== */}
      <div data-cloud data-drift="-0.3" data-speed="1.6" data-yoffset="0.9" className="absolute top-[70%] left-[16%] will-change-transform">
        <CloudShape variant={1} shadow className="w-[520px] h-[145px]" />
        <CloudShape variant={5} className="w-[430px] h-[112px] absolute top-[26px] left-[32px]" />
      </div>
    </div>
  );
}
