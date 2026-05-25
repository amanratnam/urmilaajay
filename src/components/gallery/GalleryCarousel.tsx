"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Photo } from "@/types";
import { MemoriesModal } from "./MemoriesModal";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface Props {
  photos: Photo[];
  counts?: Record<string, number>;
  id?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

function subjectLabel(s: string) {
  if (s === "both") return "Urmila & Ajay";
  if (s === "family") return "Family";
  if (s === "ajay") return "Ajay";
  return "Urmila";
}

export function GalleryCarousel({ photos, counts = {}, id }: Props) {
  const isMobile = useIsMobile();
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const count = photos.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      setActive((a) => {
        const next = a + dir;
        if (next < 0 || next >= count) return a;
        return next;
      });
    },
    [count]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, modalOpen]);

  if (count === 0) {
    return (
      <section id={id} style={{ padding: "120px 48px", textAlign: "center" }}>
        <p style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic", fontWeight: 300, color: "var(--fg-muted)" }}>
          The archive is being prepared.
        </p>
      </section>
    );
  }

  const activePhoto = photos[active];
  const activeAr = activePhoto.aspectRatio || 1;
  const activePortrait = activeAr < 1;

  // Width of a card (consistent across cards → no cropping). Stage height is
  // derived from the ACTIVE photo so the caption hugs the image (no big gap).
  const widthVal = isMobile ? (activePortrait ? 62 : 86) : activePortrait ? 30 : 48;
  const widthUnit = isMobile ? "vw" : "vh";
  const stageHeight = `${(widthVal / activeAr).toFixed(1)}${widthUnit}`;

  const memCount = counts[activePhoto.id] ?? 0;
  const spread = isMobile ? 52 : 46; // neighbour offset %

  return (
    <section id={id} style={{ position: "relative", padding: isMobile ? "72px 0 88px" : "100px 0 112px", overflow: "hidden" }}>
      {/* Section label */}
      <div style={{ padding: isMobile ? "0 24px 36px" : "0 48px 48px", display: "flex", alignItems: "baseline", gap: 18 }}>
        <span style={{ fontFamily: "Inter Tight, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
          The Archive
        </span>
        <span style={{ fontFamily: "Inter Tight, sans-serif", fontSize: 11, color: "var(--border)", letterSpacing: "0.06em" }}>
          {count} photographs
        </span>
      </div>

      {/* ── Coverflow stage (height tracks the active photo) ────────── */}
      <motion.div
        animate={{ height: stageHeight }}
        transition={{ duration: 0.6, ease }}
        style={{
          position: "relative",
          height: stageHeight,
          perspective: 1600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {photos.map((photo, i) => {
          const offset = i - active;
          const abs = Math.abs(offset);
          if (abs > 2) return null;

          const isActive = offset === 0;
          const portrait = photo.aspectRatio < 1;
          const translateX = offset * spread;
          const rotateY = offset === 0 ? 0 : offset > 0 ? -38 : 38;
          const scale = isActive ? 1 : 0.72 - (abs - 1) * 0.08;
          const zIndex = 10 - abs;
          const opacity = 1 - abs * 0.2;

          const w = isMobile ? (portrait ? 62 : 86) : portrait ? 30 : 48;

          return (
            <motion.div
              key={photo.id}
              animate={{ x: `${translateX}%`, rotateY, scale, opacity, filter: isActive ? "brightness(1)" : "brightness(0.5)" }}
              transition={{ duration: 0.7, ease }}
              onClick={() => (isActive ? setModalOpen(true) : setActive(i))}
              data-cursor={isActive ? "memories" : "view"}
              style={{
                position: "absolute",
                width: `${w}${widthUnit}`,
                maxWidth: portrait ? 360 : 640,
                aspectRatio: photo.aspectRatio,
                transformStyle: "preserve-3d",
                cursor: "pointer",
                zIndex,
                boxShadow: isActive ? "0 40px 90px rgba(0,0,0,0.6)" : "0 20px 50px rgba(0,0,0,0.4)",
                background: "var(--bg-elevated)",
                overflow: "hidden",
              }}
            >
              <Image
                src={photo.src}
                alt={photo.caption || `Urmila — ${photo.year}`}
                fill
                sizes="(max-width: 768px) 86vw, 48vh"
                draggable={false}
                placeholder={photo.blurDataURL ? "blur" : "empty"}
                blurDataURL={photo.blurDataURL}
                style={{ objectFit: "cover", pointerEvents: "none", userSelect: "none" }}
              />
              <div style={{ position: "absolute", inset: 0, zIndex: 2 }} />
            </motion.div>
          );
        })}

        {/* Arrows */}
        <button aria-label="Previous" onClick={() => go(-1)} disabled={active === 0} style={arrowStyle("left", active === 0, isMobile)} data-cursor="view">←</button>
        <button aria-label="Next" onClick={() => go(1)} disabled={active === count - 1} style={arrowStyle("right", active === count - 1, isMobile)} data-cursor="view">→</button>
      </motion.div>

      {/* ── Caption + meta + memories counter (hugs the photo) ──────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`cap-${active}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45, ease }}
          style={{
            marginTop: isMobile ? 22 : 28,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "0 24px",
          }}
        >
          <p
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: activePhoto.caption ? "clamp(17px, 2.2vw, 24px)" : 18,
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.5,
              color: activePhoto.caption ? "var(--fg)" : "var(--fg-muted)",
              maxWidth: 640,
              margin: 0,
            }}
          >
            {activePhoto.caption || subjectLabel(activePhoto.subject)}
          </p>

          <span style={{ fontFamily: "Inter Tight, sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
            {subjectLabel(activePhoto.subject)}
            {activePhoto.year ? ` · ${activePhoto.year}` : ""}
          </span>

          {/* Memories counter pill */}
          <button
            onClick={() => setModalOpen(true)}
            data-cursor="memories"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: memCount > 0 ? "rgba(201,168,120,0.12)" : "transparent",
              border: "1px solid var(--border)",
              color: memCount > 0 ? "var(--accent)" : "var(--fg-muted)",
              fontFamily: "Inter Tight, sans-serif",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "9px 18px",
              cursor: "pointer",
              borderRadius: 999,
              marginTop: 4,
              transition: "border-color 0.3s, background 0.3s",
            }}
          >
            <span style={{ fontSize: 12 }}>♡</span>
            {memCount > 0
              ? `${memCount} ${memCount === 1 ? "memory" : "memories"}`
              : "Share a memory"}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      {modalOpen && (
        <MemoriesModal
          photoId={activePhoto.id}
          caption={activePhoto.caption}
          subjectLabel={subjectLabel(activePhoto.subject)}
          year={activePhoto.year}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}

function arrowStyle(side: "left" | "right", disabled: boolean, isMobile: boolean): React.CSSProperties {
  const size = isMobile ? 40 : 48;
  return {
    position: "absolute",
    [side]: isMobile ? "10px" : "4vw",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 50,
    width: size,
    height: size,
    borderRadius: "50%",
    border: "1px solid var(--border)",
    background: "rgba(26,24,21,0.6)",
    color: disabled ? "var(--border)" : "var(--fg)",
    fontSize: 16,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.3 : 1,
    transition: "opacity 0.3s, border-color 0.3s",
    backdropFilter: "blur(6px)",
  } as React.CSSProperties;
}
