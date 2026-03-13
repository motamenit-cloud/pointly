"use client";

import { useEffect, useRef } from "react";

/**
 * Soft atmospheric clouds on a light blue sky.
 * Layered shapes with subtle shadows for depth, inspired by painted cloud art.
 */
function Cloud({
  variant,
  className,
  opacity = 0.7,
}: {
  variant: number;
  className?: string;
  opacity?: number;
}) {
  const paths: Record<number, string> = {
    // Large billowy cumulus
    1: "M0 100 Q30 75 80 72 Q100 48 160 44 Q190 22 250 28 Q290 10 340 18 Q380 6 430 16 Q470 8 510 28 Q540 22 570 40 Q600 35 640 52 Q670 48 700 62 Q730 58 760 72 L780 100 Z",
    // Wide flat cloud
    2: "M0 100 Q50 82 120 80 Q160 60 230 58 Q280 40 350 44 Q400 28 460 35 Q510 22 570 34 Q620 28 680 45 Q730 40 780 55 L780 100 Z",
    // Thin wispy cloud
    3: "M0 100 Q60 88 150 86 Q200 72 280 70 Q340 58 420 62 Q480 50 550 55 Q620 48 700 58 Q740 55 780 64 L780 100 Z",
    // Dense cumulus with billows
    4: "M0 100 Q20 68 70 64 Q90 38 150 34 Q180 14 240 20 Q280 4 340 14 Q380 2 430 12 Q470 6 520 24 Q560 18 610 38 Q650 32 700 50 Q740 45 780 58 L780 100 Z",
    // Small scattered wisps
    5: "M0 100 Q70 90 160 88 Q210 78 290 76 Q350 66 430 70 Q490 62 570 66 Q640 60 720 68 Q750 65 780 72 L780 100 Z",
  };

  return (
    <svg
      viewBox="0 0 780 100"
      preserveAspectRatio="none"
      className={className}
    >
      {/* Soft shadow underneath */}
      <path
        d={paths[variant] || paths[1]}
        fill="#b0c4d8"
        opacity={opacity * 0.3}
        transform="translate(2, 6)"
      />
      {/* Mid-tone body */}
      <path
        d={paths[variant] || paths[1]}
        fill="#dce8f0"
        opacity={opacity * 0.6}
        transform="translate(0, 2)"
      />
      {/* Main white body */}
      <path
        d={paths[variant] || paths[1]}
        fill="white"
        opacity={opacity}
      />
      {/* Bright highlight on top edge */}
      <path
        d={paths[variant] || paths[1]}
        fill="white"
        opacity={opacity * 0.4}
        transform="translate(0, -3) scale(1, 0.65)"
      />
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
      const elapsed = (performance.now() - startTime) / 1000;

      cloudEls.forEach((el) => {
        const speed = Number(el.dataset.speed) || 1;
        const phase = Number(el.dataset.phase) || 0;

        // Gentle continuous horizontal drift
        const horizontalFloat = Math.sin(elapsed * 0.12 * speed + phase) * 15;
        // Subtle vertical bob
        const verticalFloat = Math.sin(elapsed * 0.2 * speed + phase + 2) * 3;

        el.style.transform = `translate(${horizontalFloat}px, ${verticalFloat}px)`;
      });

      rafId = requestAnimationFrame(update);
    }

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* ── Top row ── */}
      <div data-cloud data-speed="0.7" data-phase="0" className="absolute -top-[2%] -right-[5%] w-[50%] will-change-transform">
        <Cloud variant={4} opacity={0.6} className="w-full h-[90px]" />
      </div>

      <div data-cloud data-speed="0.5" data-phase="2" className="absolute top-[5%] left-[25%] w-[30%] will-change-transform">
        <Cloud variant={5} opacity={0.35} className="w-full h-[35px]" />
      </div>

      {/* ── Upper mid ── */}
      <div data-cloud data-speed="0.8" data-phase="1" className="absolute top-[12%] -left-[8%] w-[45%] will-change-transform">
        <Cloud variant={1} opacity={0.55} className="w-full h-[75px]" />
      </div>

      <div data-cloud data-speed="0.6" data-phase="3.5" className="absolute top-[18%] right-[5%] w-[40%] will-change-transform">
        <Cloud variant={2} opacity={0.5} className="w-full h-[65px]" />
      </div>

      {/* ── Small wisp center-top ── */}
      <div data-cloud data-speed="1.1" data-phase="5" className="absolute top-[8%] left-[45%] w-[18%] will-change-transform">
        <Cloud variant={3} opacity={0.25} className="w-full h-[25px]" />
      </div>

      {/* ── Mid section ── */}
      <div data-cloud data-speed="0.65" data-phase="2.5" className="absolute top-[32%] -left-[5%] w-[48%] will-change-transform">
        <Cloud variant={3} opacity={0.5} className="w-full h-[70px]" />
      </div>

      <div data-cloud data-speed="0.75" data-phase="4" className="absolute top-[38%] -right-[6%] w-[44%] will-change-transform">
        <Cloud variant={1} opacity={0.55} className="w-full h-[80px]" />
      </div>

      {/* ── Small wisps center ── */}
      <div data-cloud data-speed="1.0" data-phase="1.5" className="absolute top-[28%] left-[35%] w-[15%] will-change-transform">
        <Cloud variant={5} opacity={0.2} className="w-full h-[22px]" />
      </div>

      <div data-cloud data-speed="0.9" data-phase="6" className="absolute top-[45%] left-[20%] w-[22%] will-change-transform">
        <Cloud variant={5} opacity={0.25} className="w-full h-[28px]" />
      </div>

      {/* ── Lower section ── */}
      <div data-cloud data-speed="0.5" data-phase="3" className="absolute top-[55%] -left-[4%] w-[50%] will-change-transform">
        <Cloud variant={4} opacity={0.55} className="w-full h-[85px]" />
      </div>

      <div data-cloud data-speed="0.6" data-phase="5.5" className="absolute top-[60%] -right-[4%] w-[46%] will-change-transform">
        <Cloud variant={2} opacity={0.5} className="w-full h-[78px]" />
      </div>

      <div data-cloud data-speed="0.85" data-phase="2" className="absolute top-[52%] left-[25%] w-[30%] will-change-transform">
        <Cloud variant={3} opacity={0.35} className="w-full h-[50px]" />
      </div>

      {/* ── Bottom dense layer ── */}
      <div data-cloud data-speed="0.45" data-phase="4.5" className="absolute top-[75%] -left-[6%] w-[52%] will-change-transform">
        <Cloud variant={1} opacity={0.55} className="w-full h-[90px]" />
      </div>

      <div data-cloud data-speed="0.55" data-phase="1" className="absolute top-[78%] -right-[3%] w-[45%] will-change-transform">
        <Cloud variant={4} opacity={0.5} className="w-full h-[82px]" />
      </div>

      <div data-cloud data-speed="0.7" data-phase="6.5" className="absolute top-[72%] left-[18%] w-[35%] will-change-transform">
        <Cloud variant={2} opacity={0.4} className="w-full h-[65px]" />
      </div>

      {/* ── Tiny wisps bottom ── */}
      <div data-cloud data-speed="1.2" data-phase="3" className="absolute top-[88%] left-[8%] w-[14%] will-change-transform">
        <Cloud variant={5} opacity={0.25} className="w-full h-[22px]" />
      </div>

      <div data-cloud data-speed="1.3" data-phase="5" className="absolute top-[90%] right-[15%] w-[12%] will-change-transform">
        <Cloud variant={3} opacity={0.22} className="w-full h-[20px]" />
      </div>
    </div>
  );
}
