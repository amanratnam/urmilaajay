"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Desktop-only "view" hover badge. The native OS cursor stays visible
 * everywhere; this just adds a soft gold circle with a label when hovering
 * a [data-cursor] element. Renders nothing on touch / coarse-pointer devices.
 */
export function CustomCursor() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("view");

  useEffect(() => {
    // Only on hover-capable, fine-pointer devices (desktop mouse) —
    // touch / mobile report "(hover: none)" and are excluded.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const badge = badgeRef.current;
    if (!badge) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let bx = x;
    let by = y;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      bx = lerp(bx, x, 0.2);
      by = lerp(by, y, 0.2);
      badge.style.left = `${bx}px`;
      badge.style.top = `${by}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest("[data-cursor]");
      if (t) {
        setLabel((t as HTMLElement).dataset.cursor || "view");
        setVisible(true);
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-cursor]")) setVisible(false);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={badgeRef} className={`cursor-view ${visible ? "cursor-visible" : ""}`}>
      {label}
    </div>
  );
}
