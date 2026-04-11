import { useCallback, useRef } from "react";

export function useGamingSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  };

  const playTone = useCallback(
    (freq: number, duration = 0.08, type: OscillatorType = "square") => {
      if (!enabled) return;
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {}
    },
    [enabled]
  );

  const playClick = useCallback(() => playTone(800, 0.06), [playTone]);
  const playHover = useCallback(() => playTone(1200, 0.04, "sine"), [playTone]);
  const playSelect = useCallback(() => {
    playTone(600, 0.08);
    setTimeout(() => playTone(900, 0.08), 80);
  }, [playTone]);
  const playBoot = useCallback(() => {
    playTone(200, 0.15, "sawtooth");
    setTimeout(() => playTone(400, 0.15, "sawtooth"), 150);
    setTimeout(() => playTone(800, 0.2, "sawtooth"), 300);
  }, [playTone]);

  return { playClick, playHover, playSelect, playBoot };
}
