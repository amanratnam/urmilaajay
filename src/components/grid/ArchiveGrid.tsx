"use client";

import { motion } from "framer-motion";
import { PhotoTile } from "./PhotoTile";
import { Photo } from "@/types";

interface ArchiveGridProps {
  photos: Photo[];
  id?: string;
}

// Every 7th tile (0-indexed: 6, 13, 20…) goes full-width — Clennon rhythm
function isFullWidth(index: number): boolean {
  return index % 7 === 6;
}

export function ArchiveGrid({ photos, id }: ArchiveGridProps) {
  return (
    <section id={id} style={{ paddingBottom: 0 }}>
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          padding: "80px 48px 48px",
          display: "flex",
          alignItems: "baseline",
          gap: 20,
        }}
        id="archive"
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
          {photos.length} photographs
        </span>
      </motion.div>

      {/* Clennon-style 2-col flush grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 3,
        }}
      >
        {photos.map((photo, i) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            index={i}
            fullWidth={isFullWidth(i)}
          />
        ))}
      </div>
    </section>
  );
}
