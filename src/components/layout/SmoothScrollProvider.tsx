"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/hooks/useLenis";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLenis();
  const barRef = useRef<HTMLDivElement>(null);

  // Hairline scroll-progress indicator along the top edge.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <div ref={barRef} className="scroll-progress" aria-hidden />
      {children}
    </>
  );
}
