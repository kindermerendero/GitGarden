"use client";

export function GrainOverlay() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9998, opacity: 0.052 }}
      aria-hidden="true"
    >
      <filter id="gg-grain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.68"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#gg-grain)" />
    </svg>
  );
}
