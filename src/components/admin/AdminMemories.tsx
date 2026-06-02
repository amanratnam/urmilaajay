"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PendingComment {
  id: string;
  photo_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

function pw() {
  return sessionStorage.getItem("admin_pw") ?? "";
}

export function AdminMemories() {
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments", {
        headers: { "x-admin-password": pw() },
      });
      const data = await res.json();
      setComments(data.comments ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: "approve" | "reject") => {
    setActing(id);
    try {
      await fetch(`/api/admin/comments/${id}`, {
        method: action === "approve" ? "PATCH" : "DELETE",
        headers: { "x-admin-password": pw() },
      });
      setComments((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 30,
            fontWeight: 300,
            color: "var(--fg)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Memories queue
        </h2>
        <span style={metaStyle}>
          {comments.length} {comments.length === 1 ? "pending" : "pending"}
        </span>
      </div>

      {loading ? (
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "var(--fg-muted)" }}>Loading…</p>
      ) : comments.length === 0 ? (
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 18,
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--fg-muted)",
            lineHeight: 1.6,
          }}
        >
          All clear — no memories waiting for approval.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 14,
          }}
        >
          <AnimatePresence>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.4, ease }}
                style={{
                  background: "rgba(255,253,247,0.85)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxShadow: "var(--shadow)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <span
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--fg)",
                    }}
                  >
                    {c.author_name}
                  </span>
                  <span style={{ ...metaStyle, opacity: 0.7 }}>
                    {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontSize: 15,
                    fontStyle: "italic",
                    fontWeight: 300,
                    lineHeight: 1.6,
                    color: "var(--fg)",
                    margin: 0,
                    borderLeft: "2px solid var(--border)",
                    paddingLeft: 14,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {c.body}
                </p>
                <div style={{ ...metaStyle, opacity: 0.55 }}>Photo {c.photo_id.slice(0, 8)}…</div>

                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  <button onClick={() => act(c.id, "approve")} disabled={acting === c.id} style={btn("accent")}>Approve</button>
                  <button onClick={() => act(c.id, "reject")} disabled={acting === c.id} style={btn("ghost")}>Reject</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <button onClick={load} style={refreshBtn}>↻ Refresh</button>
    </div>
  );
}

const metaStyle: React.CSSProperties = {
  fontFamily: "Outfit, sans-serif",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  color: "var(--fg-muted)",
};

function btn(kind: "accent" | "ghost"): React.CSSProperties {
  const base: React.CSSProperties = {
    border: "1px solid var(--border)",
    fontFamily: "Outfit, sans-serif",
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: "8px 18px",
    cursor: "pointer",
    borderRadius: 3,
  };
  return kind === "accent"
    ? { ...base, background: "var(--accent)", borderColor: "var(--accent)", color: "#FAF9F6" }
    : { ...base, background: "transparent", color: "var(--fg-muted)" };
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
