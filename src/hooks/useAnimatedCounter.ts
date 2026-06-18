import { useState, useEffect } from "react";

/** Animă un contor de la 0 la `target` (cu easing) când `start` devine true. */
export function useAnimatedCounter(
  target: string | number,
  duration: number,
  start: boolean
): number {
  const [c, setC] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number | null = null;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ""));
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / (duration || 1800), 1);
      setC(Math.floor((1 - Math.pow(1 - p, 3)) * num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return c;
}
