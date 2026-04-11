import { useMemo } from "react";

export default function ParticleBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${1 + Math.random() * 3}px`,
        duration: `${6 + Math.random() * 5}s`,
        delay: `${Math.random() * 4}s`,
      })),
    []
  );

  return (
    <div className="particle-background absolute inset-0 -z-10">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="particle-dot"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
