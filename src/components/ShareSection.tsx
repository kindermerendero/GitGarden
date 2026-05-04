"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareSectionProps {
  repo: string;
}

export function ShareSection({ repo }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const svgUrl  = origin ? `${origin}/api/garden/svg?repo=${encodeURIComponent(repo)}` : "";
  const markdown = svgUrl ? `![GitGarden](${svgUrl})` : "";

  const copy = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <motion.div
      className="mx-auto mt-14 w-full max-w-3xl px-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="p-5"
        style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}
      >
        {/* Header */}
        <p
          className="text-white/25 mb-5"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em" }}
        >
          — share to profile
        </p>

        {/* SVG preview */}
        {svgUrl && (
          <div
            className="mb-5 overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.04)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/garden/svg?repo=${encodeURIComponent(repo)}`}
              alt="GitGarden pixel garden preview"
              className="w-full"
              style={{ imageRendering: "pixelated", display: "block" }}
            />
          </div>
        )}

        {/* Markdown copy row */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            readOnly
            value={markdown}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="flex-1 min-w-0 bg-transparent border-b border-white/8 py-2 text-white/30 outline-none text-xs truncate cursor-text"
            style={{ fontFamily: "var(--font-mono)" }}
          />

          <motion.button
            onClick={copy}
            className="shrink-0 text-xs transition-colors duration-150"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.07em" }}
            whileTap={{ scale: 0.94 }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="ok"
                  className="text-emerald-400/75"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  copied ✓
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  className="text-white/30 hover:text-white/60"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  copy →
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
