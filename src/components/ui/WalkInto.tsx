"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: React.ReactNode;
  /** How far back in the scene the element starts (scale). */
  from?: number;
  /** Perspective tilt in degrees while it is still far away. */
  tilt?: number;
  style?: React.CSSProperties;
}

/**
 * Walking down memory lane: the element waits deeper in the scene —
 * smaller, dimmer, tipped away like something seen up the path — and
 * scrubs up to meet you as you walk toward it. Reverses when you walk
 * back. Pure transform/opacity, tied to Lenis via ScrollTrigger.
 */
export function WalkInto({ children, from = 0.9, tilt = 12, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          scale: from,
          opacity: 0.25,
          rotateX: tilt,
          yPercent: 7,
          transformPerspective: 1100,
        },
        {
          scale: 1,
          opacity: 1,
          rotateX: 0,
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 98%",
            end: "top 42%",
            scrub: 0.45,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [from, tilt]);

  return (
    <div ref={ref} style={{ transformOrigin: "center 80%", willChange: "transform", ...style }}>
      {children}
    </div>
  );
}
