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
        d="M69,8 C70.5,13 70.5,13 76,18 C70.5,23 70.5,23 69,28 C67.5,23 67.5,23 62,18 C67.5,13 67.5,13 69,8 Z"
        fill="#C9A020"
      />
    </svg>
  );
}
