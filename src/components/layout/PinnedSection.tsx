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
}

// Mostly about mom — with dad held close.
const PANELS: PanelDef[] = [
  { eyebrow: "mom", lead: "She was our", emph: "beginning." },
  { eyebrow: "her love", lead: "She taught us how to", emph: "love." },
  { eyebrow: "dad", lead: "He showed us how to be", emph: "strong." },
  { eyebrow: "forever", lead: "We'll love you both,", emph: "always." },
];

interface Props {
  photo: Photo | null;
}

/** Split a string into per-character spans GSAP can stagger. */
function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, wi, arr) => (
        <span key={wi} aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {Array.from(word).map((ch, ci) => (
            <span key={ci} className="pp-char" style={{ display: "inline-block" }}>
              {ch}
            </span>
          ))}
          {wi < arr.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

/**
 * Pinned scroll section: the page holds still while four statements write
 * themselves in, character by character, scrub-driven — with mom's photo
 * breathing gently behind them.
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

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ~0.65 viewport of scroll per statement — present, not endless.
      const pinDistance = () => panels.length * 0.65 * window.innerHeight;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${pinDistance()}`,
          pin: true,
          scrub: reduced ? false : 0.8,
        },
      });

      panels.forEach((p, i) => {
        const eyebrow = p.querySelector(".pinned-eyebrow");
        const chars = p.querySelectorAll(".pp-char");

        if (i > 0) {
          tl.to(panels[i - 1], { opacity: 0, y: -36, duration: 0.35, ease: "power2.in" });
        }
        tl.set(p, { opacity: 1 });
        if (eyebrow) {
          tl.fromTo(
            eyebrow,
            { opacity: 0, letterSpacing: "0.55em" },
            { opacity: 1, letterSpacing: "0.26em", duration: 0.4, ease: "power2.out" },
            i === 0 ? "+=0" : "<+0.05"
          );
        }
        // Characters write themselves in as you scroll.
        tl.fromTo(
          chars,
          { opacity: 0, y: "0.5em", filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "power2.out",
            stagger: { each: 0.018 },
          },
          "<"
        );
        tl.to({}, { duration: 0.45 }); // hold so the line can land
      });
      tl.to(panels[panels.length - 1], { opacity: 0, y: -36, duration: 0.35, ease: "power2.in" });

      // Photo parallax: slow drift + gentle zoom through the whole pin.
      if (photoRef.current && !reduced) {
        gsap.fromTo(
          photoRef.current,
          { yPercent: -8, scale: 1.06 },
          {
            yPercent: 8,
            scale: 1.16,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${pinDistance()}`,
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
            inset: "-8% 0",
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

      {/* Stacked panels — GSAP writes each statement in, then lets it go */}
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
              className="hero-eyebrow pinned-eyebrow"
              style={{ display: "block", marginBottom: 28 }}
            >
              {p.eyebrow}
            </span>
            <h2 className="pinned-statement">
              <Chars text={p.lead} className="w-200" />{" "}
              <em>
                <Chars text={p.emph} />
              </em>
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}
