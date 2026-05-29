"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Photo } from "@/types";

gsap.registerPlugin(ScrollTrigger);

interface PanelDef {
  eyebrow: string;
  lead: string;
  emph: string;
  tail?: string;
}

const PANELS: PanelDef[] = [
  { eyebrow: "first", lead: "You were our", emph: "beginning." },
  { eyebrow: "always", lead: "You taught us how to", emph: "love." },
  { eyebrow: "forever", lead: "We'll love you,", emph: "always." },
];

interface Props {
  photo: Photo | null;
}

/**
 * Pinned scroll section: the page sticks while three statement panels
 * cross-fade through (scrub-driven by ScrollTrigger), with a subtle photo
 * parallax in the background. Replaces the older Interstitial.
 */
export function PinnedSection({ photo }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const panels = section.querySelectorAll<HTMLElement>(".pinned-panel");
      if (panels.length === 0) return;

      // Pin the whole section while we scrub through the panels.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${(panels.length + 0.5) * window.innerHeight}`,
          pin: true,
          scrub: 1,
        },
      });

      panels.forEach((p, i) => {
        if (i > 0) {
          tl.to(panels[i - 1], { opacity: 0, y: -40, duration: 0.4, ease: "power2.in" });
        }
        tl.fromTo(
          p,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          i === 0 ? "+=0" : "<+0.05"
        );
        tl.to({}, { duration: 0.6 }); // hold
      });
      tl.to(panels[panels.length - 1], { opacity: 0, y: -40, duration: 0.4, ease: "power2.in" });

      // Subtle photo parallax through the pinned scroll
      if (photoRef.current) {
        gsap.fromTo(
          photoRef.current,
          { yPercent: -6, scale: 1.05 },
          {
            yPercent: 6,
            scale: 1.12,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${(panels.length + 0.5) * window.innerHeight}`,
              scrub: 1,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "100svh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Background photo (parallax) */}
      {photo && (
        <div
          ref={photoRef}
          style={{
            position: "absolute",
            inset: "-6% 0",
            zIndex: 0,
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
              opacity: 0.22,
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
                "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(250,249,246,0.55) 0%, rgba(250,249,246,0.85) 60%, rgba(250,249,246,1) 100%)",
            }}
          />
        </div>
      )}

      {/* Stacked panels — GSAP cross-fades through them */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        {PANELS.map((p, i) => (
          <div
            key={i}
            className="pinned-panel"
            style={{
              position: "absolute",
              maxWidth: 980,
              textAlign: "center",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          >
            <span
              className="hero-eyebrow"
              style={{ display: "block", marginBottom: 32 }}
            >
              {p.eyebrow}
            </span>
            <h2 className="pinned-statement">
              <span className="w-200">{p.lead}</span>{" "}
              <em>{p.emph}</em>
              {p.tail && <span className="w-200"> {p.tail}</span>}
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}
