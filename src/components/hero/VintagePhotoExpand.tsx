"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo } from "@/types";

/**
 * The magical expansion: hover (or tap) a photograph in the hero walls
 * and it rises out of the page inside an old walnut-and-gold frame on
 * aged parchment — corner flourishes, candlelight glow, a gentle
 * levitation — while the rest of the world greys out behind it, like a
 * moving portrait in a very old school's corridor.
 *
 * `pinned` = opened by tap/click: the backdrop becomes interactive
 * (tap outside to close). Hover-opened stays pointer-transparent so the
 * hover on the source thumbnail is never interrupted.
 */

interface Props {
  photo: Photo | null;
  onClose: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function VintagePhotoExpand({ photo, onClose }: Props) {
  // Portal to <body>: the hero lives inside main's stacking context
  // (z-index 1), which would let the fixed nav/dock float above the
  // greyed-out world.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {photo && (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            // The world loses its colour while the memory holds yours.
            background: "rgba(26, 20, 12, 0.42)",
            backdropFilter: "grayscale(0.95) brightness(0.62) sepia(0.12)",
            WebkitBackdropFilter: "grayscale(0.95) brightness(0.62) sepia(0.12)",
            pointerEvents: "auto",
            cursor: "zoom-out",
          }}
        >
          {/* Candlelight behind the frame */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease }}
            style={{
              position: "absolute",
              width: "min(80vw, 760px)",
              height: "min(80vw, 760px)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(224, 186, 122, 0.35) 0%, rgba(224, 186, 122, 0.1) 45%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />

          {/* The frame rises out of the page */}
          <motion.div
            initial={{ opacity: 0, scale: 0.62, rotate: -3, y: 46 }}
            animate={{ opacity: 1, scale: 1, rotate: -0.6, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 22, transition: { duration: 0.3, ease } }}
            transition={{ type: "spring", stiffness: 190, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative" }}
          >
            <div
              className="vintage-levitate"
              style={{
                // Old walnut frame
                background:
                  "linear-gradient(135deg, #4A3826 0%, #2E2214 48%, #4A3826 100%)",
                padding: 9,
                borderRadius: 4,
                boxShadow:
                  "0 40px 90px rgba(15, 10, 4, 0.6), 0 8px 24px rgba(15, 10, 4, 0.45), inset 0 1px 0 rgba(224, 186, 122, 0.28)",
              }}
            >
              {/* Gold fillet */}
              <div
                style={{
                  background: "linear-gradient(160deg, #D9BC85 0%, #8B6E3F 55%, #C9A878 100%)",
                  padding: 2.5,
                  borderRadius: 2,
                }}
              >
                {/* Aged parchment mat */}
                <div
                  style={{
                    position: "relative",
                    background:
                      "radial-gradient(ellipse at 50% 40%, #F6EDD8 0%, #EFE2C4 68%, #E2CFA6 100%)",
                    padding: "clamp(12px, 2.6vw, 26px)",
                    borderRadius: 1,
                  }}
                >
                  <CornerFlourish corner="tl" />
                  <CornerFlourish corner="tr" />
                  <CornerFlourish corner="bl" />
                  <CornerFlourish corner="br" />

                  {/* The photograph, toned like an old print */}
                  <div
                    style={{
                      position: "relative",
                      width:
                        photo.aspectRatio >= 1
                          ? "min(80vw, 60svh * " + photo.aspectRatio.toFixed(3) + ", 640px)"
                          : "min(76vw, 54svh * " + photo.aspectRatio.toFixed(3) + ", 440px)",
                      aspectRatio: photo.aspectRatio,
                      overflow: "hidden",
                      boxShadow: "inset 0 0 0 1px rgba(74, 56, 38, 0.5)",
                    }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.caption || "A memory"}
                      fill
                      sizes="80vw"
                      draggable={false}
                      placeholder={photo.blurDataURL ? "blur" : "empty"}
                      blurDataURL={photo.blurDataURL}
                      style={{
                        objectFit: "cover",
                        filter: "sepia(0.38) contrast(0.95) saturate(0.82) brightness(1.02)",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    />
                    {/* Aged-plate vignette over the print */}
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(58, 40, 18, 0.28) 100%)",
                      }}
                    />
                  </div>

                  {/* Engraved plate under the print (existing caption copy) */}
                  {(photo.caption || photo.year > 0) && (
                    <div
                      style={{
                        marginTop: "clamp(8px, 1.6vw, 14px)",
                        textAlign: "center",
                        maxWidth: "min(72vw, 620px)",
                      }}
                    >
                      {photo.caption && (
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontStyle: "italic",
                            fontWeight: 500,
                            fontSize: "clamp(12px, 1.5vw, 16px)",
                            lineHeight: 1.45,
                            color: "#4A3826",
                            margin: 0,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {photo.caption}
                        </p>
                      )}
                      {photo.year > 0 && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: 4,
                            fontFamily: "var(--font-body)",
                            fontSize: 10.5,
                            fontWeight: 600,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: "#8B6E3F",
                          }}
                        >
                          Anno {photo.year}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Small engraved scroll ornament for the parchment corners. */
function CornerFlourish({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const flip = {
    tl: "scale(1, 1)",
    tr: "scale(-1, 1)",
    bl: "scale(1, -1)",
    br: "scale(-1, -1)",
  }[corner];
  const pos: React.CSSProperties = {
    tl: { top: 5, left: 5 },
    tr: { top: 5, right: 5 },
    bl: { bottom: 5, left: 5 },
    br: { bottom: 5, right: 5 },
  }[corner];

  return (
    <svg
      aria-hidden
      width="26"
      height="26"
      viewBox="0 0 26 26"
      style={{ position: "absolute", ...pos, transform: flip, opacity: 0.75 }}
    >
      <path
        d="M2 24 C 2 12, 4 5, 14 3 M2 24 C 6 20, 12 18, 16 19 M5 12 c 2.5 -1 4.5 0.5 4 2.5 c -0.4 1.6 -2.6 1.6 -3 0 c -0.3 -1.2 0.8 -2.3 2.2 -2.4"
        stroke="#8B6E3F"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="17.5" cy="6.5" r="0.9" fill="#8B6E3F" />
    </svg>
  );
}
