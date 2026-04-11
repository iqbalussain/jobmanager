import Particles from "react-tsparticles";

export default function ParticleBackground() {
  return (
    <Particles
      className="absolute inset-0 -z-10"
      options={{
        background: { color: "transparent" },
        particles: {
          number: { value: 40, density: { enable: true, area: 800 } },
          size: { value: 2, random: { enable: true, minimumValue: 1 } },
          move: { speed: 0.5, direction: "none", random: true, outModes: "out" },
          links: {
            enable: true,
            distance: 120,
            color: "#00ffcc",
            opacity: 0.2,
            width: 1,
          },
          color: { value: "#00ffcc" },
          opacity: { value: 0.4, random: false },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            onClick: { enable: true, mode: "push" },
          },
          modes: {
            grab: { distance: 140, links: { opacity: 0.4 } },
            push: { quantity: 2 },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
