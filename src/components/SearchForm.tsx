"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchFormProps {
  onSubmit: (repo: string) => void;
  loading: boolean;
}

export function SearchForm({ onSubmit, loading }: SearchFormProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="owner / repo"
          className="w-full bg-transparent border-b border-white/15 px-0 py-2.5 text-white/75 placeholder:text-white/22 text-sm outline-none focus:border-white/35 transition-colors duration-300 text-center"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
          disabled={loading}
          spellCheck={false}
          autoComplete="off"
        />
        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-3 h-3 border border-white/25 border-t-white/60 rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="submit"
        disabled={loading || !value.trim()}
        className="text-xs text-white/40 hover:text-white/70 disabled:text-white/18 disabled:cursor-not-allowed transition-colors duration-200"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
        whileTap={{ scale: 0.96 }}
      >
        {loading ? "growing..." : "generate garden →"}
      </motion.button>
    </form>
  );
}
