"use client";

import { useRef, useCallback, useEffect } from "react";

// Gentle words drifting in CSS-3D space behind the hero content.
const WORDS = [
  { text: "remembered", x: "12%", y: "22%", z: -260, size: 30, delay: 0 },
  { text: "always", x: "78%", y: "30%", z: -340, size: 26, delay: 1.4 },
  { text: "love", x: "20%", y: "72%", z: -180, size: 38, delay: 0.8 },
  { text: "forever", x: "82%", y: "68%", z: -300, size: 28, delay: 2.1 },
  { text: "home", x: "50%", y: "14%", z: -420, size: 22, delay: 1.0 },
  { text: "light", x: "66%", y: "84%", z: -240, size: 24, delay: 1.8 },
];

export function FloatingWords() {
  const layerRef = useRef<HTMLDivElement>(null);

  // Parallax toward the cursor (whole layer rotates subtly)
  const onMove = useCallback((e: MouseEvent) => {
    const el = layerRef.current;
    if (!el) return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    el.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [onMove]);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        perspective: 900,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        ref={layerRef}
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {WORDS.map((w) => (
          <span
            key={w.text}
            style={{
              position: "absolute",
              left: w.x,
              top: w.y,
              transform: `translate(-50%, -50%) translateZ(${w.z}px)`,
              transformStyle: "preserve-3d",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontFamily: "Fraunces, Georgia, serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: w.size,
                color: "var(--accent)",
                opacity: 0.14,
                whiteSpace: "nowrap",
                animation: `floatWord 9s ease-in-out ${w.delay}s infinite`,
              }}
            >
              {w.text}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
