"use client";

import { useEffect, useState } from "react";

/**
 * iOS-Safari-style chrome behavior: report whether the page furniture
 * should hide (scrolling down, away from the top) or show (scrolling up,
 * near the top, or resting). rAF-throttled; a small threshold prevents
 * flicker from tiny scroll jitters.
 */
export function useChromeHidden(threshold = 14): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    let ticking = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const dy = y - lastY;

      if (y < 80) {
        setHidden(false);
      } else if (dy > threshold) {
        setHidden(true);
      } else if (dy < -threshold) {
        setHidden(false);
      } else {
        return; // below threshold — keep lastY so slow drift accumulates
      }
      lastY = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
      // When the scroll comes to rest, the furniture quietly returns —
      // hiding is only for the act of reading downward, never a dead end.
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        lastY = window.scrollY;
        setHidden(false);
      }, 900);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [threshold]);

  return hidden;
}
