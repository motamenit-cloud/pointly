export function PointlyLogo({ className, height = 32 }: { className?: string; height?: number }) {
  // viewBox sized to give room for descenders (p, y) below baseline and the star above
  // Baseline at y=54; cap-height ≈ 34px → top of letters at y≈20
  // "i" dot center in Nunito 700/48px ≈ y=18, x≈69 (after "po" ≈ 61px + 8px center)
  return (
    <svg
      viewBox="0 0 200 66"
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pointly"
      role="img"
    >
      <text
        x="1"
        y="54"
        fontFamily="Nunito, sans-serif"
        fontWeight="700"
        fontSize="48"
        fill="#0d2151"
      >
        pointly
      </text>
      {/* Gold 4-pointed sparkle — centered on where the "i" dot sits */}
      <path
        d="M69,10 C70,14.5 70,14.5 74.5,18 C70,21.5 70,21.5 69,26 C68,21.5 68,21.5 63.5,18 C68,14.5 68,14.5 69,10 Z"
        fill="#C9A020"
      />
    </svg>
  );
}
