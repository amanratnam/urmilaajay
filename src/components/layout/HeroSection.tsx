"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Photo } from "@/types";

const HeroParticles = dynamic(
  () => import("@/components/three/HeroParticles").then((m) => m.HeroParticles),
  { ssr: false }
);

const ease = [0.22, 1, 0.36, 1] as const;

function subjectLabel(s: string) {
  if (s === "both") return "Urmila & Ajay";
  if (s === "family") return "Family";
  if (s === "ajay") return "Ajay";
  return "Urmila";
}

interface Props {
  photos: Photo[];
}

export function HeroSection({ photos }: Props) {
  const heroPhotos = photos.length > 0 ? photos : [];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const lockedRef = useRef(false);
  const heroRef = useRef<HTMLElement>(null);

  const count = heroPhotos.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (lockedRef.current || count === 0) return;
      const next = index + dir;
      if (next < 0 || next >= count) return;
      lockedRef.current = true;
      setDirection(dir);
      setIndex(next);
      setTimeout(() => {
        lockedRef.current = false;
      }, 1000);
    },
    [index, count]
  );

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const atEnd = e.deltaY > 0 && index === count - 1;
      const atStart = e.deltaY < 0 && index === 0;
      if (atEnd || atStart) return;
      e.preventDefault();
      go(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [index, count, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") go(1);
      if (e.key === "ArrowUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const touchStartY = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 40) go(delta > 0 ? 1 : -1);
  };

  // Title 3D tilt — cursor drives perspective rotation
  const titleRef = useRef<HTMLDivElement>(null);
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = titleRef.current;
    if (!el || !heroRef.current) return;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg)`;
  }, []);
  const onMouseLeave = useCallback(() => {
    const el = titleRef.current;
    if (el) el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  }, []);

  const filmVariants = {
    enter: (d: number) => ({ y: d > 0 ? "100%" : "-100%", scale: 1.08 }),
    center: { y: "0%", scale: 1 },
    exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%", scale: 1.08 }),
  };

  const isLast = count === 0 || index === count - 1;
  const current = heroPhotos[index];

  return (
    <section
      ref={heroRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: "relative",
        height: "100svh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* ── Filmstrip photo ─────────────────────────────────────────── */}
      {current && (
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
            {/* Slow Ken Burns drift on the active photo */}
            <motion.div
              style={{ position: "absolute", inset: 0 }}
              initial={{ scale: 1.0 }}
              animate={{ scale: 1.08 }}
              transition={{ duration: 8, ease: "easeOut" }}
            >
              <Image
                src={current.src}
                alt={current.caption || `Urmila — ${current.year}`}
                fill
                priority={index < 2}
                sizes="100vw"
                draggable={false}
                style={{
                  objectFit: "cover",
                  filter: "brightness(0.46) saturate(1.08)",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
            </motion.div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(18,16,14,0.2) 0%, transparent 32%, rgba(18,16,14,0.6) 100%)",
              }}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Ethereal floating motes (3D) ────────────────────────────── */}
      <HeroParticles />

      {/* ── Gold light bloom behind the title ───────────────────────── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease }}
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          width: "70vw",
          height: "70vw",
          maxWidth: 900,
          maxHeight: 900,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(201,168,120,0.10) 0%, rgba(201,168,120,0.04) 35%, transparent 65%)",
          zIndex: 7,
          pointerEvents: "none",
        }}
      />

      {/* ── Top/bottom edge fades ───────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, var(--bg) 0%, transparent 12%, transparent 88%, var(--bg) 100%)",
          pointerEvents: "none",
          zIndex: 8,
        }}
      />

      {/* ── Title ───────────────────────────────────────────────────── */}
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
        <div
          ref={titleRef}
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.6, delay: 0.3, ease }}
            style={{ display: "block", marginBottom: 8 }}
          >
            Urmila
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.6, delay: 0.6, ease }}
            style={{ display: "block", marginBottom: 40 }}
          >
            & Ajay
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 1.0, ease }}
            style={{
              width: 60,
              height: 1,
              background: "var(--accent)",
              margin: "0 auto 24px",
              transformOrigin: "center",
            }}
          />

          <motion.p
            className="hero-dates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 1.2, ease }}
          >
            1980 – 2018 &nbsp;·&nbsp; 1971 – 2021
          </motion.p>
        </div>
      </div>

      {/* ── Subject label ───────────────────────────────────────────── */}
      {current && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`label-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease }}
            style={{ position: "absolute", left: 40, bottom: 48, zIndex: 20 }}
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
              {subjectLabel(current.subject)}
            </span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Counter ─────────────────────────────────────────────────── */}
      {count > 0 && (
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
          <span style={{ opacity: 0.35 }}> / {String(count).padStart(2, "0")}</span>
        </div>
      )}

      {/* ── Progress ticks ──────────────────────────────────────────── */}
      {count > 0 && (
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
          {heroPhotos.map((_, i) => (
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
      )}

      {/* ── Scroll cue ──────────────────────────────────────────────── */}
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
