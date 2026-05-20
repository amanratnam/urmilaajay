"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { photos } from "@/lib/photos";

// Curated first 10 photos for the hero carousel
const HERO_PHOTOS = photos.slice(0, 10);
const ease = [0.22, 1, 0.36, 1] as const;

function subjectLabel(s: string) {
  if (s === "both") return "Urmila & Ajay";
  if (s === "family") return "Family";
  if (s === "ajay") return "Ajay";
  return "Urmila";
}

export function HeroSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const lockedRef = useRef(false);
  const heroRef = useRef<HTMLElement>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (lockedRef.current) return;
      const next = index + dir;
      if (next < 0 || next >= HERO_PHOTOS.length) return;
      lockedRef.current = true;
      setDirection(dir);
      setIndex(next);
      setTimeout(() => {
        lockedRef.current = false;
      }, 1000);
    },
    [index]
  );

  // Intercept wheel events — release when at first/last photo
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const atEnd = e.deltaY > 0 && index === HERO_PHOTOS.length - 1;
      const atStart = e.deltaY < 0 && index === 0;
      if (atEnd || atStart) return; // let page scroll naturally
      e.preventDefault();
      go(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [index, go]);

  // Keyboard ↑ ↓ navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") go(1);
      if (e.key === "ArrowUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Touch swipe
  const touchStartY = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 40) go(delta > 0 ? 1 : -1);
  };

  // Title 3D tilt — cursor drives perspective rotation on the names block
  const titleRef = useRef<HTMLDivElement>(null);
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = titleRef.current;
    if (!el) return;
    const { left, top, width, height } = heroRef.current!.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;   // –0.5 → 0.5
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg)`;
  }, []);
  const onMouseLeave = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  }, []);

  const filmVariants = {
    enter: (d: number) => ({ y: d > 0 ? "100%" : "-100%" }),
    center: { y: "0%" },
    exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%" }),
  };

  const isLast = index === HERO_PHOTOS.length - 1;

  return (
    <section
      ref={heroRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        position: "relative",
        height: "100svh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* ── Filmstrip ─────────────────────────────────────────────────── */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={index}
          custom={direction}
          variants={filmVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.0, ease }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Image
            src={HERO_PHOTOS[index].src}
            alt={HERO_PHOTOS[index].caption || `Urmila — ${HERO_PHOTOS[index].year}`}
            fill
            priority={index < 2}
            loading={index < 2 ? "eager" : "lazy"}
            sizes="100vw"
            style={{ objectFit: "cover", filter: "brightness(0.48) saturate(1.08)" }}
          />
          {/* Gradient — stronger at bottom for text legibility */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(18,16,14,0.15) 0%, transparent 30%, rgba(18,16,14,0.55) 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Top/bottom edge fades (create the Clennon sliver look) ──── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, var(--bg) 0%, transparent 10%, transparent 90%, var(--bg) 100%)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* ── Title — fixed in center, 3D tilt follows cursor ─────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        {/* tiltRef wrapper: transition provides the spring-back ease */}
        <div
          ref={titleRef}
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease }}
          style={{ display: "block", marginBottom: 8 }}
        >
          Urmila
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.45, ease }}
          style={{ display: "block", marginBottom: 40 }}
        >
          & Ajay
        </motion.p>

        <motion.p
          className="hero-dates"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.7, ease }}
        >
          1980 – 2018 &nbsp;·&nbsp; 1971 – 2021
        </motion.p>
        </div>
      </div>

      {/* ── Bottom-left: subject label (changes per photo) ───────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`label-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease }}
          style={{
            position: "absolute",
            left: 40,
            bottom: 48,
            zIndex: 20,
          }}
        >
          <span
            style={{
              fontFamily: "Inter Tight, sans-serif",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
            }}
          >
            {subjectLabel(HERO_PHOTOS[index].subject)}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* ── Bottom-right: counter ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 48,
          zIndex: 20,
          fontFamily: "Inter Tight, sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "var(--fg-muted)",
        }}
      >
        <motion.span
          key={`count-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          style={{ display: "inline-block" }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.span>
        <span style={{ opacity: 0.35 }}> / {String(HERO_PHOTOS.length).padStart(2, "0")}</span>
      </div>

      {/* ── Right: progress ticks ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          right: 40,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "center",
        }}
      >
        {HERO_PHOTOS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 2,
              height: i === index ? 22 : 5,
              background: i === index ? "var(--fg)" : "var(--border)",
              transition: "height 0.4s cubic-bezier(0.22,1,0.36,1), background 0.4s",
              borderRadius: 1,
            }}
          />
        ))}
      </div>

      {/* ── Scroll-down cue (only on last photo) ─────────────────────── */}
      <AnimatePresence>
        {isLast && (
          <motion.div
            key="scroll-cue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease }}
            style={{
              position: "absolute",
              bottom: 48,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: "Inter Tight, sans-serif",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
              }}
            >
              scroll
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 1, height: 28, background: "var(--fg-muted)", opacity: 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
