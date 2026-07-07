"use client";

import type Lenis from "lenis";

/**
 * Smooth-travel to an anchor (or the top) through Lenis when it's mounted,
 * falling back to native smooth scrolling. Keeps every in-page journey —
 * nav links, the mobile dock — feeling like the same slow camera move.
 */
export function smoothScrollTo(target: string | 0, offset = 0) {
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;

  if (lenis) {
    lenis.scrollTo(target === 0 ? 0 : target, {
      offset,
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    return;
  }

  if (target === 0) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.querySelector(target);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}
