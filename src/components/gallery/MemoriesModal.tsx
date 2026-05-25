"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ApprovedComment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface Props {
  photoId: string;
  caption?: string;
  subjectLabel: string;
  year: number;
  onClose: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

function relativeDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function MemoriesModal({ photoId, caption, subjectLabel, year, onClose }: Props) {
  const [comments, setComments] = useState<ApprovedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const mountedAt = useRef(Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?photo_id=${encodeURIComponent(photoId)}`);
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [photoId]);

  useEffect(() => {
    load();
  }, [load]);

  // Close on Escape + lock body scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - mountedAt.current < 3000) {
      setErrorMsg("One moment before submitting, please.");
      return;
    }
    const trimmed = body.trim();
    if (!name.trim() || !trimmed) return;
    if (trimmed.length > 1000) {
      setErrorMsg("Please keep your memory under 1000 characters.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_id: photoId, author_name: name.trim(), body: trimmed }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Something went wrong.");
      }
      setStatus("success");
      setName("");
      setBody("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          background: "rgba(8,6,5,0.72)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.5, ease }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(560px, 100%)",
            maxHeight: "86vh",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "28px 32px 22px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexShrink: 0,
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 26,
                  fontWeight: 300,
                  color: "var(--fg)",
                  margin: "0 0 6px",
                  letterSpacing: "-0.01em",
                }}
              >
                Memories
              </h3>
              <span
                style={{
                  fontFamily: "Inter Tight, sans-serif",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                }}
              >
                {subjectLabel}
                {year ? ` · ${year}` : ""}
                {comments.length > 0 ? ` · ${comments.length} shared` : ""}
              </span>
            </div>
            <button
              onClick={onClose}
              data-cursor="close"
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                color: "var(--fg-muted)",
                fontSize: 24,
                lineHeight: 1,
                cursor: "pointer",
                padding: 0,
                marginTop: -2,
              }}
            >
              ×
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: "auto", padding: "24px 32px 8px", flex: 1 }}>
            {caption && (
              <p
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 16,
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  color: "var(--fg-muted)",
                  margin: "0 0 28px",
                  paddingBottom: 22,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {caption}
              </p>
            )}

            {loading ? (
              <p style={metaStyle}>Loading memories…</p>
            ) : comments.length === 0 ? (
              <p
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 17,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "var(--fg-muted)",
                  lineHeight: 1.6,
                  margin: "8px 0 24px",
                }}
              >
                No memories shared yet. Be the first to leave one.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 24 }}>
                {comments.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: Math.min(i * 0.05, 0.3) }}
                    style={{ borderLeft: "2px solid var(--accent)", paddingLeft: 18 }}
                  >
                    <p
                      style={{
                        fontFamily: "Fraunces, Georgia, serif",
                        fontSize: 16,
                        fontWeight: 300,
                        fontStyle: "italic",
                        lineHeight: 1.7,
                        color: "var(--fg)",
                        margin: "0 0 10px",
                      }}
                    >
                      {c.body}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={metaStyle}>{c.author_name}</span>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border)" }} />
                      <span style={{ ...metaStyle, opacity: 0.6 }}>{relativeDate(c.created_at)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer: add a memory */}
          <div style={{ borderTop: "1px solid var(--border)", padding: "20px 32px 28px", flexShrink: 0 }}>
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.p
                  key="ok"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontSize: 15,
                    fontStyle: "italic",
                    fontWeight: 300,
                    color: "var(--accent)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Thank you — your memory has been received and will appear here once approved.
                </motion.p>
              ) : !adding ? (
                <motion.button
                  key="trigger"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setAdding(true)}
                  data-cursor="add"
                  style={{
                    width: "100%",
                    background: "var(--accent)",
                    border: "none",
                    color: "var(--bg)",
                    fontFamily: "Inter Tight, sans-serif",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "14px 24px",
                    cursor: "pointer",
                    borderRadius: 3,
                  }}
                >
                  + Add a memory
                </motion.button>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  onSubmit={submit}
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <input
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    maxLength={80}
                    required
                    autoFocus
                    style={inputStyle}
                  />
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share a memory of them…"
                    maxLength={1000}
                    required
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                  />
                  {errorMsg && (
                    <span style={{ fontFamily: "Inter Tight, sans-serif", fontSize: 11, color: "var(--accent)" }}>
                      {errorMsg}
                    </span>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      data-cursor="send"
                      style={{
                        background: "var(--accent)",
                        border: "none",
                        color: "var(--bg)",
                        fontFamily: "Inter Tight, sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        padding: "12px 22px",
                        cursor: "pointer",
                        borderRadius: 3,
                        opacity: status === "submitting" ? 0.5 : 1,
                      }}
                    >
                      {status === "submitting" ? "Sending…" : "Share"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdding(false)}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "var(--fg-muted)",
                        fontFamily: "Inter Tight, sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        padding: "12px 22px",
                        cursor: "pointer",
                        borderRadius: 3,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const metaStyle: React.CSSProperties = {
  fontFamily: "Inter Tight, sans-serif",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--fg-muted)",
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "Inter Tight, sans-serif",
  fontSize: 14,
  padding: "11px 14px",
  outline: "none",
  width: "100%",
  borderRadius: 3,
};
