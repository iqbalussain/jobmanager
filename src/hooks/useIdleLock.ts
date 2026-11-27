import { useCallback, useEffect, useRef, useState } from "react";

export const IDLE_LOCK_MS = 15 * 60 * 1000;
const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "wheel", "scroll"] as const;

/** Returns `locked` once there has been no mouse, keyboard or touch activity for `timeout` ms. */
export function useIdleLock(enabled: boolean, timeout = IDLE_LOCK_MS) {
  const [locked, setLocked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReset = useRef(0);

  const arm = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLocked(true), timeout);
  }, [timeout]);

  useEffect(() => {
    if (!enabled || locked) return;
    arm();
    const onActivity = () => {
      const now = Date.now();
      if (now - lastReset.current < 1000) return;
      lastReset.current = now;
      arm();
    };
    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true, capture: true }));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }));
    };
  }, [enabled, locked, arm]);

  return { locked, unlock: () => setLocked(false) };
}
