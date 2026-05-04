"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlantData } from "@/lib/plantMapper";
import { SPRITES, CENTERS, shadowColor, highlightColor } from "@/lib/sprites";

const PX = 6;

function PixelDust({ petalColor, cx, topY }: {
  petalColor: string;
  cx: number;
  topY: number;
}) {
  const particles = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      dx: (i - 2) * 9,
      dy: -(16 + i * 9),
      delay: 0.72 + i * 0.09,
      size: i % 2 === 0 ? 4 : 3,
    })),
  []);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            left: cx + p.dx - p.size / 2,
            top: topY,
            width: p.size,
            height: p.size,
            background: petalColor,
            imageRendering: "pixelated",
            zIndex: 10,
          }}
          initial={{ opacity: 0.9, x: 0, y: 0 }}
          animate={{ opacity: 0, x: p.dx * 0.4, y: p.dy }}
          transition={{ duration: 0.85, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

export const plantVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

interface PlantProps {
  plant: PlantData;
}

export function Plant({ plant }: PlantProps) {
  const [hovered, setHovered] = useState(false);
  const {
    sha, stemHeight, petalColor, stemColor,
    message, author, sentiment, additions, deletions, linesChanged,
  } = plant;

  const spriteIdx  = (sha.charCodeAt(0) + sha.charCodeAt(1)) % SPRITES.length;
  const sprite     = SPRITES[spriteIdx];
  const flowerW    = sprite[0].length * PX;
  const flowerH    = sprite.length * PX;
  const stemBlocks = Math.max(7, Math.round(stemHeight / PX));
  const stemH      = stemBlocks * PX;
  const canvasW    = Math.max(flowerW + PX * 6, PX * 9);
  const canvasH    = flowerH + stemH;
  const cx         = Math.floor(canvasW / 2);

  const stemX    = cx - Math.floor(PX / 2);
  const fx       = cx - Math.floor(flowerW / 2);
  const stemTopY = flowerH;
  const leaf1    = Math.floor(stemBlocks * 0.32);
  const leaf2    = Math.floor(stemBlocks * 0.60);

  const [cOuter, cInner] = CENTERS[sentiment] ?? CENTERS.neutral;

  const windDuration = linesChanged > 300 ? 2.6 : linesChanged > 100 ? 3.8 : 5.2;
  const windAmp      = linesChanged > 300 ? 2.0 : linesChanged > 100 ? 1.4 : 0.9;
  const windPhase    = (sha.charCodeAt(2) % 20) / 10;

  const bloomFilter = linesChanged > 300
    ? `drop-shadow(0 0 5px ${petalColor}cc) drop-shadow(0 0 12px ${petalColor}77)`
    : undefined;

  return (
    <motion.div
      variants={plantVariants}
      className="relative flex flex-col items-center cursor-pointer"
      style={{ width: canvasW, height: canvasH }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <PixelDust petalColor={petalColor} cx={cx} topY={flowerH / 2} />

      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute z-20 w-48 pointer-events-none"
            style={{ bottom: "calc(100% + 8px)", left: "50%", x: "-50%" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
          >
            <div
              className="rounded p-2.5 text-xs shadow-2xl"
              style={{
                background: "rgba(8,12,8,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(6px)",
              }}
            >
              <p className="text-white/85 leading-snug mb-1 line-clamp-2" style={{ fontFamily: "var(--font-sans)" }} title={message}>
                {message}
              </p>
              <p className="text-white/35 mb-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>
                {author}
              </p>
              <div className="flex gap-2.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem" }}>
                <span className="text-emerald-400/75">+{additions}</span>
                <span className="text-rose-400/65">−{deletions}</span>
                <span className={
                  sentiment === "positive" ? "text-emerald-400/60" :
                  sentiment === "negative" ? "text-rose-400/55" :
                  "text-stone-400/50"
                }>{sentiment}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ transformOrigin: "50% 100%", filter: bloomFilter }}
        animate={{ rotate: [-windAmp, windAmp, -windAmp] }}
        transition={{ duration: windDuration, repeat: Infinity, ease: "easeInOut", delay: windPhase, repeatType: "mirror" }}
      >
        <motion.svg
          width={canvasW}
          height={canvasH}
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          shapeRendering="crispEdges"
          style={{ imageRendering: "pixelated", transformOrigin: "bottom center" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.34, 1.1, 0.64, 1] }}
        >
          {Array.from({ length: stemBlocks }, (_, i) => [
            <rect key={`s${i}`} x={stemX} y={stemTopY + i * PX} width={PX} height={PX} fill={stemColor} opacity={i % 2 === 0 ? 0.90 : 0.76} />,
            <rect key={`ss${i}`} x={stemX + PX} y={stemTopY + i * PX + 1} width={1} height={PX - 1} fill={shadowColor(stemColor)} opacity={0.40} />,
          ])}

          <rect x={stemX - PX}     y={stemTopY + leaf1 * PX}      width={PX} height={PX} fill={stemColor} opacity={0.80} />
          <rect x={stemX - PX * 2} y={stemTopY + leaf1 * PX + PX} width={PX} height={PX} fill={stemColor} opacity={0.55} />
          <rect x={stemX + PX}     y={stemTopY + leaf2 * PX}      width={PX} height={PX} fill={stemColor} opacity={0.80} />
          <rect x={stemX + PX * 2} y={stemTopY + leaf2 * PX - PX} width={PX} height={PX} fill={stemColor} opacity={0.55} />

          {sprite.flatMap((row, ri) =>
            row.map((cell, ci) => !cell ? null : (
              <rect key={`fsh${ri}-${ci}`} x={fx + ci * PX + 1} y={ri * PX + 1} width={PX} height={PX}
                fill={cell >= 2 ? shadowColor(cOuter) : shadowColor(petalColor)} opacity={0.32} />
            ))
          )}

          {sprite.flatMap((row, ri) =>
            row.map((cell, ci) => !cell ? null : (
              <rect key={`f${ri}-${ci}`} x={fx + ci * PX} y={ri * PX} width={PX} height={PX}
                fill={cell === 3 ? cInner : cell === 2 ? cOuter : petalColor} />
            ))
          )}

          {sprite.flatMap((row, ri) =>
            row.map((cell, ci) => cell < 2 ? null : (
              <rect key={`fh${ri}-${ci}`} x={fx + ci * PX} y={ri * PX} width={2} height={2}
                fill={highlightColor(cell === 3 ? cInner : cOuter)} opacity={0.75} />
            ))
          )}
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
