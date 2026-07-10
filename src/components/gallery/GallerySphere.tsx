"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo } from "@/types";
import InfiniteMenu, { MenuItem } from "./InfiniteMenu";
import { MemoriesPanel } from "./MemoriesPanel";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface Props {
  photos: Photo[];
  counts?: Record<string, number>;
  id?: string;
}

interface ApprovedComment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

function subjectLabel(s: string) {
  if (s === "both") return "Urmila & Ajay";
  if (s === "family") return "Family";
  if (s === "ajay") return "Ajay";
  if (s === "friends") return "Friends";
  if (s === "others") return "Others";
  return "Urmila";
}

// Postcards pinned at gentle, varied angles.
const CARD_TILT = [-3.4, 2.6, -1.8, 3.2, -2.4, 1.9, -3.0, 2.2];

/**
 * The archive as a slowly turning globe of photographs. Drag to spin it;
 * tap the one facing you and it opens into a wall of memory — the photo
 * enlarges in a warm frame while the caption and every memory tagged to it
 * drift in like postcards pinned to a board.
 */
export function GallerySphere({ photos, counts = {}, id }: Props) {
  const isMobile = useIsMobile();

  // Keep the sphere legible: a curated ring of the archive (the whole set
  // repeats across the sphere's faces anyway).
  const items: MenuItem[] = useMemo(
    () =>
      photos.slice(0, Math.min(photos.length, 20)).map((p) => ({
        image: p.src,
        link: p.id,
        title: p.caption ? "" : subjectLabel(p.subject),
        description: p.year ? String(p.year) : "",
      })),
    [photos]
  );
  const usable = photos.slice(0, items.length);

  const [activeIndex, setActiveIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const active = usable[activeIndex];
  const opened = openIndex != null ? usable[openIndex] : null;

  if (photos.length === 0) {
    return (
      <section id={id} style={{ padding: "120px 48px", textAlign: "center", background: "transparent" }}>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--fg-muted)" }}>
          The archive is being prepared.
        </p>
      </section>
    );
  }

  return (
    <section
      id={id}
      style={{ position: "relative", background: "transparent", padding: isMobile ? "24px 0 44px" : "40px 0 56px" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div
        style={{
          padding: isMobile ? "0 24px 14px" : "0 56px 20px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 18,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            The Archive
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--fg-muted)" }}>
            {photos.length} photographs
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 10.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
          }}
        >
          {isMobile ? "Drag to turn · tap to open" : "Drag to turn the globe · tap a photo to open"}
        </span>
      </div>

      {/* The globe */}
      <div style={{ position: "relative", height: isMobile ? "62svh" : "72svh", width: "100%" }}>
        <InfiniteMenu
          items={items}
          scale={isMobile ? 1.25 : 1.0}
          onActiveIndex={setActiveIndex}
          onSelect={(i) => setOpenIndex(i)}
        />

        {/* Caption of the photo currently facing the viewer */}
        <AnimatePresence mode="wait">
          {active && openIndex == null && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: isMobile ? 8 : 20,
                textAlign: "center",
                pointerEvents: "none",
                padding: "0 24px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: active.caption ? "clamp(15px, 1.8vw, 20px)" : 16,
                  color: active.caption ? "var(--fg)" : "var(--fg-muted)",
                  maxWidth: 620,
                  margin: "0 auto 6px",
                  lineHeight: 1.5,
                }}
              >
                {active.caption || subjectLabel(active.subject)}
              </p>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--fg-muted)",
                }}
              >
                {subjectLabel(active.subject)}
                {active.year ? ` · ${active.year}` : ""}
                {counts[active.id] ? ` · ${counts[active.id]} ${counts[active.id] === 1 ? "memory" : "memories"}` : ""}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The wall of memory */}
      <PostcardWall
        photo={opened}
        subjectLabel={opened ? subjectLabel(opened.subject) : ""}
        tilts={CARD_TILT}
        onClose={() => setOpenIndex(null)}
      />
    </section>
  );
}

/* ── The memory wall ──────────────────────────────────────────────── */

function PostcardWall({
  photo,
  subjectLabel,
  tilts,
  onClose,
}: {
  photo: Photo | null;
  subjectLabel: string;
  tilts: number[];
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [memories, setMemories] = useState<ApprovedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const reqId = useRef(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!photo) return;
    const mine = ++reqId.current;
    setMemories([]);
    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/comments?photo_id=${encodeURIComponent(photo.id)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        if (mine === reqId.current) setMemories(d.comments ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mine === reqId.current) setLoading(false);
      });
    return () => ctrl.abort();
  }, [photo]);

  // Escape closes the wall (unless the add-panel is up, which handles its own).
  useEffect(() => {
    if (!photo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !panelOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photo, panelOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {photo && (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            onClick={() => !panelOpen && onClose()}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 360,
              overflowY: "auto",
              // The room dims to a warm dusk so the memories hold the light.
              background: "rgba(24, 19, 12, 0.5)",
              backdropFilter: "blur(3px) brightness(0.8)",
              WebkitBackdropFilter: "blur(3px) brightness(0.8)",
              cursor: "zoom-out",
              padding: isMobile ? "72px 18px 40px" : "84px 40px 64px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 1080,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "default",
              }}
            >
              {/* The photograph, enlarging into a warm frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                style={{
                  position: "relative",
                  width: photo.aspectRatio >= 1 ? "min(88vw, 620px)" : "min(72vw, 420px)",
                  aspectRatio: photo.aspectRatio,
                  border: `${isMobile ? 8 : 12}px solid #FFFDF7`,
                  boxShadow: "0 0 0 1px rgba(139,110,63,0.3), 0 40px 90px rgba(15,10,4,0.55)",
                  background: "#FFFDF7",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.caption || "A memory"}
                  fill
                  sizes="88vw"
                  draggable={false}
                  placeholder={photo.blurDataURL ? "blur" : "empty"}
                  blurDataURL={photo.blurDataURL}
                  style={{ objectFit: "cover", pointerEvents: "none", userSelect: "none" }}
                />
              </motion.div>

              {/* Caption + meta */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease }}
                style={{ textAlign: "center", margin: "22px 0 6px", maxWidth: 620 }}
              >
                {photo.caption && (
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontWeight: 400,
                      fontSize: isMobile ? 17 : 21,
                      lineHeight: 1.5,
                      color: "#FBF4E6",
                      margin: 0,
                    }}
                  >
                    {photo.caption}
                  </p>
                )}
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    fontFamily: "var(--font-body)",
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#D9BC85",
                  }}
                >
                  {subjectLabel}
                  {photo.year ? ` · ${photo.year}` : ""}
                </span>
              </motion.div>

              {/* The postcards of memory */}
              <div
                style={{
                  marginTop: isMobile ? 20 : 30,
                  width: "100%",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: isMobile ? 14 : 20,
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                {loading && (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#D9BC85", letterSpacing: "0.1em" }}>
                    Gathering memories…
                  </span>
                )}
                {!loading &&
                  memories.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 26, rotate: 0, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, rotate: tilts[i % tilts.length], scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.35 + i * 0.09 }}
                      className="postcard"
                    >
                      <span className="postcard-pin" aria-hidden />
                      <p className="postcard-body">{m.body}</p>
                      <span className="postcard-author">— {m.author_name}</span>
                    </motion.div>
                  ))}
                {!loading && memories.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: isMobile ? 15 : 17,
                      color: "#EBDFC7",
                      textAlign: "center",
                      maxWidth: 360,
                    }}
                  >
                    No memories pinned here yet. Be the first to leave one.
                  </motion.p>
                )}
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ display: "flex", gap: 14, marginTop: isMobile ? 26 : 34, flexWrap: "wrap", justifyContent: "center" }}
              >
                <button onClick={() => setPanelOpen(true)} className="wall-btn wall-btn-primary">
                  + Add a memory
                </button>
                <button onClick={onClose} className="wall-btn wall-btn-ghost">
                  Close
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full memories panel (view + add) reused for the add flow */}
      {photo && (
        <MemoriesPanel
          open={panelOpen}
          photoId={photo.id}
          caption={photo.caption}
          subjectLabel={subjectLabel}
          year={photo.year}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </>,
    document.body
  );
}
