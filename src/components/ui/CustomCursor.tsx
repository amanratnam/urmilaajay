"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    const labelEl = labelRef.current;
    if (!dot || !labelEl) return;

    let x = 0;
    let y = 0;
    let dotX = 0;
    let dotY = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      dotX = lerp(dotX, x, 0.12);
      dotY = lerp(dotY, y, 0.12);
      dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      labelEl.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove);

    const onEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tile = target.closest("[data-cursor]");
      if (tile) {
        const cursorLabel = (tile as HTMLElement).dataset.cursor ?? "view";
        setLabel(cursorLabel);
        setIsHovering(true);
      }
    };

    const onLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tile = target.closest("[data-cursor]");
      if (tile) {
        setIsHovering(false);
        setLabel("");
      }
    };

    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot ${isHovering ? "cursor-hover" : ""}`}
      />
      <div
        ref={labelRef}
        className={`cursor-label ${isHovering ? "cursor-hover" : ""}`}
      >
        {label}
      </div>
    </>
  );
}
