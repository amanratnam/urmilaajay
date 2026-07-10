"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * VariableProximity — each letter's weight (and optional slant) responds to
 * how near the cursor is, so words quietly bloom into being as you read past
 * them, like ink darkening under a warm hand. Adapted from the reactbits
 * effect for this memorial: Playfair Display is a variable font on the
 * `wght` axis, so we interpolate 400 → 700 within a soft radius.
 *
 * Falls back to a static render (no per-letter spans, no listeners) under
 * prefers-reduced-motion or on touch devices, where there is no cursor to
 * respond to.
 */

interface Axis {
  name: string;
  from: number;
  to: number;
}

interface Props {
  text: string;
  /** e.g. "'wght' 400" */
  fromFontVariationSettings?: string;
  /** e.g. "'wght' 760" */
  toFontVariationSettings?: string;
  /** Influence radius in px. */
  radius?: number;
  falloff?: "linear" | "exponential" | "gaussian";
  className?: string;
  style?: React.CSSProperties;
}

function parseSettings(from: string, to: string): Axis[] {
  const re = /'([^']+)'\s+([\d.]+)/g;
  const fromMap = new Map<string, number>();
  const toMap = new Map<string, number>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(from))) fromMap.set(m[1], parseFloat(m[2]));
  re.lastIndex = 0;
  while ((m = re.exec(to))) toMap.set(m[1], parseFloat(m[2]));
  const axes: Axis[] = [];
  fromMap.forEach((v, name) => {
    axes.push({ name, from: v, to: toMap.get(name) ?? v });
  });
  return axes;
}

export function VariableProximity({
  text,
  fromFontVariationSettings = "'wght' 400",
  toFontVariationSettings = "'wght' 720",
  radius = 105,
  falloff = "gaussian",
  className,
  style,
}: Props) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const axes = useMemo(
    () => parseSettings(fromFontVariationSettings, toFontVariationSettings),
    [fromFontVariationSettings, toFontVariationSettings]
  );

  // Pre-split into words (kept unbreakable) and letters.
  const words = useMemo(() => text.split(" "), [text]);

  useEffect(() => {
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced) return;

    const mouse = { x: -9999, y: -9999 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const falloffFn = (dist: number) => {
      const n = Math.min(1, Math.max(0, dist / radius));
      if (falloff === "linear") return 1 - n;
      if (falloff === "exponential") return (1 - n) * (1 - n);
      // gaussian
      return Math.exp(-(n * n) * 3.2);
    };

    const tick = () => {
      const container = containerRef.current;
      if (container) {
        for (const el of letterRefs.current) {
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = mouse.x - cx;
          const dy = mouse.y - cy;
          const dist = Math.hypot(dx, dy);
          const t = dist > radius ? 0 : falloffFn(dist);
          const settings = axes
            .map((a) => `'${a.name}' ${(a.from + (a.to - a.from) * t).toFixed(1)}`)
            .join(", ");
          el.style.fontVariationSettings = settings;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [axes, radius, falloff]);

  let idx = -1;
  return (
    <span
      ref={containerRef}
      className={className}
      style={{ display: "inline", ...style }}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }} aria-hidden>
          {Array.from(word).map((ch, ci) => {
            idx += 1;
            const at = idx;
            return (
              <span
                key={ci}
                ref={(el) => {
                  letterRefs.current[at] = el;
                }}
                style={{
                  display: "inline-block",
                  fontVariationSettings: fromFontVariationSettings,
                  willChange: "font-variation-settings",
                }}
              >
                {ch}
              </span>
            );
          })}
          {wi < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
