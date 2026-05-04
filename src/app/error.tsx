"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "#0b0d09" }}
    >
      <p
        className="text-rose-400/60 text-sm"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
      >
        qualcosa è andato storto
      </p>
      {error.message && (
        <p
          className="text-white/20 text-xs max-w-xs text-center"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {error.message}
        </p>
      )}
      <button
        onClick={reset}
        className="text-white/30 text-xs hover:text-white/60 transition-colors mt-2"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
      >
        riprova →
      </button>
    </main>
  );
}
