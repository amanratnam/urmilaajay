"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Letter {
  id: string;
  author_name: string;
  author_email: string;
  body: string;
  created_at: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

function pw() {
  return sessionStorage.getItem("admin_pw") ?? "";
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AdminLetters() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/letters", {
        headers: { "x-admin-password": pw() },
      });
      const data = await res.json();
      setLetters(data.letters ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 36,
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 28,
            fontWeight: 300,
            color: "var(--fg)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Letters received
        </h2>
        <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.08em" }}>
          {letters.length} {letters.length === 1 ? "letter" : "letters"}
        </span>
      </div>

      {loading ? (
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "var(--fg-muted)" }}>Loading…</p>
      ) : letters.length === 0 ? (
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--fg-muted)",
            margin: "8px 0",
          }}
        >
          No personal letters yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {letters.map((l, i) => {
            const isOpen = openId === l.id;
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: Math.min(i * 0.04, 0.3) }}
                style={{
                  background: "rgba(255,253,247,0.9)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  overflow: "hidden",
                  boxShadow: "var(--shadow)",
                }}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : l.id)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    padding: "22px 28px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span
                      style={{
                        fontFamily: "Fraunces, Georgia, serif",
                        fontSize: 18,
                        fontWeight: 400,
                        fontStyle: "italic",
                        color: "var(--fg)",
                      }}
                    >
                      From {l.author_name}
                    </span>
                    <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>
                      {formatLongDate(l.created_at)}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                    }}
                  >
                    {isOpen ? "Close" : "Read"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          padding: "12px 56px 44px",
                          borderTop: "1px solid var(--border)",
                          background:
                            "linear-gradient(180deg, rgba(255,253,247,0.6) 0%, rgba(250,248,242,0.7) 100%)",
                        }}
                      >
                        {/* Salutation — feels like a letter */}
                        <p
                          style={{
                            fontFamily: "Fraunces, Georgia, serif",
                            fontSize: 17,
                            fontWeight: 300,
                            fontStyle: "italic",
                            color: "var(--fg-muted)",
                            margin: "22px 0 18px",
                          }}
                        >
                          Dear Aman,
                        </p>

                        {/* Body — paragraphs preserved from plain text */}
                        {l.body.split(/\n\s*\n/).map((para, j) => (
                          <p
                            key={j}
                            style={{
                              fontFamily: "Fraunces, Georgia, serif",
                              fontSize: 17,
                              fontWeight: 300,
                              lineHeight: 1.8,
                              color: "var(--fg)",
                              margin: "0 0 18px",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {para}
                          </p>
                        ))}

                        {/* Sign-off */}
                        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 4 }}>
                          <span
                            style={{
                              fontFamily: "Fraunces, Georgia, serif",
                              fontSize: 17,
                              fontStyle: "italic",
                              fontWeight: 300,
                              color: "var(--fg-muted)",
                            }}
                          >
                            With love,
                          </span>
                          <span
                            style={{
                              fontFamily: "Fraunces, Georgia, serif",
                              fontSize: 22,
                              fontStyle: "italic",
                              fontWeight: 400,
                              color: "var(--fg)",
                              marginTop: 4,
                            }}
                          >
                            {l.author_name}
                          </span>
                          <a
                            href={`mailto:${l.author_email}`}
                            style={{
                              fontFamily: "Outfit, sans-serif",
                              fontSize: 11,
                              letterSpacing: "0.08em",
                              color: "var(--accent)",
                              textDecoration: "none",
                              marginTop: 6,
                            }}
                          >
                            {l.author_email}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      <button
        onClick={load}
        style={{
          marginTop: 36,
          background: "none",
          border: "none",
          fontFamily: "Outfit, sans-serif",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          cursor: "pointer",
          padding: 0,
        }}
      >
        ↻ Refresh
      </button>
    </div>
  );
}
