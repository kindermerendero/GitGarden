"use client";

import { motion } from "framer-motion";
import { PlantData } from "@/lib/plantMapper";
import { Plant, plantVariants } from "./Plant";

interface GardenProps {
  plants: PlantData[];
}

const PX = 6;
const BLOCKS = 200;

function grassColor(i: number) {
  const v = ["#3a8c22","#2d7a1a","#44a028","#328024","#26661a"];
  return v[(i * 7 + i * i) % v.length];
}
function dirtColor(i: number) {
  const v = ["#5a3a1e","#4a2e14","#634020","#523418","#3e2810"];
  return v[(i * 3 + i) % v.length];
}

export function Garden({ plants }: GardenProps) {
  const totalLines    = plants.reduce((a, p) => a + p.linesChanged, 0);
  const positiveCount = plants.filter((p) => p.sentiment === "positive").length;
  const negativeCount = plants.filter((p) => p.sentiment === "negative").length;

  return (
    <div className="w-full">
      {/* ── Plants with staggerChildren ── */}
      <motion.div
        className="flex items-end justify-center gap-1 flex-wrap px-4 pb-0 min-h-[220px]"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.07, delayChildren: 0.05 },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        {plants.map((plant, i) => (
          <Plant key={plant.sha} plant={plant} index={i} />
        ))}
      </motion.div>

      {/* ── Pixel-art ground ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ lineHeight: 0 }}
      >
        <svg
          width="100%" height={PX}
          viewBox={`0 0 ${BLOCKS * PX} ${PX}`}
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
          style={{ imageRendering: "pixelated", display: "block" }}
        >
          {Array.from({ length: BLOCKS }, (_, i) => (
            <rect key={i} x={i*PX} y={0} width={PX} height={PX} fill={grassColor(i)} opacity={0.90} />
          ))}
        </svg>
        {[0,1].map((row) => (
          <svg
            key={row}
            width="100%" height={PX}
            viewBox={`0 0 ${BLOCKS * PX} ${PX}`}
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
            style={{ imageRendering: "pixelated", display: "block" }}
          >
            {Array.from({ length: BLOCKS }, (_, i) => (
              <rect key={i} x={i*PX} y={0} width={PX} height={PX}
                fill={dirtColor(i + row * 13)}
                opacity={(0.75 - row * 0.2)}
              />
            ))}
          </svg>
        ))}
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        className="flex justify-center gap-8 mt-6"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.04em" }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        <span className="text-white/28">
          <span className="text-white/50">{plants.length}</span> commit
        </span>
        <span className="text-white/28">
          <span className="text-emerald-400/60">{positiveCount}</span> feature
          {" · "}
          <span className="text-rose-400/55">{negativeCount}</span> fix
        </span>
        <span className="text-white/28">
          <span className="text-white/50">{totalLines.toLocaleString()}</span> righe
        </span>
      </motion.div>

      {/* ── Legend ── */}
      <motion.div
        className="flex justify-center gap-5 mt-3"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.05em" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.4 }}
      >
        {[
          { color: "#7EC8A4", label: "feat · add" },
          { color: "#E07A7A", label: "fix · bug" },
          { color: "#C9B99A", label: "neutral" },
        ].map(({ color, label }) => (
          <span key={label} className="text-white/20 flex items-center gap-1.5">
            <svg width="6" height="6" shapeRendering="crispEdges" style={{ imageRendering: "pixelated", display: "inline-block" }}>
              <rect width="6" height="6" fill={color} opacity={0.7} />
            </svg>
            {label}
          </span>
        ))}
        <span className="text-white/20">stelo ∝ Δ righe</span>
      </motion.div>
    </div>
  );
}
