"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlantData } from "@/lib/plantMapper";
import { Garden } from "@/components/Garden";
import { SearchForm } from "@/components/SearchForm";
import { getTimeTheme, TimeTheme } from "@/lib/timeTheme";

export default function Home() {
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);
  const [timeTheme, setTimeTheme] = useState<TimeTheme>(getTimeTheme);

  useEffect(() => {
    const apply = (theme: TimeTheme) => {
      document.documentElement.style.setProperty("--garden-bg", theme.bg);
      document.documentElement.style.setProperty("--garden-glow", theme.glow);
    };
    apply(timeTheme);
    const id = setInterval(() => {
      const next = getTimeTheme();
      setTimeTheme(next);
      apply(next);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const handleGenerate = async (repo: string) => {
    setLoading(true);
    setError(null);
    setPlants([]);

    try {
      const res = await fetch(`/api/commits?repo=${encodeURIComponent(repo)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore sconosciuto");
      setPlants(data.plants);
      setCurrentRepo(repo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Atmospheric radial glow — color shifts with time of day */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 85%, var(--garden-glow) 0%, transparent 65%)",
        }}
      />

      {/* Time-of-day indicator */}
      <div
        className="fixed bottom-5 right-5 text-white/18 pointer-events-none"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em" }}
      >
        {timeTheme.period}
      </div>

      {/* Header */}
      <header className="pt-20 pb-14 flex flex-col items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <h1
            className="text-5xl text-white/90 tracking-tight leading-none"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            GitGarden
          </h1>
          <p
            className="text-white/35 text-sm text-center leading-relaxed"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}
          >
            ogni commit è una pianta
          </p>
        </motion.div>

        <motion.div
          className="mt-10 w-full max-w-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SearchForm onSubmit={handleGenerate} loading={loading} />
        </motion.div>
      </header>

      {/* Canvas area */}
      <section className="flex-1 px-4 pb-20 relative">
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              className="text-center text-rose-400/60 text-xs mt-10"
              style={{ fontFamily: "var(--font-mono)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.p>
          )}

          {!loading && plants.length > 0 && (
            <motion.div
              key={currentRepo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.p
                className="text-center mb-10 text-white/18"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.06em" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {currentRepo}
              </motion.p>
              <Garden plants={plants} />
            </motion.div>
          )}

          {!loading && plants.length === 0 && !error && (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center mt-24 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35 }}
            >
              {/* Placeholder sketch — more visible */}
              <svg width="140" height="90" viewBox="0 0 140 90" className="opacity-[0.22]">
                <line x1="22" y1="80" x2="22" y2="48" stroke="#7ec87e" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="22" cy="42" r="9" fill="#7ec87e" opacity="0.55"/>
                <line x1="55" y1="80" x2="55" y2="28" stroke="#7ec87e" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="55" cy="21" r="12" fill="#7ec87e" opacity="0.55"/>
                <line x1="88" y1="80" x2="88" y2="38" stroke="#5bb5d5" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="88" cy="31" r="10" fill="#5bb5d5" opacity="0.55"/>
                <line x1="118" y1="80" x2="118" y2="50" stroke="#c47ec8" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="118" cy="44" r="8" fill="#c47ec8" opacity="0.55"/>
                <line x1="0" y1="81" x2="140" y2="81" stroke="#7ec87e" strokeWidth="0.75" opacity="0.25"/>
              </svg>
              <p
                className="text-white/28 text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                il giardino ti aspetta
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
