import { useMemo } from "react";
import { useRamadanTheme } from "@/App";

function ParticleLayer() {
  const particles = useMemo(() => {
    const stars = Array.from({ length: 18 }, (_, i) => ({
      id: `star-${i}`,
      char: i % 3 === 0 ? "✦" : i % 3 === 1 ? "✧" : "⋆",
      left: Math.random() * 100,
      size: 10 + Math.random() * 14,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 10,
    }));
    const lanterns = Array.from({ length: 8 }, (_, i) => ({
      id: `lantern-${i}`,
      left: 5 + Math.random() * 90,
      size: 18 + Math.random() * 10,
      delay: Math.random() * 14,
      duration: 14 + Math.random() * 10,
    }));
    return { stars, lanterns };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.stars.map((s) => (
        <span
          key={s.id}
          className="falling-star"
          style={{
            left: `${s.left}%`,
            fontSize: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.char}
        </span>
      ))}
      {particles.lanterns.map((l) => (
        <span
          key={l.id}
          className="floating-lantern"
          style={{
            left: `${l.left}%`,
            fontSize: `${l.size}px`,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`,
          }}
        >
          🏮
        </span>
      ))}
    </div>
  );
}

export function RamadanFrame({ children }: { children: React.ReactNode }) {
  const { isRamadan } = useRamadanTheme();

  if (!isRamadan) return <>{children}</>;

  const topLights = Array.from({ length: 30 }, (_, i) => i);
  const bottomLights = Array.from({ length: 30 }, (_, i) => i);
  const leftLights = Array.from({ length: 20 }, (_, i) => i);
  const rightLights = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="relative min-h-screen">
      <ParticleLayer />
      {/* Top fairy lights */}
      <div className="fixed top-0 left-0 right-0 h-2 z-[60] flex justify-between px-4 pointer-events-none">
        {topLights.map((i) => (
          <div key={`t-${i}`} className="fairy-light" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      {/* Bottom fairy lights */}
      <div className="fixed bottom-0 left-0 right-0 h-2 z-[60] flex justify-between px-4 pointer-events-none">
        {bottomLights.map((i) => (
          <div key={`b-${i}`} className="fairy-light" style={{ animationDelay: `${i * 0.15 + 0.5}s` }} />
        ))}
      </div>
      {/* Left fairy lights */}
      <div className="fixed top-0 left-0 w-2 h-full z-[60] flex flex-col justify-between py-4 pointer-events-none">
        {leftLights.map((i) => (
          <div key={`l-${i}`} className="fairy-light" style={{ animationDelay: `${i * 0.2 + 0.3}s` }} />
        ))}
      </div>
      {/* Right fairy lights */}
      <div className="fixed top-0 right-0 w-2 h-full z-[60] flex flex-col justify-between py-4 pointer-events-none">
        {rightLights.map((i) => (
          <div key={`r-${i}`} className="fairy-light" style={{ animationDelay: `${i * 0.2 + 0.7}s` }} />
        ))}
      </div>
      {/* Corner decorations */}
      <div className="fixed top-1 left-1 z-[61] pointer-events-none fairy-corner-star">✦</div>
      <div className="fixed top-1 right-1 z-[61] pointer-events-none fairy-corner-star" style={{ animationDelay: '0.5s' }}>☪</div>
      <div className="fixed bottom-1 left-1 z-[61] pointer-events-none fairy-corner-star" style={{ animationDelay: '1s' }}>☪</div>
      <div className="fixed bottom-1 right-1 z-[61] pointer-events-none fairy-corner-star" style={{ animationDelay: '1.5s' }}>✦</div>
      {children}
    </div>
  );
}
