import { useRamadanTheme } from "@/App";

export function RamadanFrame({ children }: { children: React.ReactNode }) {
  const { isRamadan } = useRamadanTheme();

  if (!isRamadan) return <>{children}</>;

  const topLights = Array.from({ length: 30 }, (_, i) => i);
  const bottomLights = Array.from({ length: 30 }, (_, i) => i);
  const leftLights = Array.from({ length: 20 }, (_, i) => i);
  const rightLights = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="relative min-h-screen">
      {/* Top fairy lights */}
      <div className="fixed top-0 left-0 right-0 h-2 z-[60] flex justify-between px-4 pointer-events-none">
        {topLights.map((i) => (
          <div
            key={`t-${i}`}
            className="fairy-light"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      {/* Bottom fairy lights */}
      <div className="fixed bottom-0 left-0 right-0 h-2 z-[60] flex justify-between px-4 pointer-events-none">
        {bottomLights.map((i) => (
          <div
            key={`b-${i}`}
            className="fairy-light"
            style={{ animationDelay: `${i * 0.15 + 0.5}s` }}
          />
        ))}
      </div>
      {/* Left fairy lights */}
      <div className="fixed top-0 left-0 w-2 h-full z-[60] flex flex-col justify-between py-4 pointer-events-none">
        {leftLights.map((i) => (
          <div
            key={`l-${i}`}
            className="fairy-light"
            style={{ animationDelay: `${i * 0.2 + 0.3}s` }}
          />
        ))}
      </div>
      {/* Right fairy lights */}
      <div className="fixed top-0 right-0 w-2 h-full z-[60] flex flex-col justify-between py-4 pointer-events-none">
        {rightLights.map((i) => (
          <div
            key={`r-${i}`}
            className="fairy-light"
            style={{ animationDelay: `${i * 0.2 + 0.7}s` }}
          />
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
