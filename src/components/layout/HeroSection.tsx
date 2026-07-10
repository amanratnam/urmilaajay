"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Photo } from "@/types";
import { useIsMobile } from "@/hooks/useMediaQuery";
import FloatingLines from "@/components/hero/FloatingLines";
import { VintagePhotoExpand } from "@/components/hero/VintagePhotoExpand";
import { VariableProximity } from "@/components/hero/VariableProximity";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  photos: Photo[];
}

/**
 * The hero as a hall of memories: a written remembrance floats in the middle
 * of the corridor while photographs drift up and down the walls on BOTH
 * sides. A WebGL layer of ink lines breathes behind everything and bends
 * away from the hand. Tapping any photograph lifts it out of the wall into
 * an old gilded frame while the world greys out.
 */
export function HeroSection({ photos }: Props) {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // A photograph is lifted only by intent — a click / tap. Works the same
  // on desktop and touch; the backdrop and Escape both return it.
  const [expanded, setExpanded] = useState<Photo | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const openedAtY = window.scrollY;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(null);
    };
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAtY) > 24) setExpanded(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [expanded]);

  // Parallax: the inscription lifts faster than the photo walls.
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
        gsap.fromTo(
          textRef.current,
          { yPercent: 0, opacity: 1 },
          { yPercent: -14, opacity: 0.25, ease: "none", scrollTrigger: trigger }
        );
      }
      gsap.fromTo(
        ".hero-wall",
        { yPercent: 0 },
        { yPercent: 8, ease: "none", scrollTrigger: trigger }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  // Distribute the archive across the walls: four columns on desktop
  // (two per side), two columns on mobile.
  const pool = useMemo(() => photos.slice(0, Math.min(photos.length, 24)), [photos]);
  const cols = useMemo(() => {
    const n = 4;
    const out: Photo[][] = Array.from({ length: n }, () => []);
    pool.forEach((p, i) => out[i % n].push(p));
    return out;
  }, [pool]);
  const mobilePool = pool.slice(0, 14);
  const mobileColA = mobilePool.filter((_, i) => i % 2 === 0);
  const mobileColB = mobilePool.filter((_, i) => i % 2 === 1);

  const paused = !!expanded;

  const select = (photo: Photo) => {
    setExpanded((cur) => (cur && cur.id === photo.id ? null : photo));
  };

  const columnProps = { paused, onSelect: select };

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100svh",
        background: "transparent",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : "minmax(0, 0.66fr) minmax(0, 1fr) minmax(0, 0.66fr)",
        gridTemplateRows: isMobile ? "auto 1fr" : "1fr",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── Ink lines breathing behind the whole hall ─────────────────
           Dimmed overall and masked away from the inscription so they
           whisper behind the text and sing along the walls. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          // Fainter overall so the remembrance stays perfectly legible…
          opacity: isMobile ? 0.2 : 0.32,
          // …and cleared away from the centre column entirely.
          WebkitMaskImage: isMobile
            ? "radial-gradient(ellipse 88% 60% at 50% 42%, transparent 0%, rgba(0,0,0,0.4) 62%, black 96%)"
            : "radial-gradient(ellipse 50% 58% at 50% 46%, transparent 0%, rgba(0,0,0,0.5) 58%, black 88%)",
          maskImage: isMobile
            ? "radial-gradient(ellipse 88% 60% at 50% 42%, transparent 0%, rgba(0,0,0,0.4) 62%, black 96%)"
            : "radial-gradient(ellipse 50% 58% at 50% 46%, transparent 0%, rgba(0,0,0,0.5) 58%, black 88%)",
        }}
      >
        <FloatingLines
          // The WebGL scene reads props once at mount; remount when the
          // mobile flag resolves so phones get the lighter config.
          key={isMobile ? "hall-m" : "hall-d"}
          inks={["#8B6E3F", "#B98F4E", "#7E8F70"]}
          enabledWaves={["top", "middle", "bottom"]}
          // Fewer, wider-spaced lines making grander, slower sweeps.
          lineCount={isMobile ? [2, 3, 2] : [2, 4, 2]}
          lineDistance={[120, 108, 120]}
          bendRadius={5}
          bendStrength={-2.6}
          interactive={!isMobile}
          parallax={!isMobile}
          animationSpeed={1.05}
        />
      </div>

      {/* ── LEFT wall (desktop only) ──────────────────────────────────── */}
      {!isMobile && (
        <Wall side="left">
          <MarqueeColumn photos={cols[0]} direction="up" speed={26} delay={0.55} tilt={10} {...columnProps} />
          <MarqueeColumn photos={cols[1]} direction="down" speed={21} offset={72} delay={0.75} tilt={7} {...columnProps} />
        </Wall>
      )}

      {/* ── CENTER — the inscription ──────────────────────────────────── */}
      <div
        ref={textRef}
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: isMobile ? "104px 24px 30px" : "110px 28px 96px",
          gap: isMobile ? 18 : 22,
        }}
      >
        <span className="hero-eyebrow hero-reveal" style={{ animationDelay: "0.1s" }}>
          In loving memory
        </span>

        <h1
          className="hero-display hero-reveal"
          style={{
            animationDelay: "0.25s",
            fontSize: isMobile ? undefined : "clamp(42px, 4.6vw, 76px)",
          }}
        >
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
            transformOrigin: "center",
          }}
        />

        {/* The remembrance — letters bloom under the cursor as you read. */}
        <p className="hero-obit hero-reveal" style={{ animationDelay: "0.8s" }}>
          <VariableProximity text="Urmila was our mother — the warmth of every morning, the softness of every hard day." />{" "}
          <VariableProximity text="Ajay was our father — steady as the earth, and quietly certain that we could become anything." />
        </p>

        <p className="hero-obit hero-reveal" style={{ animationDelay: "0.95s", marginTop: 2 }}>
          <VariableProximity text="They built a home out of small kindnesses and taught us that love is a thing you do — gently, and every day." />{" "}
          <em className="hero-obit-em">
            <VariableProximity
              text="They have left our rooms, but not our lives."
              fromFontVariationSettings="'wght' 500"
              toFontVariationSettings="'wght' 800"
            />
          </em>{" "}
          <VariableProximity text="Here, in photographs and letters and the memories you carry, they go on living. Wander slowly. Remember with us. And if you knew them, leave a little of your own." />
        </p>

        <span className="hero-sign hero-reveal" style={{ animationDelay: "1.15s" }}>
          — Aman, Aashi &amp; Shilpa
        </span>
      </div>

      {/* ── RIGHT wall (desktop) / BOTH columns (mobile) ─────────────── */}
      {!isMobile ? (
        <Wall side="right">
          <MarqueeColumn photos={cols[2]} direction="down" speed={22} offset={48} delay={0.65} tilt={-7} {...columnProps} />
          <MarqueeColumn photos={cols[3]} direction="up" speed={27} delay={0.85} tilt={-10} {...columnProps} />
        </Wall>
      ) : (
        <div
          className="hero-wall"
          style={{
            position: "relative",
            zIndex: 4,
            height: "56svh",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            padding: "0 16px 24px",
            perspective: 1100,
            perspectiveOrigin: "50% 42%",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          <MarqueeColumn photos={mobileColA} direction="up" speed={38} delay={0.5} tilt={7} {...columnProps} />
          <MarqueeColumn photos={mobileColB} direction="down" speed={32} offset={40} delay={0.7} tilt={-7} {...columnProps} />
        </div>
      )}

      {/* ── Scroll cue ──────────────────────────────────────────────── */}
      <div className="hero-scroll-cue" aria-hidden>
        <span className="hero-scroll-cue-label">scroll through their story</span>
        <span className="hero-scroll-cue-line" />
      </div>

      {/* ── The lifted portrait ─────────────────────────────────────── */}
      <VintagePhotoExpand photo={expanded} onClose={() => setExpanded(null)} />
    </section>
  );
}

/** One side of the corridor: two photo columns inside a shared perspective. */
function Wall({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <div
      className="hero-wall"
      style={{
        position: "relative",
        zIndex: 4,
        height: "100svh",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        padding: side === "left" ? "24px 8px 24px 3.5vw" : "24px 3.5vw 24px 8px",
        perspective: 1300,
        perspectiveOrigin: side === "left" ? "120% 42%" : "-20% 42%",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
    >
      {children}
    </div>
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
  /** Freeze the drift (time stops while a portrait is lifted). */
  paused?: boolean;
  onSelect?: (photo: Photo) => void;
}

/**
 * rAF-driven vertical marquee. Drifts at `speed` and gently accelerates
 * with scroll velocity, so the columns feel alive instead of mechanical.
 * Loops seamlessly via modulo on the duplicated track's half-height.
 */
function MarqueeColumn({
  photos,
  direction,
  speed,
  offset = 0,
  delay = 0,
  tilt = 0,
  paused = false,
  onSelect,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

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

      if (!pausedRef.current) {
        const target = Math.max(-0.6, Math.min(2.5, velocity / 800));
        boost += (target - boost) * Math.min(1, dt * 5);

        pos += dir * speed * (1 + boost) * dt;

        const half = track.scrollHeight / 2;
        if (half > 0) {
          const y = ((pos % half) + half) % half;
          track.style.transform = `translate3d(0, ${-y.toFixed(2)}px, 0)`;
        }
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
            data-cursor="view"
            onClick={() => onSelect?.(p)}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: p.aspectRatio,
              overflow: "hidden",
              borderRadius: 3,
              background: "var(--bg-elevated)",
              flexShrink: 0,
              boxShadow: "var(--shadow)",
              cursor: "pointer",
            }}
          >
            <Image
              src={p.src}
              alt=""
              fill
              sizes="(max-width: 768px) 45vw, 18vw"
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
