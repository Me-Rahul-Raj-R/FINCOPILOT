import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 (or the previous value) to `value` over `duration` ms
 * using requestAnimationFrame with an ease-out curve. Pure visual polish -
 * falls back instantly to the final value if the user prefers reduced
 * motion, and on first paint we count up from 0 so the dashboard feels
 * alive rather than just blinking numbers into place.
 */
export default function AnimatedNumber({ value, duration = 700, formatter }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const target = Number(value) || 0;

    if (prefersReduced) {
      setDisplay(target);
      prevValue.current = target;
      return;
    }

    const start = prevValue.current;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + (target - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = target;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{formatter ? formatter(display) : display}</>;
}
