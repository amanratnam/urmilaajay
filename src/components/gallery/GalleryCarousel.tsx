"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Photo } from "@/types";
import { MemoriesPanel } from "./MemoriesPanel";
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
  const [panelOpen, setPanelOpen] = useState(false);
  const count = photos.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (panelOpen) return;
      setActive((a) => {
        const next = a + dir;
        if (next < 0 || next >= count) return a;
        return next;
      });
    },
    [count, panelOpen]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panelOpen) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, panelOpen]);

  if (count === 0) {
    return (
      <section id={id} style={{ padding: "120px 48px", textAlign: "center", background: "var(--bg)" }}>
        <p style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic", fontWeight: 300, color: "var(--fg-muted)" }}>
          The archive is being prepared.
        </p>
      </section>
    );
  }

  const activePhoto = photos[active];
  const activeAr = activePhoto.aspectRatio || 1;
  const activePortrait = activeAr < 1;

  // Larger images on desktop (per request). Mobile uses vw so the active
  // image fills more of the viewport horizontally.
  const widthVal = isMobile ? (activePortrait ? 68 : 92) : activePortrait ? 38 : 60;
  const widthUnit = isMobile ? "vw" : "vh";
  const stageHeight = `${(widthVal / activeAr).toFixed(1)}${widthUnit}`;

  const memCount = counts[activePhoto.id] ?? 0;
  const spread = isMobile ? 54 : 50;

  // Slide-left offset (desktop) — empty on mobile (bottom-sheet instead)
  const stageShiftX = panelOpen && !isMobile ? "-22%" : "0%";

  return (
    <section
      id={id}
      style={{
        position: "relative",
        background: "var(--bg)",
        padding: isMobile ? "72px 0 96px" : "112px 0 128px",
        overflow: "hidden",
      }}
    >
      {/* ── Section header w/ position counter ───────────────────────── */}
      <div
        style={{
          padding: isMobile ? "0 24px 36px" : "0 56px 56px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            The Archive
          </span>
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 11,
              fontWeight: 300,
              color: "var(--fg-muted)",
              letterSpacing: "0.06em",
            }}
          >
            {count} photographs
          </span>
        </div>

        {/* Position counter */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <motion.span
            key={`pos-${active}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: isMobile ? 18 : 24,
              fontWeight: 300,
              letterSpacing: "-0.01em",
              color: "var(--fg)",
              lineHeight: 1,
              display: "inline-block",
              minWidth: 28,
              textAlign: "right",
            }}
          >
            {String(active + 1).padStart(2, "0")}
          </motion.span>
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 11,
              fontWeight: 300,
              color: "var(--fg-muted)",
              letterSpacing: "0.12em",
            }}
          >
            / {String(count).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Coverflow stage ─────────────────────────────────────────── */}
      <motion.div
        animate={{ height: stageHeight, x: stageShiftX }}
        transition={{ duration: 0.7, ease }}
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
          const scale = isActive ? 1 : 0.7 - (abs - 1) * 0.08;
          const zIndex = 10 - abs;
          const hideNeighbors = panelOpen && !isActive;
          const opacity = hideNeighbors ? 0 : 1 - abs * 0.2;

          const w = isMobile ? (portrait ? 68 : 92) : portrait ? 38 : 60;

          return (
            <motion.div
              key={photo.id}
              animate={{
                x: `${translateX}%`,
                rotateY,
                scale,
                opacity,
                filter: isActive ? "brightness(1)" : "brightness(0.85)",
              }}
              transition={{ duration: 0.7, ease }}
              onClick={() => {
                if (panelOpen) return;
                if (isActive) setPanelOpen(true);
                else setActive(i);
              }}
              data-cursor={isActive ? "memories" : "view"}
              style={{
                position: "absolute",
                width: `${w}${widthUnit}`,
                maxWidth: portrait ? 460 : 820,
                aspectRatio: photo.aspectRatio,
                transformStyle: "preserve-3d",
                cursor: panelOpen && isActive ? "default" : "pointer",
                zIndex,
                boxShadow: isActive ? "var(--shadow-lg)" : "var(--shadow)",
                background: "var(--bg-elevated)",
                overflow: "hidden",
                borderRadius: 4,
              }}
            >
              <Image
                src={photo.src}
                alt={photo.caption || `Urmila — ${photo.year}`}
                fill
                sizes="(max-width: 768px) 92vw, 60vh"
                draggable={false}
                placeholder={photo.blurDataURL ? "blur" : "empty"}
                blurDataURL={photo.blurDataURL}
                style={{ objectFit: "cover", pointerEvents: "none", userSelect: "none" }}
              />
              <div style={{ position: "absolute", inset: 0, zIndex: 2 }} />

              {/* ── Share-a-memory button overlaid bottom-right ─────── */}
              {isActive && !panelOpen && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25, ease }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPanelOpen(true);
                  }}
                  data-cursor="memories"
                  style={{
                    position: "absolute",
                    bottom: isMobile ? 14 : 20,
                    right: isMobile ? 14 : 20,
                    zIndex: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(250,249,246,0.92)",
                    border: "1px solid rgba(225,220,211,0.85)",
                    backdropFilter: "blur(10px)",
                    color: "var(--fg)",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    padding: isMobile ? "9px 14px" : "11px 18px",
                    cursor: "pointer",
                    borderRadius: 999,
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <HeartIcon />
                  {memCount > 0
                    ? `${memCount} ${memCount === 1 ? "memory" : "memories"}`
                    : "Share a memory"}
                </motion.button>
              )}
            </motion.div>
          );
        })}

        {/* ── Arrows ──────────────────────────────────────────────── */}
        {!panelOpen && (
          <>
            <button
              aria-label="Previous"
              onClick={() => go(-1)}
              disabled={active === 0}
              style={arrowStyle("left", active === 0, isMobile)}
              data-cursor="view"
            >
              ←
            </button>
            <button
              aria-label="Next"
              onClick={() => go(1)}
              disabled={active === count - 1}
              style={arrowStyle("right", active === count - 1, isMobile)}
              data-cursor="view"
            >
              →
            </button>
          </>
        )}
      </motion.div>

      {/* ── Caption + meta beneath ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`cap-${active}-${panelOpen}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: panelOpen ? 0 : 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45, ease }}
          style={{
            marginTop: isMobile ? 22 : 32,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "0 24px",
            pointerEvents: panelOpen ? "none" : "auto",
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

          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
            }}
          >
            {subjectLabel(activePhoto.subject)}
            {activePhoto.year ? ` · ${activePhoto.year}` : ""}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* ── Side / bottom panel ─────────────────────────────────────── */}
      <MemoriesPanel
        open={panelOpen}
        photoId={activePhoto.id}
        caption={activePhoto.caption}
        subjectLabel={subjectLabel(activePhoto.subject)}
        year={activePhoto.year}
        onClose={() => setPanelOpen(false)}
      />
    </section>
  );
}

function HeartIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function arrowStyle(side: "left" | "right", disabled: boolean, isMobile: boolean): React.CSSProperties {
  const size = isMobile ? 42 : 52;
  return {
    position: "absolute",
    [side]: isMobile ? "10px" : "3vw",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 50,
    width: size,
    height: size,
    borderRadius: "50%",
    border: "1px solid var(--border)",
    background: "rgba(250,249,246,0.85)",
    color: disabled ? "var(--border)" : "var(--fg)",
    fontSize: 18,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.35 : 1,
    transition: "opacity 0.3s, border-color 0.3s",
    backdropFilter: "blur(8px)",
    boxShadow: "var(--shadow)",
  } as React.CSSProperties;
}
