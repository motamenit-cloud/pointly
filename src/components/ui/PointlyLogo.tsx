export function PointlyLogo({ className, height = 32 }: { className?: string; height?: number }) {
  return (
    <svg
      viewBox="0 0 185 54"
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pointly"
      role="img"
    >
      <text
        x="1"
        y="50"
        fontFamily="Nunito, sans-serif"
        fontWeight="700"
        fontSize="48"
        fill="#0d2151"
      >
        pointly
      </text>
      {/* Gold 4-pointed sparkle star above the "i" dot */}
      <path
        d="M69,2 C70,6.5 70,6.5 74.5,8.5 C70,10.5 70,10.5 69,15 C68,10.5 68,10.5 63.5,8.5 C68,6.5 68,6.5 69,2 Z"
        fill="#C9A020"
      />
    </svg>
  );
}
