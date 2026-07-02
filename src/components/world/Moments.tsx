"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Recurring figurine moments — mom and dad, stylized like handcrafted
 * peg dolls, quietly continuing their life between the sections:
 * walking together, sharing tea at sunset, watching the stars.
 *
 * No faces, no words, nothing addressed to the visitor. They simply
 * keep living, and the page walks past them.
 */

const ease = [0.22, 1, 0.36, 1] as const;

// Handcrafted, muted palette (never saturated)
const SKIN = "#E7D3BA";
const MOM = "#96A382"; // muted sage dress
const MOM_HAIR = "#4E4034";
const DAD = "#8A6F55"; // warm brown
const DAD_HAIR = "#3E362D";
const WOOD = "#7A6248";
const LEAF = "#9AA98B";
const LEAF_DEEP = "#7E8F70";
const GOLD = "#C9A878";
const LINE = "#8B6E3F";

/* ── Peg-doll figures ─────────────────────────────────────────────── */

function StandingFigure({
  x,
  y,
  h,
  color,
  hair,
}: {
  x: number;
  y: number; // ground line
  h: number; // body height
  color: string;
  hair: "bun" | "cap";
}) {
  const w = h * 0.56;
  const headR = w * 0.42;
  const headY = -h - headR * 0.62;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* soft ground shadow */}
      <ellipse cx="0" cy="2" rx={w * 0.7} ry="3" fill={LINE} opacity="0.12" />
      {/* body — a rounded dome, like a carved figurine */}
      <path
        d={`M ${-w / 2} 0 Q ${-w / 2} ${-h} 0 ${-h} Q ${w / 2} ${-h} ${w / 2} 0 Z`}
        fill={color}
      />
      {/* head */}
      <circle cx="0" cy={headY} r={headR} fill={SKIN} />
      {hair === "bun" ? (
        <>
          <path
            d={`M ${-headR} ${headY} A ${headR} ${headR} 0 0 1 ${headR} ${headY} Z`}
            fill={MOM_HAIR}
          />
          <circle cx={headR * 0.85} cy={headY - headR * 0.75} r={headR * 0.4} fill={MOM_HAIR} />
        </>
      ) : (
        <path
          d={`M ${-headR} ${headY - headR * 0.1} A ${headR} ${headR} 0 0 1 ${headR} ${headY - headR * 0.1} L ${headR * 0.8} ${headY - headR * 0.35} A ${headR * 0.85} ${headR * 0.85} 0 0 0 ${-headR * 0.8} ${headY - headR * 0.35} Z`}
          fill={DAD_HAIR}
        />
      )}
    </g>
  );
}

function SeatedFigure({
  x,
  y,
  h,
  color,
  hair,
  lean = 0,
}: {
  x: number;
  y: number; // seat line
  h: number;
  color: string;
  hair: "bun" | "cap";
  lean?: number; // degrees, + leans right
}) {
  const w = h * 0.72;
  const headR = w * 0.4;
  const headY = -h - headR * 0.6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean})`}>
      <path
        d={`M ${-w / 2} 0 Q ${-w / 2} ${-h} 0 ${-h} Q ${w / 2} ${-h} ${w / 2} 0 Z`}
        fill={color}
      />
      <circle cx="0" cy={headY} r={headR} fill={SKIN} />
      {hair === "bun" ? (
        <>
          <path
            d={`M ${-headR} ${headY} A ${headR} ${headR} 0 0 1 ${headR} ${headY} Z`}
            fill={MOM_HAIR}
          />
          <circle cx={headR * 0.85} cy={headY - headR * 0.75} r={headR * 0.4} fill={MOM_HAIR} />
        </>
      ) : (
        <path
          d={`M ${-headR} ${headY - headR * 0.1} A ${headR} ${headR} 0 0 1 ${headR} ${headY - headR * 0.1} L ${headR * 0.8} ${headY - headR * 0.35} A ${headR * 0.85} ${headR * 0.85} 0 0 0 ${-headR * 0.8} ${headY - headR * 0.35} Z`}
          fill={hair === "cap" ? DAD_HAIR : MOM_HAIR}
        />
      )}
    </g>
  );
}

/* ── Scene 1 · A walk together ────────────────────────────────────── */

function WalkScene({ still }: { still: boolean }) {
  return (
    <svg viewBox="0 0 640 320" width="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* morning sun */}
      <circle cx="104" cy="76" r="44" fill={GOLD} opacity="0.14" />
      <circle cx="104" cy="76" r="22" fill={GOLD} opacity="0.35" />

      {/* drifting clouds */}
      <motion.g
        animate={still ? undefined : { x: [0, 26, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
        opacity="0.55"
      >
        <ellipse cx="240" cy="58" rx="42" ry="11" fill="#F1EBDD" />
        <ellipse cx="268" cy="50" rx="26" ry="9" fill="#F1EBDD" />
      </motion.g>
      <motion.g
        animate={still ? undefined : { x: [0, -20, 0] }}
        transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
        opacity="0.45"
      >
        <ellipse cx="470" cy="40" rx="36" ry="10" fill="#F1EBDD" />
      </motion.g>

      {/* soft hills */}
      <path d="M0 268 Q 160 236 330 258 T 640 250 L 640 320 L 0 320 Z" fill={LEAF} opacity="0.22" />
      <path d="M0 288 Q 210 262 420 280 T 640 276 L 640 320 L 0 320 Z" fill={LEAF_DEEP} opacity="0.16" />

      {/* the tree — trunk and a breathing canopy */}
      <path
        d="M496 262 C 494 226 490 206 484 188 M496 262 C 498 224 504 204 512 190 M492 210 C 484 202 478 196 474 188"
        stroke={WOOD}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <motion.g
        style={{ transformOrigin: "494px 200px", transformBox: "view-box" } as React.CSSProperties}
        animate={still ? undefined : { scale: [1, 1.028, 1], rotate: [0, 0.6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="458" cy="158" r="38" fill={LEAF} opacity="0.92" />
        <circle cx="510" cy="140" r="46" fill={LEAF_DEEP} opacity="0.85" />
        <circle cx="548" cy="170" r="34" fill={LEAF} opacity="0.9" />
        <circle cx="500" cy="178" r="36" fill={LEAF} opacity="0.95" />
      </motion.g>

      {/* leaves letting go of the tree */}
      {[0, 1, 2].map((i) => (
        <motion.ellipse
          key={i}
          cx={470 + i * 34}
          cy={190}
          rx="4"
          ry="2.2"
          fill={LEAF_DEEP}
          initial={{ opacity: 0 }}
          animate={
            still
              ? { opacity: 0.5 }
              : {
                  y: [0, 70, 96],
                  x: [0, i % 2 === 0 ? -18 : 14, i % 2 === 0 ? -8 : 22],
                  rotate: [0, 140, 320],
                  opacity: [0, 0.7, 0],
                }
          }
          transition={{ duration: 7 + i * 1.6, delay: i * 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* mom & dad, walking — a gentle alternating bob */}
      <motion.g
        animate={still ? undefined : { y: [0, -2.5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <StandingFigure x={262} y={272} h={52} color={MOM} hair="bun" />
      </motion.g>
      <motion.g
        animate={still ? undefined : { y: [0, -2.5, 0] }}
        transition={{ duration: 2.2, delay: 1.1, repeat: Infinity, ease: "easeInOut" }}
      >
        <StandingFigure x={316} y={272} h={62} color={DAD} hair="cap" />
      </motion.g>
      {/* held hands */}
      <path d="M276 244 Q 289 238 302 242" stroke={SKIN} strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* small flowers along the path */}
      {[
        { x: 180, y: 286 },
        { x: 388, y: 292 },
        { x: 120, y: 296 },
      ].map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          <line x1="0" y1="0" x2="0" y2="-9" stroke={LEAF_DEEP} strokeWidth="1.4" />
          <circle cx="0" cy="-11" r="2.6" fill={GOLD} opacity="0.8" />
        </g>
      ))}
    </svg>
  );
}

/* ── Scene 2 · Evening tea ────────────────────────────────────────── */

function TeaScene({ still }: { still: boolean }) {
  return (
    <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* low sun, settling on the horizon behind them (half-discs only —
          the glow must never pool below the horizon line) */}
      <path d="M 228 238 A 92 92 0 0 1 412 238 Z" fill={GOLD} opacity="0.10" />
      <path d="M 264 238 A 56 56 0 0 1 376 238 Z" fill={GOLD} opacity="0.16" />
      <path d="M240 238 A 80 80 0 0 1 400 238" fill={GOLD} opacity="0.3" />
      <line x1="60" y1="238" x2="580" y2="238" stroke={LINE} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 6" />

      {/* the bench */}
      <g>
        <rect x="228" y="212" width="184" height="9" rx="4.5" fill={WOOD} />
        <rect x="240" y="221" width="7" height="26" rx="2" fill={WOOD} />
        <rect x="393" y="221" width="7" height="26" rx="2" fill={WOOD} />
        <rect x="228" y="178" width="184" height="6" rx="3" fill={WOOD} opacity="0.85" />
        <rect x="234" y="178" width="5" height="36" rx="2" fill={WOOD} opacity="0.85" />
        <rect x="401" y="178" width="5" height="36" rx="2" fill={WOOD} opacity="0.85" />
      </g>

      {/* seated together, leaning ever so slightly toward each other */}
      <motion.g
        animate={still ? undefined : { rotate: [0, 0.7, 0] }}
        style={{ transformOrigin: "292px 212px", transformBox: "view-box" } as React.CSSProperties}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <SeatedFigure x={292} y={212} h={44} color={MOM} hair="bun" lean={3} />
      </motion.g>
      <motion.g
        animate={still ? undefined : { rotate: [0, -0.7, 0] }}
        style={{ transformOrigin: "348px 212px", transformBox: "view-box" } as React.CSSProperties}
        transition={{ duration: 6, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <SeatedFigure x={348} y={212} h={52} color={DAD} hair="cap" lean={-3} />
      </motion.g>

      {/* two cups of tea, steam rising */}
      {[
        { x: 263, y: 196 },
        { x: 379, y: 192 },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y})`}>
          <path d="M-5 0 L5 0 L3.6 7 L-3.6 7 Z" fill="#F6F1E4" stroke={LINE} strokeWidth="0.8" />
          {[0, 1].map((s) => (
            <motion.path
              key={s}
              d={`M ${-1.5 + s * 3} -2 q 2.5 -4 0 -8 q -2.5 -4 0 -8`}
              stroke={GOLD}
              strokeWidth="1.1"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={still ? { opacity: 0.5 } : { opacity: [0, 0.75, 0], y: [2, -4, -9] }}
              transition={{
                duration: 3.4,
                delay: i * 0.9 + s * 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </g>
      ))}

      {/* a small bird resting on the bench arm */}
      <motion.g
        animate={still ? undefined : { y: [0, -1.6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="416" cy="172" rx="5" ry="4" fill={LINE} opacity="0.75" />
        <circle cx="421" cy="168" r="2.8" fill={LINE} opacity="0.75" />
        <path d="M423.5 168 L426.5 168.8 L423.5 169.6 Z" fill={GOLD} />
      </motion.g>

      {/* grass tufts */}
      {[120, 176, 462, 522].map((x, i) => (
        <motion.g
          key={i}
          style={{ transformOrigin: `${x}px 248px`, transformBox: "view-box" } as React.CSSProperties}
          animate={still ? undefined : { rotate: [0, i % 2 === 0 ? 3 : -3, 0] }}
          transition={{ duration: 3.6 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d={`M${x} 248 q -3 -8 -1 -14 M${x} 248 q 2 -9 5 -12 M${x} 248 q -1 -11 2 -16`}
            stroke={LEAF_DEEP}
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </motion.g>
      ))}
    </svg>
  );
}

/* ── Scene 3 · Watching the stars ─────────────────────────────────── */

function StarsScene({ still }: { still: boolean }) {
  const stars = [
    { x: 96, y: 44, r: 1.6 },
    { x: 170, y: 84, r: 1.1 },
    { x: 238, y: 36, r: 1.4 },
    { x: 322, y: 70, r: 1.8 },
    { x: 402, y: 30, r: 1.2 },
    { x: 470, y: 86, r: 1.5 },
    { x: 540, y: 48, r: 1.2 },
    { x: 588, y: 104, r: 1 },
    { x: 56, y: 112, r: 1 },
    { x: 288, y: 112, r: 1.1 },
  ];
  return (
    <svg viewBox="0 0 640 300" width="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* crescent moon */}
      <path
        d="M 512 58 A 30 30 0 1 0 542 96 A 24 24 0 1 1 512 58 Z"
        fill="#D9C296"
        opacity="0.9"
      />
      <circle cx="524" cy="76" r="40" fill={GOLD} opacity="0.12" />

      {/* twinkling stars — dusty gold so they read against the pale sky */}
      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r + 0.4}
          fill={GOLD}
          animate={still ? { opacity: 0.7 } : { opacity: [0.25, 0.9, 0.25] }}
          transition={{ duration: 2.6 + (i % 4) * 0.8, delay: i * 0.35, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* the night hill */}
      <path d="M0 246 Q 200 200 380 228 T 640 222 L 640 300 L 0 300 Z" fill="#6D7A63" opacity="0.4" />
      <path d="M0 272 Q 260 244 640 260 L 640 300 L 0 300 Z" fill="#5C6852" opacity="0.3" />

      {/* sitting close on the hill, her head resting toward him */}
      <motion.g
        animate={still ? undefined : { y: [0, -1.4, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <SeatedFigure x={296} y={238} h={46} color={MOM} hair="bun" lean={7} />
        <SeatedFigure x={344} y={234} h={54} color={DAD} hair="cap" lean={-4} />
      </motion.g>

      {/* fireflies wandering around them */}
      {[
        { x: 220, y: 200, d: 9 },
        { x: 420, y: 190, d: 11 },
        { x: 372, y: 250, d: 8 },
        { x: 254, y: 252, d: 12 },
      ].map((f, i) => (
        <motion.g
          key={i}
          animate={
            still
              ? undefined
              : {
                  x: [0, f.d, -f.d * 0.6, 0],
                  y: [0, -f.d * 0.7, f.d * 0.5, 0],
                }
          }
          transition={{ duration: 9 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx={f.x} cy={f.y} r="5" fill={GOLD} opacity="0.12" />
          <motion.circle
            cx={f.x}
            cy={f.y}
            r="1.5"
            fill="#E0BE82"
            animate={still ? { opacity: 0.8 } : { opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + i * 0.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
      ))}
    </svg>
  );
}

/* ── The divider that carries each moment ─────────────────────────── */

export type MomentName = "walk" | "tea" | "stars";

export function MomentDivider({ scene }: { scene: MomentName }) {
  const reduce = useReducedMotion();
  const still = !!reduce;

  return (
    <section
      aria-hidden
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        padding: "6vh 24px 4vh",
        background: "transparent",
        overflow: "hidden",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.div
        initial={{ opacity: 0, y: 44 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.7, ease }}
        style={{
          width: "min(88vw, 620px)",
          // Feather the scene's edges into the page so the ground never
          // reads as a floating card — it belongs to the world around it.
          WebkitMaskImage:
            "radial-gradient(ellipse 68% 74% at 50% 52%, black 42%, transparent 94%)",
          maskImage:
            "radial-gradient(ellipse 68% 74% at 50% 52%, black 42%, transparent 94%)",
        }}
      >
        {scene === "walk" && <WalkScene still={still} />}
        {scene === "tea" && <TeaScene still={still} />}
        {scene === "stars" && <StarsScene still={still} />}
      </motion.div>
    </section>
  );
}
