"use client";

import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  children: React.ReactNode;
  /** Rise distance in px. */
  y?: number;
  /** Tip the element back in 3D and unfold it upright as it enters. */
  unfold?: boolean;
  /** Soft-focus blur that resolves as the element arrives (text only —
      avoid on large images, where filter animation is expensive). */
  blur?: boolean;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * The house scroll-reveal: elements rise into place like memories
 * surfacing — a slow ease, optional perspective unfold, optional
 * soft-focus resolve. Once revealed they stay; nothing re-plays.
 * Renders children statically under prefers-reduced-motion.
 */
export function Reveal({
  children,
  y = 48,
  unfold = false,
  blur = false,
  delay = 0,
  duration = 1.3,
  style,
  className,
}: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y,
        ...(unfold ? { rotateX: 12 } : {}),
        ...(blur ? { filter: "blur(7px)" } : {}),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        ...(unfold ? { rotateX: 0 } : {}),
        ...(blur ? { filter: "blur(0px)" } : {}),
      }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration, delay, ease }}
      style={{
        ...(unfold ? { transformPerspective: 1100, transformOrigin: "center 85%" } : {}),
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
