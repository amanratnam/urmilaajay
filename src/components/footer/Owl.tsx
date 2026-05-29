"use client";

import { motion } from "framer-motion";

interface Props {
  size?: number;
}

/**
 * Small stylised owl in accent gold. Wings flap independently so the bird
 * looks alive while it carries the letter away.
 */
export function Owl({ size = 78 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ overflow: "visible" }}
    >
      {/* Soft glow behind */}
      <defs>
        <radialGradient id="owlGlow" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0%" stopColor="#C9A878" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#C9A878" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#owlGlow)" />

      {/* Tiny letter being carried in talons */}
      <motion.g
        animate={{ y: [0, 1.2, 0] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="42" y="84" width="16" height="11" rx="1.5" fill="#FAF9F6" stroke="#8B6E3F" strokeWidth="1.2" />
        <path d="M42 84 L50 90 L58 84" stroke="#8B6E3F" strokeWidth="1" fill="none" />
      </motion.g>

      {/* Body */}
      <ellipse cx="50" cy="58" rx="20" ry="22" fill="#8B6E3F" />
      <ellipse cx="50" cy="64" rx="13" ry="16" fill="#C9A878" opacity="0.55" />

      {/* Head */}
      <circle cx="50" cy="32" r="20" fill="#8B6E3F" />

      {/* Ear tufts */}
      <path d="M34 16 L40 11 L42 22 Z" fill="#8B6E3F" />
      <path d="M66 16 L60 11 L58 22 Z" fill="#8B6E3F" />

      {/* Eye discs */}
      <circle cx="42" cy="33" r="7" fill="#FAF9F6" />
      <circle cx="58" cy="33" r="7" fill="#FAF9F6" />
      <circle cx="42" cy="33" r="3" fill="#1F1B17" />
      <circle cx="58" cy="33" r="3" fill="#1F1B17" />
      {/* Eye highlights */}
      <circle cx="43" cy="32" r="0.9" fill="#FAF9F6" />
      <circle cx="59" cy="32" r="0.9" fill="#FAF9F6" />

      {/* Beak */}
      <path d="M47 39 L53 39 L50 44 Z" fill="#C9A878" />

      {/* Left wing — flapping */}
      <motion.g
        style={{ transformOrigin: "34px 52px", transformBox: "fill-box" } as React.CSSProperties}
        animate={{ rotate: [0, -42, 0] }}
        transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M30 48 Q 14 56, 18 72 Q 26 64, 34 56 Z" fill="#8B6E3F" />
      </motion.g>

      {/* Right wing — flapping */}
      <motion.g
        style={{ transformOrigin: "66px 52px", transformBox: "fill-box" } as React.CSSProperties}
        animate={{ rotate: [0, 42, 0] }}
        transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M70 48 Q 86 56, 82 72 Q 74 64, 66 56 Z" fill="#8B6E3F" />
      </motion.g>

      {/* A few sparkles around — like memory dust */}
      {[
        { cx: 18, cy: 22, r: 1 },
        { cx: 84, cy: 26, r: 1.2 },
        { cx: 92, cy: 60, r: 0.9 },
        { cx: 8, cy: 64, r: 0.9 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#C9A878"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
