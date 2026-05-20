"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Photo } from "@/types";

interface PhotoTileProps {
  photo: Photo;
  index: number;
  fullWidth?: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function PhotoTile({ photo, index, fullWidth = false }: PhotoTileProps) {
  const router = useRouter();

  const subjectLabel =
    photo.subject === "both"
      ? "Urmila & Ajay"
      : photo.subject === "urmila"
      ? "Urmila"
      : photo.subject === "ajay"
      ? "Ajay"
      : "Family";

  return (
    <div
      data-cursor="view"
      onClick={() => router.push(`/photo/${photo.slug}`)}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "none",
        gridColumn: fullWidth ? "1 / -1" : undefined,
        height: fullWidth ? "85vh" : "62vh",
        background: "var(--bg-elevated)",
      }}
    >
      {/* Photo — scales on hover, layoutId enables shared-element transition to detail page */}
      <motion.div
        layoutId={`photo-img-${photo.id}`}
        style={{ position: "absolute", inset: 0, transformOrigin: "center" }}
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.9, ease }}
      >
        <Image
          src={photo.src}
          alt={photo.caption || `Urmila — ${photo.year}`}
          fill
          loading={index < 6 ? "eager" : "lazy"}
          sizes={fullWidth ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          placeholder={photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={photo.blurDataURL}
          style={{ objectFit: "cover", filter: "brightness(1.08) saturate(1.05)" }}
        />
      </motion.div>

      {/* Hover overlay + caption */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.45, ease }}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,8,6,0.88) 0%, rgba(10,8,6,0.25) 55%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "28px 24px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "Inter Tight, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg)",
            }}
          >
            {photo.caption || subjectLabel}
          </span>
          <span
            style={{
              fontFamily: "Inter Tight, sans-serif",
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.08em",
              color: "var(--fg-muted)",
            }}
          >
            {photo.year}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
