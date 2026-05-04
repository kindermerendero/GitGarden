"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlantData } from "@/lib/plantMapper";

// Each pixel block size in px
const PX = 6;

// Sprite templates: 0=empty, 1=petal, 2=center-outer, 3=center-inner
const SPRITES: readonly (readonly (readonly number[])[])[] = [
  // A: 3×3 cross — minimalist
  [[0,1,0],[1,2,1],[0,1,0]],
  // B: 3×3 diagonal — sparse
  [[1,0,1],[0,2,0],[1,0,1]],
  // C: 5×5 daisy
  [[0,0,1,0,0],[0,1,1,1,0],[1,1,2,1,1],[0,1,1,1,0],[0,0,1,0,0]],
  // D: 5×5 star
  [[0,1,0,1,0],[1,1,2,1,1],[0,2,3,2,0],[1,1,2,1,1],[0,1,0,1,0]],
  // E: 5×5 chunky
  [[0,1,1,1,0],[1,2,2,2,1],[1,2,3,2,1],[1,2,2,2,1],[0,1,1,1,0]],
  // F: 7×7 big flower
  [
    [0,0,1,1,1,0,0],
    [0,1,1,2,1,1,0],
    [1,1,2,2,2,1,1],
    [1,2,2,3,2,2,1],
    [1,1,2,2,2,1,1],
    [0,1,1,2,1,1,0],
    [0,0,1,1,1,0,0],
  ],
];

// Shadow/darker shade for each petal (1 block below-right offset)
function darken(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

const CENTERS: Record<string, [string, string]> = {
  positive: ["#fef3c7", "#f59e0b"],
  negative: ["#fecaca", "#f87171"],
  neutral:  ["#e7e0d0", "#c9aa80"],
};

interface PlantProps {
  plant: PlantData;
  index: number;
}

export function Plant({ plant, index }: PlantProps) {
  const [hovered, setHovered] = useState(false);
  const {
    sha, stemHeight, petalColor, stemColor,
    message, author, sentiment, additions, deletions,
  } = plant;

  // Pick sprite from sha bytes
  const spriteIdx = (sha.charCodeAt(0) + sha.charCodeAt(1)) % SPRITES.length;
  const sprite = SPRITES[spriteIdx];
  const sRows = sprite.length;
  const sCols = sprite[0].length;

  const flowerW = sCols * PX;
  const flowerH = sRows * PX;

  const stemBlocks = Math.max(7, Math.round(stemHeight / PX));
  const stemH = stemBlocks * PX;

  // Canvas: wide enough for leaves (±2 blocks) and flower
  const canvasW = Math.max(flowerW + PX * 6, PX * 9);
  const canvasH = flowerH + stemH;

  const cx = Math.floor(canvasW / 2);
  // Stem: 1 pixel block wide, centered
  const stemX = cx - Math.floor(PX / 2);
  // Flower top-left
  const fx = cx - Math.floor(flowerW / 2);

  // Leaf positions along stem
  const leaf1 = Math.floor(stemBlocks * 0.32);
  const leaf2 = Math.floor(stemBlocks * 0.60);

  const [cOuter, cInner] = CENTERS[sentiment] ?? CENTERS.neutral;
  const shadowColor = darken(petalColor);
  const stemShadow = darken(stemColor);

  return (
    <div className="relative flex flex-col items-center">
      {/* Pixel tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute z-20 w-48 pointer-events-none"
            style={{ bottom: "calc(100% + 8px)", left: "50%", x: "-50%" }}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.1 }}
          >
            <div
              style={{
                background: "rgba(8,12,8,0.96)",
                border: "2px solid rgba(255,255,255,0.1)",
                padding: "10px 12px",
                imageRendering: "pixelated",
              }}
            >
              <p
                className="text-white/85 text-xs leading-snug mb-1.5 line-clamp-2"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {message}
              </p>
              <p
                className="text-white/35 mb-2"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem" }}
              >
                {author}
              </p>
              <div
                className="flex gap-3 text-white/30"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}
              >
                <span className="text-emerald-400/75">+{additions}</span>
                <span className="text-rose-400/65">−{deletions}</span>
                <span
                  className={
                    sentiment === "positive" ? "text-emerald-400/60" :
                    sentiment === "negative" ? "text-rose-400/55" :
                    "text-stone-400/50"
                  }
                >
                  {sentiment}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.045, duration: 0.25 }}
      >
        <motion.svg
          width={canvasW}
          height={canvasH}
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          shapeRendering="crispEdges"
          style={{ imageRendering: "pixelated", transformOrigin: "bottom center" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{
            delay: index * 0.045 + 0.04,
            duration: 0.65,
            ease: [0.2, 1.0, 0.4, 1.0],
          }}
        >
          {/* ── STEM ── */}
          {Array.from({ length: stemBlocks }, (_, i) => [
            // main stem pixel
            <rect key={`s${i}`} x={stemX} y={flowerH + i * PX} width={PX} height={PX}
              fill={stemColor} opacity={0.92} />,
            // right-edge shadow pixel (gives a subtle 3-D pixel look)
            <rect key={`ss${i}`} x={stemX + PX} y={flowerH + i * PX + 1} width={1} height={PX - 1}
              fill={stemShadow} opacity={0.35} />,
          ])}

          {/* ── LEAF LEFT ── 2 blocks diagonal */}
          <rect x={stemX - PX}     y={flowerH + leaf1 * PX}        width={PX} height={PX} fill={stemColor} opacity={0.80} />
          <rect x={stemX - PX * 2} y={flowerH + leaf1 * PX + PX}   width={PX} height={PX} fill={stemColor} opacity={0.55} />

          {/* ── LEAF RIGHT ── 2 blocks diagonal (offset from leaf1) */}
          <rect x={stemX + PX}     y={flowerH + leaf2 * PX}        width={PX} height={PX} fill={stemColor} opacity={0.80} />
          <rect x={stemX + PX * 2} y={flowerH + leaf2 * PX - PX}   width={PX} height={PX} fill={stemColor} opacity={0.55} />

          {/* ── FLOWER SPRITE ── */}
          {/* Shadow layer: offset 1px right+down */}
          {sprite.flatMap((row, ri) =>
            row.map((cell, ci) => {
              if (cell === 0) return null;
              return (
                <rect
                  key={`fsh${ri}-${ci}`}
                  x={fx + ci * PX + 1}
                  y={ri * PX + 1}
                  width={PX}
                  height={PX}
                  fill={cell >= 2 ? darken(cOuter) : shadowColor}
                  opacity={0.3}
                />
              );
            })
          )}

          {/* Main flower pixels */}
          {sprite.flatMap((row, ri) =>
            row.map((cell, ci) => {
              if (cell === 0) return null;
              const fill =
                cell === 3 ? cInner :
                cell === 2 ? cOuter :
                petalColor;
              return (
                <rect
                  key={`f${ri}-${ci}`}
                  x={fx + ci * PX}
                  y={ri * PX}
                  width={PX}
                  height={PX}
                  fill={fill}
                />
              );
            })
          )}

          {/* Highlight: top-left corner pixel on center */}
          {sprite.flatMap((row, ri) =>
            row.map((cell, ci) =>
              cell >= 2 ? (
                <rect
                  key={`fh${ri}-${ci}`}
                  x={fx + ci * PX}
                  y={ri * PX}
                  width={2}
                  height={2}
                  fill="white"
                  opacity={0.35}
                />
              ) : null
            )
          )}
        </motion.svg>
      </motion.div>
    </div>
  );
}
