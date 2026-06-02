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

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function preview(s: string, n = 90) {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > n ? `${flat.slice(0, n)}…` : flat;
}

export function AdminLetters() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/letters", { headers: { "x-admin-password": pw() } });
      const data = await res.json();
      setLetters(data.letters ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    if (!confirm("Delete this letter permanently? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/letters/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": pw() },
      });
      setLetters((prev) => prev.filter((l) => l.id !== id));
      if (openId === id) setOpenId(null);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div style={headerRow}>
        <h2 style={h2Style}>Letters</h2>
        <span style={meta}>{letters.length} {letters.length === 1 ? "letter" : "letters"}</span>
      </div>

      {loading ? (
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "var(--fg-muted)" }}>Loading…</p>
      ) : letters.length === 0 ? (
        <p style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic", color: "var(--fg-muted)" }}>
          No personal letters yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(140px, 1.1fr) minmax(180px, 1.4fr) minmax(0, 2.5fr) 110px 130px",
              gap: 12,
              padding: "8px 18px",
              ...meta,
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              borderBottom: "1px solid var(--border)",
            }}
            className="lt-grid-header"
          >
            <div>From</div>
            <div>Email</div>
            <div>Preview</div>
            <div>Sent</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          <AnimatePresence>
            {letters.map((l) => {
              const isOpen = openId === l.id;
              return (
                <motion.div
                  key={l.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.35, ease }}
                  style={{
                    background: "rgba(255,253,247,0.85)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    boxShadow: "var(--shadow)",
                    overflow: "hidden",
                  }}
                >
                  {/* Row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(140px, 1.1fr) minmax(180px, 1.4fr) minmax(0, 2.5fr) 110px 130px",
                      gap: 12,
                      padding: "14px 18px",
                      alignItems: "center",
                    }}
                    className="lt-grid-row"
                  >
                    <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>
                      {l.author_name}
                    </span>
                    <a
                      href={`mailto:${l.author_email}`}
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontSize: 12,
                        color: "var(--fg-muted)",
                        textDecoration: "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {l.author_email}
                    </a>
                    <span
                      style={{
                        fontFamily: "Fraunces, Georgia, serif",
                        fontStyle: "italic",
                        fontSize: 13,
                        fontWeight: 300,
                        color: "var(--fg-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      “{preview(l.body)}”
                    </span>
                    <span style={{ ...meta, opacity: 0.7 }}>{shortDate(l.created_at)}</span>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => setOpenId(isOpen ? null : l.id)} style={cta("primary")}>
                        {isOpen ? "Close" : "Read"}
                      </button>
                      <button onClick={() => remove(l.id)} disabled={deleting === l.id} style={cta("danger")}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded reveal — compact letter view */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease }}
                        style={{ overflow: "hidden", background: "rgba(255,253,247,0.55)", borderTop: "1px solid var(--border)" }}
                      >
                        <div style={{ padding: "18px 28px 24px" }}>
                          {l.body.split(/\n\s*\n/).map((para, j) => (
                            <p
                              key={j}
                              style={{
                                fontFamily: "Fraunces, Georgia, serif",
                                fontSize: 15,
                                fontWeight: 300,
                                lineHeight: 1.7,
                                color: "var(--fg)",
                                margin: "0 0 12px",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {para}
                            </p>
                          ))}
                          <p style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic", fontSize: 15, fontWeight: 400, color: "var(--accent)", marginTop: 12, marginBottom: 0 }}>
                            — {l.author_name}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Responsive: collapse columns on mobile */}
          <style>{`
            @media (max-width: 768px) {
              .lt-grid-header { display: none !important; }
              .lt-grid-row {
                grid-template-columns: 1fr !important;
                gap: 4px !important;
                padding: 14px 16px !important;
              }
              .lt-grid-row > *:nth-child(4) { order: 99; opacity: 0.55; font-size: 10px; }
              .lt-grid-row > *:last-child { margin-top: 6px; justify-content: flex-start !important; }
            }
          `}</style>
        </div>
      )}

      <button onClick={load} style={refreshBtn}>↻ Refresh</button>
    </div>
  );
}

const headerRow: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: 24,
  flexWrap: "wrap",
  gap: 12,
};

const h2Style: React.CSSProperties = {
  fontFamily: "Fraunces, Georgia, serif",
  fontSize: 30,
  fontWeight: 300,
  color: "var(--fg)",
  margin: 0,
  letterSpacing: "-0.01em",
};

const meta: React.CSSProperties = {
  fontFamily: "Outfit, sans-serif",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  color: "var(--fg-muted)",
};

function cta(kind: "primary" | "danger"): React.CSSProperties {
  const base: React.CSSProperties = {
    fontFamily: "Outfit, sans-serif",
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: "7px 14px",
    cursor: "pointer",
    borderRadius: 3,
  };
  if (kind === "primary") return { ...base, background: "var(--accent)", border: "1px solid var(--accent)", color: "#FAF9F6" };
  return { ...base, background: "transparent", border: "1px solid #B85C3F", color: "#B85C3F" };
}

const refreshBtn: React.CSSProperties = {
  marginTop: 28,
  background: "none",
  border: "none",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--fg-muted)",
  cursor: "pointer",
  padding: 0,
  fontFamily: "Outfit, sans-serif",
};
