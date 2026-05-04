"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlantData } from "@/lib/plantMapper";
import { SPRITES, CENTERS, LEGENDARY_SPRITE_IDX, REGULAR_SPRITE_COUNT, shadowColor, highlightColor } from "@/lib/sprites";
import { generateLore } from "@/lib/lore";

const PX = 6;

// ── Audio ─────────────────────────────────────────────────────────────────────

let _audioCtx: AudioContext | null = null;

function playPop(): void {
  if (typeof window === "undefined") return;
  try {
    _audioCtx ??= new AudioContext();
    const ctx = _audioCtx;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(720, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.11);
  } catch { /* AudioContext unavailable */ }
}

// ── Pixel Dust ────────────────────────────────────────────────────────────────

function PixelDust({ petalColor, cx, topY }: { petalColor: string; cx: number; topY: number }) {
  const particles = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i, dx: (i - 2) * 9, dy: -(16 + i * 9),
      delay: 0.72 + i * 0.09, size: i % 2 === 0 ? 4 : 3,
    })),
  []);

  return (
    <>
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute pointer-events-none"
          style={{ left: cx + p.dx - p.size / 2, top: topY, width: p.size, height: p.size, background: petalColor, imageRendering: "pixelated", zIndex: 10 }}
          initial={{ opacity: 0.9, x: 0, y: 0 }}
          animate={{ opacity: 0, x: p.dx * 0.4, y: p.dy }}
          transition={{ duration: 0.85, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

// ── RPG Tooltip ───────────────────────────────────────────────────────────────

function PixelTooltip({ plant }: { plant: PlantData }) {
  const lore = generateLore(plant);
  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      style={{ bottom: "calc(100% + 10px)", left: "50%", x: "-50%", width: 200 }}
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.13 }}
    >
      <div style={{
        background: "#080d08",
        border: "2px solid rgba(255,255,255,0.11)",
        outline: "1px solid rgba(0,0,0,0.9)",
        padding: "10px 12px",
      }}>
        {/* Commit message */}
        <p className="text-white/88 text-xs leading-snug mb-2 line-clamp-2"
          style={{ fontFamily: "var(--font-sans)" }} title={plant.message}>
          {plant.message}
        </p>

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "6px 0" }} />

        {/* Lore — Instrument Serif italic */}
        <p style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: "0.71rem", color: "rgba(255,255,255,0.40)", lineHeight: 1.45,
        }}>
          {lore}
        </p>

        {/* Stats */}
        <div className="flex gap-3 mt-2.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>
          <span style={{ color: "#7EC8A488" }}>+{plant.additions}</span>
          <span style={{ color: "#E07A7A77" }}>−{plant.deletions}</span>
          {plant.legendary && (
            <span style={{ color: "#f59e0baa" }}>★ legendary</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Stagger variant ───────────────────────────────────────────────────────────

export const plantVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

// ── Plant ──────────────────────────────────────────────────────────────────────

interface PlantProps { plant: PlantData }

export function Plant({ plant }: PlantProps) {
  const [hovered, setHovered] = useState(false);
  const { sha, stemHeight, petalColor, stemColor, sentiment, linesChanged, legendary } = plant;

  // Sprite selection: legendary → slot 6, regular → slots 0-5
  const spriteIdx  = legendary ? LEGENDARY_SPRITE_IDX : (sha.charCodeAt(0) + sha.charCodeAt(1)) % REGULAR_SPRITE_COUNT;
  const sprite     = SPRITES[spriteIdx];
  const flowerW    = sprite[0].length * PX;
  const flowerH    = sprite.length * PX;
  const stemBlocks = Math.max(7, Math.round(stemHeight / PX));
  const stemH      = stemBlocks * PX;
  const canvasW    = Math.max(flowerW + PX * 6, PX * 9);
  const canvasH    = flowerH + stemH;
  const cx         = Math.floor(canvasW / 2);

  // Stem coords (in stem SVG — y starts at 0, no flowerH offset)
  const stemX = cx - Math.floor(PX / 2);
  const leaf1 = Math.floor(stemBlocks * 0.32);
  const leaf2 = Math.floor(stemBlocks * 0.60);

  // Flower coords (in flower SVG — same as original y=0..flowerH)
  const fx = cx - Math.floor(flowerW / 2);

  const [cOuter, cInner] = CENTERS[sentiment] ?? CENTERS.neutral;

  // Wind
  const windDuration = linesChanged > 300 ? 2.6 : linesChanged > 100 ? 3.8 : 5.2;
  const windAmp      = linesChanged > 300 ? 2.0 : linesChanged > 100 ? 1.4 : 0.9;
  const windPhase    = (sha.charCodeAt(2) % 20) / 10;

  // Bloom filter
  const bloomFilter = legendary
    ? `drop-shadow(0 0 8px ${petalColor}ee) drop-shadow(0 0 18px ${petalColor}99) drop-shadow(0 0 30px ${petalColor}44)`
    : linesChanged > 300
    ? `drop-shadow(0 0 5px ${petalColor}cc) drop-shadow(0 0 12px ${petalColor}77)`
    : undefined;

  return (
    <motion.div
      variants={plantVariants}
      className="relative flex-shrink-0 cursor-pointer"
      style={{ width: canvasW, height: canvasH }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Ground glow — bleeds below the plant container onto the grass */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          bottom: -4, left: "50%", x: "-50%",
          width: canvasW * 0.9, height: 12,
          background: `radial-gradient(ellipse, ${petalColor}22 0%, transparent 80%)`,
          filter: "blur(5px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.7 }}
      />

      {/* Pixel Dust */}
      <PixelDust petalColor={petalColor} cx={cx} topY={flowerH / 2} />

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && <PixelTooltip plant={plant} />}
      </AnimatePresence>

      {/* Wind wrapper — rotates full plant from base */}
      <motion.div
        style={{ position: "absolute", inset: 0, transformOrigin: "50% 100%", filter: bloomFilter }}
        animate={{ rotate: [-windAmp, windAmp, -windAmp] }}
        transition={{ duration: windDuration, repeat: Infinity, ease: "easeInOut", delay: windPhase, repeatType: "mirror" }}
      >
        {/* ── Stem SVG — grows scaleY from ground up ── */}
        <motion.svg
          width={canvasW} height={stemH}
          viewBox={`0 0 ${canvasW} ${stemH}`}
          shapeRendering="crispEdges"
          style={{
            position: "absolute", top: flowerH, left: 0,
            imageRendering: "pixelated", transformOrigin: "bottom center",
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.55, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          {Array.from({ length: stemBlocks }, (_, i) => [
            <rect key={`s${i}`} x={stemX} y={i * PX} width={PX} height={PX}
              fill={stemColor} opacity={i % 2 === 0 ? 0.90 : 0.76} />,
            <rect key={`ss${i}`} x={stemX + PX} y={i * PX + 1} width={1} height={PX - 1}
              fill={shadowColor(stemColor)} opacity={0.40} />,
          ])}
          <rect x={stemX - PX}     y={leaf1 * PX}      width={PX} height={PX} fill={stemColor} opacity={0.80} />
          <rect x={stemX - PX * 2} y={leaf1 * PX + PX} width={PX} height={PX} fill={stemColor} opacity={0.55} />
          <rect x={stemX + PX}     y={leaf2 * PX}      width={PX} height={PX} fill={stemColor} opacity={0.80} />
          <rect x={stemX + PX * 2} y={leaf2 * PX - PX} width={PX} height={PX} fill={stemColor} opacity={0.55} />
        </motion.svg>

        {/* ── Flower SVG — spring blooms from stem top ── */}
        <motion.svg
          width={canvasW} height={flowerH * 2}
          viewBox={`0 0 ${canvasW} ${flowerH * 2}`}
          shapeRendering="crispEdges"
          style={{
            position: "absolute", top: 0, left: 0,
            imageRendering: "pixelated",
            transformOrigin: `${cx}px ${flowerH * 1.05}px`,
          }}
          initial={{ scale: 0, rotate: -100 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.48, type: "spring", stiffness: 260, damping: 12 }}
          onAnimationComplete={playPop}
        >
          {/* Legendary: orbiting particles */}
          {legendary && (
            <motion.g
              style={{ transformOrigin: `${cx}px ${flowerH / 2}px` }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              {[0, 1, 2, 3].map((i) => {
                const angle = (i / 4) * 2 * Math.PI;
                const R = flowerH * 1.35;
                return (
                  <rect key={i}
                    x={cx + R * Math.cos(angle) - 2}
                    y={flowerH / 2 + R * Math.sin(angle) - 2}
                    width={4} height={4}
                    fill={petalColor} opacity={0.65}
                  />
                );
              })}
            </motion.g>
          )}

          {/* Flower shadow layer */}
          {sprite.flatMap((row, ri) =>
            row.map((cell, ci) => !cell ? null : (
              <rect key={`fsh${ri}-${ci}`}
                x={fx + ci * PX + 1} y={ri * PX + 1} width={PX} height={PX}
                fill={cell >= 2 ? shadowColor(cOuter) : shadowColor(petalColor)}
                opacity={0.32}
              />
            ))
          )}

          {/* Flower main pixels */}
          {sprite.flatMap((row, ri) =>
            row.map((cell, ci) => !cell ? null : (
              <rect key={`f${ri}-${ci}`}
                x={fx + ci * PX} y={ri * PX} width={PX} height={PX}
                fill={cell === 3 ? cInner : cell === 2 ? cOuter : petalColor}
              />
            ))
          )}

          {/* Highlights */}
          {sprite.flatMap((row, ri) =>
            row.map((cell, ci) => cell < 2 ? null : (
              <rect key={`fh${ri}-${ci}`}
                x={fx + ci * PX} y={ri * PX} width={2} height={2}
                fill={highlightColor(cell === 3 ? cInner : cOuter)}
                opacity={0.75}
              />
            ))
          )}
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
