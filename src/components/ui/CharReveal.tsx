"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * "scrub" ties the reveal to scroll position (characters paint in as you
   * scroll through); "enter" plays once when the element scrolls into view.
   */
  mode?: "scrub" | "enter";
  /** Where the reveal begins, as a ScrollTrigger start string. */
  start?: string;
  /** Seconds between characters in "enter" mode. */
  stagger?: number;
}

/**
 * Splits text into characters and reveals them on scroll — soft rise,
 * fade and un-blur, like ink settling on paper. Words stay unbreakable.
 */
export function CharReveal({
  text,
  className,
  style,
  mode = "scrub",
  start = "top 88%",
  stagger = 0.018,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  const words = useMemo(() => text.split(" "), [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLElement>(".cr-char");
    if (chars.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(chars, { opacity: 1, y: 0, filter: "none" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0.08, y: "0.45em", filter: "blur(5px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power2.out",
          stagger: mode === "scrub" ? { each: 0.03 } : { each: stagger },
          duration: mode === "scrub" ? 0.6 : 0.7,
          scrollTrigger:
            mode === "scrub"
              ? { trigger: el, start, end: "top 40%", scrub: 0.6 }
              : { trigger: el, start, toggleActions: "play none none none" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [mode, start, stagger, text]);

  return (
    <span ref={ref} className={className} style={style} aria-label={text}>
      {words.map((word, wi) => (
        <span
          key={wi}
          aria-hidden
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {Array.from(word).map((ch, ci) => (
            <span
              key={ci}
              className="cr-char"
              style={{ display: "inline-block", willChange: "transform, opacity" }}
            >
              {ch}
            </span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
