"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Photo } from "@/types";
import { useIsMobile } from "@/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  photos: Photo[];
}

/**
 * Split hero: heartfelt copy on the left, two vertically auto-scrolling
 * photo marquees on the right. Mobile: text first, single marquee beneath.
 * Text and photos drift apart at different speeds on scroll (parallax).
 */
export function HeroSection({ photos }: Props) {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);

  // Parallax: as the hero scrolls away, the copy lifts faster than the
  // photo columns, giving the section physical depth.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
      };
      if (textRef.current) {
        gsap.fromTo(textRef.current, { yPercent: 0, opacity: 1 }, { yPercent: -14, opacity: 0.25, ease: "none", scrollTrigger: trigger });
      }
      if (marqueeWrapRef.current) {
        gsap.fromTo(marqueeWrapRef.current, { yPercent: 0 }, { yPercent: 8, ease: "none", scrollTrigger: trigger });
      }
    }, section);
    return () => ctx.revert();
  }, []);

  // Pick photos for the marquees — spread across the archive
  const pool = useMemo(() => (photos.length > 0 ? photos.slice(0, Math.min(photos.length, 14)) : []), [photos]);
  const colA = pool.filter((_, i) => i % 2 === 0).slice(0, 7);
  const colB = pool.filter((_, i) => i % 2 === 1).slice(0, 7);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100svh",
        background: "transparent",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.05fr 1fr",
        gridTemplateRows: isMobile ? "auto 1fr" : "1fr",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── LEFT — text ─────────────────────────────────────────────── */}
      <div
        ref={textRef}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: isMobile ? "104px 24px 36px" : "120px 56px 100px 7vw",
          gap: isMobile ? 22 : 28,
          zIndex: 5,
        }}
      >
        <span className="hero-eyebrow hero-reveal" style={{ animationDelay: "0.1s" }}>
          A memorial
        </span>

        <h1 className="hero-display hero-reveal" style={{ animationDelay: "0.25s" }}>
          <span>Urmila</span>
          <span className="hero-years">1980 – 2018</span>
          <br />
          <span className="hero-amp">&amp;&nbsp;</span>
          <span>Ajay</span>
          <span className="hero-years">1971 – 2021</span>
        </h1>

        <div
          className="hero-rule-in"
          style={{
            animationDelay: "0.6s",
            width: 56,
            height: 1,
            background: "var(--accent)",
            transformOrigin: "left",
          }}
        />

        <p className="hero-message hero-reveal" style={{ animationDelay: "0.8s" }}>
          Welcome to a <em className="w-600 it">peaceful memorial space</em>{" "}
          for <em className="w-700">Urmila</em> (mom) and{" "}
          <em className="w-700">Ajay</em> (dad). We (their kids and
          daughter-in-law) have created this website to let them{" "}
          <em className="w-600 it">live on the internet</em> and become a place
          for anyone who knew them to revisit the memories they shared, and
          to <em className="w-600 it">add their own</em>.
        </p>

        <p className="hero-message hero-reveal" style={{ animationDelay: "0.95s", marginTop: 8 }}>
          To <em className="w-700">mom</em> and <em className="w-700">dad</em>,
          we <em className="w-800">loved</em> you while you were on Earth, we{" "}
          <em className="w-900 it">love</em> you while you&apos;re in heaven,
          and we hope you&apos;re <em className="w-700">happier</em> than you
          ever were. <em className="w-900 it">Miss you, mom and dad.</em>
        </p>

        <span className="hero-sign hero-reveal" style={{ animationDelay: "1.15s" }}>
          — Aman, Aashi &amp; Shilpa
        </span>
      </div>

      {/* ── RIGHT — vertical marquees ───────────────────────────────── */}
      <div
        ref={marqueeWrapRef}
        style={{
          position: "relative",
          height: isMobile ? "58svh" : "100svh",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr",
          gap: isMobile ? 10 : 16,
          padding: isMobile ? "0 16px 24px" : "24px 5vw 24px 0",
          // A corridor of photographs: the two columns stand like gallery
          // walls angled toward the path you walk between them.
          perspective: 1300,
          perspectiveOrigin: "50% 42%",
          // Fade the photo columns into the living sky behind them
          // (a mask, not an overlay, so the atmosphere shows through).
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <MarqueeColumn photos={colA} direction="up" speed={isMobile ? 38 : 30} delay={0.5} tilt={isMobile ? 7 : 9} />
        <MarqueeColumn photos={colB} direction="down" speed={isMobile ? 32 : 24} offset={isMobile ? 40 : 64} delay={0.7} tilt={isMobile ? -7 : -9} />
      </div>

      {/* ── Scroll cue ──────────────────────────────────────────────── */}
      <div className="hero-scroll-cue" aria-hidden>
        <span className="hero-scroll-cue-label">scroll through their story</span>
        <span className="hero-scroll-cue-line" />
      </div>
    </section>
  );
}

interface MarqueeProps {
  photos: Photo[];
  direction: "up" | "down";
  /** Base drift in px/s. */
  speed: number;
  offset?: number;
  /** Entrance-reveal delay in seconds. */
  delay?: number;
  /** Corridor-wall angle in degrees (rotateY within the parent's perspective). */
  tilt?: number;
}

/**
 * rAF-driven vertical marquee. Drifts at `speed` and gently accelerates
 * with scroll velocity, so the columns feel alive instead of mechanical.
 * Loops seamlessly via modulo on the duplicated track's half-height.
 */
function MarqueeColumn({ photos, direction, speed, offset = 0, delay = 0, tilt = 0 }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Duplicate the list so the loop can wrap seamlessly at the halfway point
  const items = [...photos, ...photos];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || photos.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dir = direction === "up" ? 1 : -1;
    let raf = 0;
    let pos = 0;
    let last = performance.now();
    let lastScrollY = window.scrollY;
    let boost = 0; // smoothed scroll-velocity influence

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Scroll gives the columns a push: faster while the visitor scrolls
      // down, easing back to the base drift when they stop. Capped so a
      // hard upward fling slows but never fully reverses the motion.
      const sy = window.scrollY;
      const velocity = dt > 0 ? (sy - lastScrollY) / dt : 0;
      lastScrollY = sy;
      const target = Math.max(-0.6, Math.min(2.5, velocity / 800));
      boost += (target - boost) * Math.min(1, dt * 5);

      pos += dir * speed * (1 + boost) * dt;

      const half = track.scrollHeight / 2;
      if (half > 0) {
        const y = ((pos % half) + half) % half;
        track.style.transform = `translate3d(0, ${-y.toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction, speed, photos.length]);

  if (photos.length === 0) return <div />;

  return (
    <div
      className="marquee-col"
      style={
        {
          position: "relative",
          overflow: "hidden",
          paddingTop: offset,
          animationDelay: `${delay}s`,
          "--wall-tilt": `${tilt}deg`,
        } as React.CSSProperties
      }
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          willChange: "transform",
        }}
      >
        {items.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="marquee-item"
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: p.aspectRatio,
              overflow: "hidden",
              borderRadius: 3,
              background: "var(--bg-elevated)",
              flexShrink: 0,
              boxShadow: "var(--shadow)",
            }}
          >
            <Image
              src={p.src}
              alt=""
              fill
              sizes="(max-width: 768px) 45vw, 26vw"
              placeholder={p.blurDataURL ? "blur" : "empty"}
              blurDataURL={p.blurDataURL}
              draggable={false}
              style={{ objectFit: "cover", pointerEvents: "none", userSelect: "none" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
