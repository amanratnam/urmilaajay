"use client";

import { motion } from "framer-motion";

/**
 * Memorial illustration — two birds in flight (mom + dad), three small birds
 * following (us), arcing toward a soft sun-on-horizon, with scattered stars
 * for memories. Hand-drawn line-art in the accent gold.
 */
export function MemorialIllustration() {
  return (
    <motion.svg
      width="260"
      height="160"
      viewBox="0 0 260 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "block" }}
    >
      {/* Soft halo behind the sun */}
      <defs>
        <radialGradient id="sunGlow" cx="0.5" cy="1" r="0.7">
          <stop offset="0%" stopColor="#C9A878" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#C9A878" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#C9A878" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="130" cy="158" rx="118" ry="50" fill="url(#sunGlow)" />

      {/* Sun arc on the horizon */}
      <path
        d="M68 158 A 62 62 0 0 1 192 158"
        stroke="#8B6E3F"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      {/* Horizon line */}
      <line x1="20" y1="158" x2="240" y2="158" stroke="#8B6E3F" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 5" />

      {/* Two large birds — mom + dad, in formation, drifting upward */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M82 56 q 9 -10 18 0 q 9 -10 18 0" stroke="#8B6E3F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.g
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 5, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M140 36 q 9 -10 18 0 q 9 -10 18 0" stroke="#8B6E3F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Three smaller birds following — kids */}
      <motion.g
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 4.5, delay: 0.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M52 102 q 5 -5 10 0 q 5 -5 10 0" stroke="#8B6E3F" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.85" />
      </motion.g>
      <motion.g
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 4.5, delay: 1.0, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M118 116 q 5 -5 10 0 q 5 -5 10 0" stroke="#8B6E3F" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.85" />
      </motion.g>
      <motion.g
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 4.5, delay: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M186 108 q 5 -5 10 0 q 5 -5 10 0" stroke="#8B6E3F" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.85" />
      </motion.g>

      {/* Scattered stars — memories */}
      {[
        { cx: 30, cy: 28, r: 1.2 },
        { cx: 62, cy: 22, r: 1.6 },
        { cx: 220, cy: 16, r: 1.4 },
        { cx: 245, cy: 50, r: 1 },
        { cx: 18, cy: 70, r: 1 },
        { cx: 200, cy: 78, r: 1.2 },
        { cx: 110, cy: 14, r: 1.8 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#8B6E3F"
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 3 + (i % 3), delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </motion.svg>
  );
}
