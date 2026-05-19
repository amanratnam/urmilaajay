"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Placeholder comment data — replaced with live Supabase data in step 6
const placeholderComments = [
  {
    id: "1",
    author_name: "Priya S.",
    body: "Urmila was the warmest person I've ever known. She made everyone in the room feel seen.",
    created_at: "2024-03-15",
    photo_slug: "urmila-portrait-1",
  },
  {
    id: "2",
    author_name: "Ravi K.",
    body: "I still remember the way she laughed. It filled the whole house.",
    created_at: "2024-04-02",
    photo_slug: "urmila-ajay-together-1",
  },
  {
    id: "3",
    author_name: "Meena T.",
    body: "Ajay and Urmila were inseparable. Seeing them together always reminded me what love looks like.",
    created_at: "2024-04-10",
    photo_slug: "urmila-ajay-together-2",
  },
  {
    id: "4",
    author_name: "Sunita P.",
    body: "She had a gift for making ordinary days feel like something worth remembering.",
    created_at: "2024-05-01",
    photo_slug: "urmila-portrait-2",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function MemoryWallPreview() {
  return (
    <section id="memories" style={{ padding: "0 48px 160px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease }}
        style={{ marginBottom: 64 }}
      >
        <p
          style={{
            fontFamily: "Inter Tight, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            marginBottom: 16,
          }}
        >
          Memories left by those who knew her
        </p>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 300,
            color: "var(--fg)",
          }}
        >
          The Memory Wall
        </h2>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 1,
          borderTop: "1px solid var(--border)",
        }}
      >
        {placeholderComments.map((comment, i) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, ease, delay: i * 0.08 }}
            style={{
              padding: "40px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: 17,
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1.65,
                color: "var(--fg)",
                marginBottom: 24,
              }}
            >
              &ldquo;{comment.body}&rdquo;
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "var(--fg-muted)",
                }}
              >
                {comment.author_name}
              </span>
              <span
                style={{
                  fontFamily: "Inter Tight, sans-serif",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--border)",
                }}
              >
                {new Date(comment.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease, delay: 0.3 }}
        style={{ marginTop: 64, textAlign: "center" }}
      >
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 16,
            fontStyle: "italic",
            color: "var(--fg-muted)",
            marginBottom: 24,
          }}
        >
          Do you carry a memory of Urmila or Ajay?
        </p>
        <Link
          href="/photo/urmila-portrait-1"
          data-cursor="leave yours"
          style={{
            fontFamily: "Inter Tight, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg)",
            textDecoration: "none",
            borderBottom: "1px solid var(--accent)",
            paddingBottom: 3,
            transition: "color 400ms var(--ease-memorial)",
          }}
        >
          Leave yours
        </Link>
      </motion.div>
    </section>
  );
}
