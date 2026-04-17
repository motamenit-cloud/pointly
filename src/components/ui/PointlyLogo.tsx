export function PointlyLogo({ className, height = 32 }: { className?: string; height?: number }) {
  return (
    <svg
      viewBox="0 0 185 56"
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pointly"
      role="img"
    >
      <text
        x="1"
        y="52"
        fontFamily="Nunito, sans-serif"
        fontWeight="800"
        fontSize="50"
        fill="#0d2151"
      >
        pointly
      </text>
      {/* Gold 4-pointed sparkle star above the "i" dot */}
      <path
        d="M72,1 C73,6.5 73,6.5 78,9.5 C73,12.5 73,12.5 72,18 C71,12.5 71,12.5 66,9.5 C71,6.5 71,6.5 72,1 Z"
        fill="#C9A020"
      />
    </svg>
  );
}
