import { useState, useEffect } from "react";

const BOOT_LINES = [
  "INITIALIZING SYSTEM...",
  "LOADING NEURAL INTERFACE...",
  "CONNECTING TO COMMAND CENTER...",
  "SCANNING JOB MATRIX...",
  "DECRYPTING DATA STREAMS...",
  "SYSTEM ONLINE ▌",
];

export function GamingBootScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (visibleLines < BOOT_LINES.length) {
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), 350);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setFadeOut(true), 400);
      const done = setTimeout(onComplete, 900);
      return () => {
        clearTimeout(timer);
        clearTimeout(done);
      };
    }
  }, [visibleLines, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,150,0.03) 2px, rgba(0,255,150,0.03) 4px)",
        }}
      />

      <div className="font-mono text-left max-w-lg px-8">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="text-green-400 text-sm md:text-base mb-2 animate-fade-in"
            style={{
              textShadow: "0 0 10px rgba(0,255,150,0.8), 0 0 20px rgba(0,255,150,0.4)",
            }}
          >
            <span className="text-cyan-400 mr-2">&gt;</span>
            {line}
          </div>
        ))}
        {visibleLines < BOOT_LINES.length && (
          <div className="w-3 h-5 bg-green-400 animate-pulse inline-block" />
        )}
      </div>
    </div>
  );
}
