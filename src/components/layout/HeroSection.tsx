"use client";

import { useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Photo } from "@/types";
import { FloatingWords } from "./FloatingWords";
import { useIsMobile } from "@/hooks/useMediaQuery";

const HeroParticles = dynamic(
  () => import("@/components/three/HeroParticles").then((m) => m.HeroParticles),
  { ssr: false }
);

const ease = [0.22, 1, 0.36, 1] as const;

const MESSAGE =
  "Welcome to a memorial space for Urmila and Ajay. We (their kids) have created this website to allow them to live on the internet and for any of the loved ones to access the memories they had with them, and add their own. We loved you while you were on Earth, we love you while you're in heaven, and we hope you're happier than you ever were. Miss you mom and dad.";

interface Props {
  photo: Photo | null;
}

export function HeroSection({ photo }: Props) {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Photo drifts up as you scroll away (parallax)
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Cursor tilt on the title block (desktop only)
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isMobile) return;
      const el = titleRef.current;
      if (!el || !ref.current) return;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 5}deg)`;
    },
    [isMobile]
  );
  const onMouseLeave = useCallback(() => {
    const el = titleRef.current;
    if (el) el.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
  }, []);

  const titleSize = isMobile ? "clamp(64px, 19vw, 96px)" : "clamp(96px, 12vw, 200px)";
  const yearSize = isMobile ? 13 : 18;

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: "relative",
        minHeight: "100svh",
        overflow: "hidden",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "100px 24px 80px" : "120px 48px",
      }}
    >
      {/* ── Static photo of Urmila — animated (Ken Burns + parallax) ── */}
      {photo && (
        <motion.div style={{ position: "absolute", inset: "-8% 0", y: photoY, zIndex: 0 }}>
          <motion.div
            style={{ position: "absolute", inset: 0 }}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.16 }}
            transition={{ duration: 18, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
          >
            <Image
              src={photo.src}
              alt="Urmila"
              fill
              priority
              sizes="100vw"
              draggable={false}
              placeholder={photo.blurDataURL ? "blur" : "empty"}
              blurDataURL={photo.blurDataURL}
              style={{
                objectFit: "cover",
                objectPosition: "center 30%",
                filter: "brightness(0.4) saturate(1.05)",
                pointerEvents: "none",
              }}
            />
          </motion.div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(18,16,14,0.55) 0%, rgba(18,16,14,0.35) 45%, rgba(18,16,14,0.75) 100%)",
            }}
          />
        </motion.div>
      )}

      {/* ── Ethereal motes + floating 3D words ──────────────────────── */}
      <HeroParticles />
      {!isMobile && <FloatingWords />}

      {/* ── Gold light bloom ────────────────────────────────────────── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease }}
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: "80vw",
          height: "80vw",
          maxWidth: 1000,
          maxHeight: 1000,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(201,168,120,0.10) 0%, rgba(201,168,120,0.04) 35%, transparent 65%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <motion.div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: 720,
          opacity: contentOpacity,
        }}
      >
        <div
          ref={titleRef}
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
            marginBottom: isMobile ? 28 : 36,
          }}
        >
          {/* Urmila + years */}
          <div
            className="hero-reveal"
            style={{
              animationDelay: "0.3s",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "center" : "baseline",
              justifyContent: "center",
              gap: isMobile ? 4 : 16,
            }}
          >
            <span className="hero-title" style={{ fontSize: titleSize, lineHeight: 0.95 }}>
              Urmila
            </span>
            <span style={yearStyle(yearSize)}>1980 – 2018</span>
          </div>

          {/* & Ajay + years */}
          <div
            className="hero-reveal"
            style={{
              animationDelay: "0.55s",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "center" : "baseline",
              justifyContent: "center",
              gap: isMobile ? 4 : 16,
              marginTop: isMobile ? 12 : 4,
            }}
          >
            <span
              className="hero-subtitle"
              style={{ fontSize: isMobile ? "clamp(36px, 12vw, 60px)" : "clamp(48px, 7vw, 110px)", lineHeight: 0.95 }}
            >
              &amp; Ajay
            </span>
            <span style={yearStyle(yearSize)}>1971 – 2021</span>
          </div>
        </div>

        {/* Accent rule */}
        <div
          className="hero-rule-in"
          style={{
            animationDelay: "0.9s",
            width: 60,
            height: 1,
            background: "var(--accent)",
            margin: "0 auto 28px",
          }}
        />

        {/* Memorial message */}
        <p
          className="hero-reveal"
          style={{
            animationDelay: "1.1s",
            fontFamily: "Fraunces, Georgia, serif",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: isMobile ? 15 : 18,
            lineHeight: 1.7,
            color: "var(--fg)",
            maxWidth: 620,
            margin: "0 auto",
            textShadow: "0 1px 20px rgba(0,0,0,0.6)",
          }}
        >
          {MESSAGE}
        </p>
      </motion.div>

      {/* ── Scroll cue ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        style={{
          position: "absolute",
          bottom: isMobile ? 28 : 40,
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
    </section>
  );
}

function yearStyle(size: number): React.CSSProperties {
  return {
    fontFamily: "Inter Tight, sans-serif",
    fontSize: size,
    fontWeight: 400,
    letterSpacing: "0.1em",
    color: "var(--accent)",
    whiteSpace: "nowrap",
  };
}
