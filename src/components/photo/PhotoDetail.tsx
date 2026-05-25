"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Photo } from "@/types";
import { CommentThread } from "@/components/comments/CommentThread";

interface Props {
  photo: Photo;
  prev: Photo | null;
  next: Photo | null;
}

const ease = [0.22, 1, 0.36, 1] as const;

const subjectLabel = (subject: Photo["subject"]) => {
  if (subject === "both") return "Urmila & Ajay";
  if (subject === "urmila") return "Urmila";
  if (subject === "ajay") return "Ajay";
  return "Family";
};

export function PhotoDetail({ photo, prev, next }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prev) router.push(`/photo/${prev.slug}`);
      if (e.key === "ArrowRight" && next) router.push(`/photo/${next.slug}`);
      if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  // Polaroid 3D tilt — shadow shifts opposite to tilt direction for realism
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // –0.5 → 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotY = x * 16;
    const rotX = -y * 12;
    // Shadow offset opposes tilt: tilting right → shadow goes left
    const shadowX = -x * 24;
    const shadowY = -y * 16;
    const shadowBlur = 40 + Math.abs(x * 20) + Math.abs(y * 20);
    const shine = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(255,255,255,0.12) 0%, transparent 55%)`;
    el.style.transform = `perspective(900px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(1.02)`;
    el.style.boxShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.55)`;
    el.style.setProperty("--shine", shine);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
    el.style.boxShadow = "0px 20px 60px rgba(0,0,0,0.4)";
    el.style.setProperty("--shine", "none");
  }, []);

  const isPortrait = photo.aspectRatio < 1;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease }}
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        color: "var(--fg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 40px",
          background: "linear-gradient(to bottom, rgba(18,16,14,0.92) 0%, transparent 100%)",
        }}
      >
        <Link
          href="/"
          data-cursor="view"
          style={{
            fontFamily: "Inter Tight, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>←</span>
          The Archive
        </Link>

        <span
          style={{
            fontFamily: "Inter Tight, sans-serif",
            fontSize: 11,
            fontWeight: 400,
            letterSpacing: "0.1em",
            color: "var(--fg-muted)",
          }}
        >
          {subjectLabel(photo.subject)} · {photo.year}
        </span>
      </header>

      {/* Photo area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 40px 60px",
          gap: 32,
        }}
      >
        {/* Polaroid wrapper */}
        <div
          ref={tiltRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "relative",
            maxWidth: isPortrait ? "min(420px, 52vh)" : "min(820px, 76vw)",
            width: "100%",
            cursor: "pointer",
            transition: "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
            transformStyle: "preserve-3d",
            boxShadow: "0px 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <motion.div
            layoutId={`photo-img-${photo.id}`}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: photo.aspectRatio,
              overflow: "hidden",
              background: "var(--bg-elevated)",
            }}
            transition={{ duration: 0.7, ease }}
          >
            <Image
              src={photo.src}
              alt={photo.caption || `Urmila — ${photo.year}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 80vw"
              placeholder={photo.blurDataURL ? "blur" : "empty"}
              blurDataURL={photo.blurDataURL}
              style={{
                objectFit: "cover",
                filter: "brightness(1.06) saturate(1.04)",
              }}
            />
            {/* Specular highlight */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "var(--shine, none)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </motion.div>
        </div>

        {/* Caption */}
        <div
          style={{
            maxWidth: isPortrait ? 420 : 820,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {photo.caption ? (
            <p
              className="caption-serif"
              style={{ margin: 0 }}
            >
              {photo.caption}
            </p>
          ) : null}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: photo.caption ? 12 : 0,
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
              {subjectLabel(photo.subject)}
            </span>
            <span
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: 13,
                fontWeight: 300,
                fontStyle: "italic",
                color: "var(--fg-muted)",
              }}
            >
              {photo.year}
            </span>
          </div>
        </div>

        {/* Prev / Next */}
        <nav
          style={{
            maxWidth: isPortrait ? 420 : 820,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 16,
          }}
        >
          {prev ? (
            <Link
              href={`/photo/${prev.slug}`}
              data-cursor="view"
              style={{
                fontFamily: "Inter Tight, sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 14 }}>←</span>
              Previous
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/photo/${next.slug}`}
              data-cursor="view"
              style={{
                fontFamily: "Inter Tight, sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              Next
              <span style={{ fontSize: 14 }}>→</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>

      {/* Comment thread */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          marginTop: 40,
        }}
      >
        <CommentThread photoId={photo.id} />
      </div>
    </motion.div>
  );
}
