"use client";

import { useState } from "react";

/**
 * Airline logo loaded from pics.avs.io CDN, with graceful fallback.
 * Accepts any IATA 2-letter airline code (e.g. "BA", "UA", "DL").
 */
export function AirlineLogo({
  code,
  color,
  size = 40,
}: {
  code: string;
  color?: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);

  // Request 2x resolution for retina displays
  const imgSize = size * 2;
  const src = `https://pics.avs.io/${imgSize}/${imgSize}/${code}.png`;

  return (
    <div
      className="shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-slate-100"
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <img
          src={src}
          alt={`${code} logo`}
          width={size}
          height={size}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: color || "#1a2744" }}
        >
          {code}
        </div>
      )}
    </div>
  );
}
