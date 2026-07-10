"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Photo } from "@/types";

gsap.registerPlugin(ScrollTrigger);

interface PanelDef {
  eyebrow: string;
  lead: string;
  emph: string;
}

// Mostly about mom — with dad held close.
const PANELS: PanelDef[] = [
  { eyebrow: "mom", lead: "She was our", emph: "beginning." },
  { eyebrow: "her love", lead: "She taught us how to", emph: "love." },
  { eyebrow: "dad", lead: "He showed us how to be", emph: "strong." },
  { eyebrow: "forever", lead: "We'll love you both,", emph: "always." },
];

// Depth geometry of the corridor (in CSS px, before perspective).
const GAP = 560; // z-distance between consecutive statements
const BEAD_SPACING = 46; // z-distance between thread beads
const TRAIL = 420; // extra thread depth beyond the last statement

interface Props {
  photo: Photo | null;
}

/**
 * A walk deeper into memory. The statements are strung along a corridor
 * that recedes INTO the screen; a thread of small lights leads from each
 * one to the next. As you scroll, the camera flies forward down the
 * thread — the current line resolves at the surface, then dissolves past
 * you as the next rises out of the depth ahead.
 *
 * Real CSS 3D: a `perspective` scene with a `preserve-3d` camera we push
 * along Z on scroll. Per-frame opacity/scale keep only the nearest line
 * legible. Reduced-motion collapses it to a plain vertical fade.
 */
export function PinnedSection({ photo }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const beadRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Thread beads fill the whole corridor depth.
  const beadDepths = useMemo(() => {
    const total = (PANELS.length - 1) * GAP + TRAIL;
    const n = Math.ceil(total / BEAD_SPACING);
    return Array.from({ length: n }, (_, i) => i * BEAD_SPACING);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const camera = cameraRef.current;
    if (!section || !camera) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
      const beads = beadRefs.current.filter(Boolean) as HTMLSpanElement[];
      const lastZ = (PANELS.length - 1) * GAP;

      // ── Reduced motion: a plain, restful vertical fade sequence ──
      if (reduced) {
        panels.forEach((p, i) => (p.style.opacity = i === 0 ? "1" : "0"));
        return;
      }

      // The camera transform alone moves the world through Z. Elements keep
      // their fixed resting depth (set inline once); here we only compute how
      // "near" the camera each one is — so far things stay dim & soft, the
      // focal line is crisp, and passing lines swell and dissolve.
      const place = (cameraZ: number) => {
        panels.forEach((p, i) => {
          const eff = i * GAP - cameraZ; // <0 passed the camera, >0 still ahead
          // Legible only within one gap of the focal plane.
          const t = Math.min(1, Math.abs(eff) / (GAP * 0.82));
          const opacity =
            eff < -GAP * 0.5 ? Math.max(0, 1 - (-eff - GAP * 0.5) / (GAP * 0.5)) : 1 - t;
          p.style.opacity = Math.max(0, opacity).toFixed(3);
          const blur = eff > 0 ? t * 5 : 0; // only lines still ahead are hazy
          p.style.filter = blur > 0.15 ? `blur(${blur.toFixed(1)}px)` : "none";
        });

        beads.forEach((b, i) => {
          const eff = beadDepths[i] - cameraZ;
          // Fade beads that have slipped behind the camera or are far in the haze.
          let o = 1;
          if (eff < 40) o = Math.max(0, eff / 40); // passing the camera
          else if (eff > lastZ + TRAIL - 260) o = Math.max(0, (lastZ + TRAIL - eff) / 260);
          b.style.opacity = (o * 0.9).toFixed(3);
        });
      };

      place(0);

      const pinDistance = () => (PANELS.length + 0.4) * 0.62 * window.innerHeight;
      const photo = photoRef.current;

      // Drive the camera straight from the trigger's own smoothed progress —
      // simplest, most reliable path (no proxy tween to fall out of sync).
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${pinDistance()}`,
        pin: true,
        scrub: 0.7,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const z = self.progress * lastZ;
          camera.style.transform = `translateZ(${z.toFixed(1)}px)`;
          place(z);
          if (photo) {
            const p = self.progress;
            photo.style.transform = `translateY(${(-8 + p * 16).toFixed(2)}%) scale(${(1.06 + p * 0.1).toFixed(3)})`;
          }
        },
      });

      // Positions depend on images/fonts that settle after mount.
      ScrollTrigger.refresh();
    }, section);

    return () => ctx.revert();
  }, [beadDepths]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "100svh",
        overflow: "hidden",
        background: "transparent",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Background photo (parallax) */}
      {photo && (
        <div
          ref={photoRef}
          style={{
            position: "absolute",
            inset: "-8% 0",
            zIndex: 0,
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          }}
        >
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="100vw"
            draggable={false}
            placeholder={photo.blurDataURL ? "blur" : "empty"}
            blurDataURL={photo.blurDataURL}
            style={{
              objectFit: "cover",
              opacity: 0.2,
              filter: "saturate(0.85)",
              pointerEvents: "none",
              mixBlendMode: "multiply",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(250,249,246,0.55) 0%, rgba(250,249,246,0.82) 60%, rgba(250,249,246,0.94) 100%)",
            }}
          />
        </div>
      )}

      {/* 3D corridor */}
      <div
        className="pp-scene"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          perspective: "820px",
          perspectiveOrigin: "50% 46%",
        }}
      >
        <div
          ref={cameraRef}
          className="pp-camera"
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* Thread of lights receding into the corridor */}
          {beadDepths.map((z, i) => (
            <span
              key={`bead-${i}`}
              ref={(el) => {
                beadRefs.current[i] = el;
              }}
              className="pp-bead"
              style={{ transform: `translate(-50%, -50%) translateZ(${(-z).toFixed(1)}px)` }}
              aria-hidden
            />
          ))}

          {/* Statements at increasing depth */}
          {PANELS.map((p, i) => (
            <div
              key={i}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="pinned-panel pp-panel"
              style={{
                transform: `translate(-50%, -50%) translateZ(${(-i * GAP).toFixed(1)}px)`,
                opacity: i === 0 ? 1 : 0,
              }}
            >
              <span className="hero-eyebrow pinned-eyebrow" style={{ display: "block", marginBottom: 22 }}>
                {p.eyebrow}
              </span>
              <h2 className="pinned-statement">
                {p.lead} <em>{p.emph}</em>
              </h2>
            </div>
          ))}
        </div>

        {/* A soft foreground haze so beads dissolve as they reach you */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 60% 60% at 50% 46%, transparent 58%, rgba(250,249,246,0.5) 100%)",
          }}
        />
      </div>
    </section>
  );
}
