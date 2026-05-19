"use client";

import { motion } from "framer-motion";

export function IntroSection() {
  return (
    <section
      style={{
        padding: "160px 48px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 640, width: "100%" }}
      >
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 20,
            fontWeight: 300,
            lineHeight: 1.75,
            color: "var(--fg)",
            fontStyle: "italic",
          }}
        >
          This place will live forever in the memory of Urmila, who was a
          perfect mother, a fantastic friend, and someone who never backed down
          from action. We miss you and will want you to know that you will
          forever live in our hearts and minds every single day. You were and
          will always be the best thing to happen to us.
        </p>
        <p
          style={{
            fontFamily: "Inter Tight, sans-serif",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            marginTop: 40,
          }}
        >
          — Aman & Aashi
        </p>
      </motion.div>
    </section>
  );
}
