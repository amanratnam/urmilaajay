"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Photo } from "@/types";
import { InlineComments } from "./InlineComments";

interface Props {
  photos: Photo[];
  id?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

function subjectLabel(s: string) {
  if (s === "both") return "Urmila & Ajay";
  if (s === "family") return "Family";
  if (s === "ajay") return "Ajay";
  return "Urmila";
}

export function GalleryCarousel({ photos, id }: Props) {
  const [active, setActive] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
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

  // Keyboard arrows when the panel is closed
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
      <section id={id} style={{ padding: "120px 48px", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--fg-muted)",
          }}
        >
          The archive is being prepared.
        </p>
      </section>
    );
  }

  const activePhoto = photos[active];

  return (
    <section
      id={id}
      style={{ position: "relative", padding: "100px 0 120px", overflow: "hidden" }}
    >
      {/* Section label */}
      <div
        style={{
          padding: "0 48px 56px",
          display: "flex",
          alignItems: "baseline",
          gap: 20,
        }}
      >
        <span
          style={{
            fontFamily: "Inter Tight, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
          }}
        >
          The Archive
        </span>
        <span
          style={{
            fontFamily: "Inter Tight, sans-serif",
            fontSize: 11,
            color: "var(--border)",
            letterSpacing: "0.06em",
          }}
        >
          {count} photographs
        </span>
      </div>

      {/* ── Coverflow stage ─────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          height: "60vh",
          minHeight: 420,
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
          // Only render the 5 nearest for performance
          if (abs > 2) return null;

          const isActive = offset === 0;
          const translateX = offset * 46; // percentage of stage width
          const rotateY = offset === 0 ? 0 : offset > 0 ? -38 : 38;
          const scale = isActive ? 1 : 0.74 - (abs - 1) * 0.08;
          const zIndex = 10 - abs;
          const opacity = abs > 2 ? 0 : 1 - abs * 0.18;
          const portrait = photo.aspectRatio < 1;

          return (
            <motion.div
              key={photo.id}
              animate={{
                x: `${translateX}%`,
                rotateY,
                scale,
                opacity,
                filter: isActive ? "brightness(1)" : "brightness(0.5)",
              }}
              transition={{ duration: 0.7, ease }}
              onClick={() => (isActive ? setPanelOpen(true) : setActive(i))}
              data-cursor="view"
              style={{
                position: "absolute",
                width: portrait ? "26vh" : "44vh",
                maxWidth: portrait ? 360 : 620,
                aspectRatio: photo.aspectRatio,
                transformStyle: "preserve-3d",
                cursor: "none",
                zIndex,
                boxShadow: isActive
                  ? "0 40px 90px rgba(0,0,0,0.6)"
                  : "0 20px 50px rgba(0,0,0,0.4)",
                background: "var(--bg-elevated)",
                overflow: "hidden",
              }}
            >
              <Image
                src={photo.src}
                alt={photo.caption || `Urmila — ${photo.year}`}
                fill
                sizes="(max-width: 768px) 80vw, 44vh"
                draggable={false}
                placeholder={photo.blurDataURL ? "blur" : "empty"}
                blurDataURL={photo.blurDataURL}
                style={{
                  objectFit: "cover",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
              {/* transparent shield against drag/save */}
              <div style={{ position: "absolute", inset: 0, zIndex: 2 }} />
            </motion.div>
          );
        })}

        {/* Arrows */}
        <button
          aria-label="Previous"
          onClick={() => go(-1)}
          disabled={active === 0}
          style={arrowStyle("left", active === 0)}
          data-cursor="view"
        >
          ←
        </button>
        <button
          aria-label="Next"
          onClick={() => go(1)}
          disabled={active === count - 1}
          style={arrowStyle("right", active === count - 1)}
          data-cursor="view"
        >
          →
        </button>
      </div>

      {/* ── Caption + meta + "memories" trigger ─────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`cap-${active}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease }}
          style={{
            marginTop: 48,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            padding: "0 24px",
          }}
        >
          {activePhoto.caption ? (
            <p
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: "clamp(18px, 2.4vw, 26px)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1.5,
                color: "var(--fg)",
                maxWidth: 640,
                margin: 0,
              }}
            >
              {activePhoto.caption}
            </p>
          ) : (
            <p
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: 18,
                fontWeight: 300,
                fontStyle: "italic",
                color: "var(--fg-muted)",
                margin: 0,
              }}
            >
              {subjectLabel(activePhoto.subject)}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
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
              {subjectLabel(activePhoto.subject)} · {activePhoto.year || "—"}
            </span>
            <button
              onClick={() => setPanelOpen(true)}
              data-cursor="view"
              style={{
                background: "none",
                border: "none",
                fontFamily: "Inter Tight, sans-serif",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--accent)",
                cursor: "none",
                padding: 0,
              }}
            >
              Memories →
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Inline memories panel ───────────────────────────────────── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setPanelOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(10,8,6,0.72)",
                backdropFilter: "blur(4px)",
                zIndex: 200,
              }}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.55, ease }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "min(440px, 92vw)",
                background: "var(--bg-elevated)",
                borderLeft: "1px solid var(--border)",
                zIndex: 201,
                padding: "40px 36px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontSize: 24,
                    fontWeight: 300,
                    color: "var(--fg)",
                    margin: 0,
                  }}
                >
                  Memories
                </h3>
                <button
                  onClick={() => setPanelOpen(false)}
                  data-cursor="view"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--fg-muted)",
                    fontSize: 22,
                    cursor: "none",
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {activePhoto.caption && (
                <p
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontSize: 15,
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: "var(--fg-muted)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {activePhoto.caption}
                </p>
              )}

              <InlineComments photoId={activePhoto.id} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

function arrowStyle(side: "left" | "right", disabled: boolean): React.CSSProperties {
  return {
    position: "absolute",
    [side]: "4vw",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 50,
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "1px solid var(--border)",
    background: "rgba(26,24,21,0.6)",
    color: disabled ? "var(--border)" : "var(--fg)",
    fontSize: 16,
    cursor: disabled ? "default" : "none",
    opacity: disabled ? 0.3 : 1,
    transition: "opacity 0.3s, border-color 0.3s",
    backdropFilter: "blur(6px)",
  } as React.CSSProperties;
}
