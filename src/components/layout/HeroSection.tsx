"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Photo } from "@/types";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface Props {
  photos: Photo[];
}

/**
 * Split hero: heartfelt copy on the left, two vertically auto-scrolling
 * photo marquees on the right. Mobile: text first, single marquee beneath.
 */
export function HeroSection({ photos }: Props) {
  const isMobile = useIsMobile();

  // Pick photos for the marquees — spread across the archive
  const pool = useMemo(() => (photos.length > 0 ? photos.slice(0, Math.min(photos.length, 14)) : []), [photos]);
  const colA = pool.filter((_, i) => i % 2 === 0).slice(0, 7);
  const colB = pool.filter((_, i) => i % 2 === 1).slice(0, 7);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100svh",
        background: "var(--bg)",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.05fr 1fr",
        gridTemplateRows: isMobile ? "auto 1fr" : "1fr",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── LEFT — text ─────────────────────────────────────────────── */}
      <div
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
          <span className="w-300">Urmila</span>
          <span className="hero-years">1980 – 2018</span>
          <br />
          <span className="w-200">&amp;&nbsp;</span>
          <span className="w-300">Ajay</span>
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
        style={{
          position: "relative",
          height: isMobile ? "58svh" : "100svh",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr",
          gap: isMobile ? 10 : 16,
          padding: isMobile ? "0 16px 24px" : "24px 5vw 24px 0",
        }}
      >
        <MarqueeColumn photos={colA} direction="up" duration={isMobile ? 42 : 58} />
        <MarqueeColumn photos={colB} direction="down" duration={isMobile ? 50 : 72} offset={isMobile ? 40 : 64} />

        {/* Soft top + bottom fades into bg */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, var(--bg) 0%, transparent 9%, transparent 91%, var(--bg) 100%)",
          }}
        />
      </div>
    </section>
  );
}

interface MarqueeProps {
  photos: Photo[];
  direction: "up" | "down";
  duration: number;
  offset?: number;
}

function MarqueeColumn({ photos, direction, duration, offset = 0 }: MarqueeProps) {
  // Duplicate the list so the animation can loop seamlessly (0 → -50%)
  const items = [...photos, ...photos];
  if (photos.length === 0) return <div />;

  return (
    <div style={{ position: "relative", overflow: "hidden", paddingTop: offset }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          animation: `${direction === "up" ? "marquee-up" : "marquee-down"} ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {items.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
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
