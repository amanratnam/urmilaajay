"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface ApprovedComment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface Props {
  open: boolean;
  photoId: string;
  caption?: string;
  subjectLabel: string;
  year: number;
  onClose: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

function relativeDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Side panel (desktop) or bottom sheet (mobile) of memories with an add form.
 * Semi-transparent glassy backdrop — the photo remains visible alongside.
 */
export function MemoriesPanel({ open, photoId, caption, subjectLabel, year, onClose }: Props) {
  const isMobile = useIsMobile();
  const [comments, setComments] = useState<ApprovedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const openedAt = useRef(Date.now());

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
    if (!open) return;
    openedAt.current = Date.now();
    setStatus("idle");
    setAdding(false);
    load();
  }, [open, photoId, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - openedAt.current < 3000) {
      setErrorMsg("Just a moment before submitting, please.");
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

  // Panel variants — side on desktop, bottom sheet on mobile
  const panelVariants = isMobile
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
    : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Soft backdrop — semi-transparent so the slid-left image stays visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(250,249,246,0.55)",
              backdropFilter: "blur(2px)",
            }}
          />

          {/* The panel */}
          <motion.aside
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.65, ease }}
            style={{
              position: "fixed",
              ...(isMobile
                ? { left: 0, right: 0, bottom: 0, top: "auto", maxHeight: "82vh" }
                : { right: 0, top: 0, bottom: 0, width: "min(520px, 46vw)" }),
              zIndex: 305,
              background: "rgba(250,249,246,0.94)",
              backdropFilter: "blur(20px)",
              borderLeft: isMobile ? "none" : "1px solid var(--border)",
              borderTop: isMobile ? "1px solid var(--border)" : "none",
              borderTopLeftRadius: isMobile ? 18 : 0,
              borderTopRightRadius: isMobile ? 18 : 0,
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: isMobile ? "20px 24px 18px" : "36px 36px 24px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                flexShrink: 0,
              }}
            >
              <div>
                {isMobile && (
                  <div
                    style={{
                      width: 40,
                      height: 3,
                      background: "var(--border)",
                      borderRadius: 3,
                      margin: "-6px auto 16px",
                    }}
                  />
                )}
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: isMobile ? 24 : 30,
                    fontWeight: 300,
                    color: "var(--fg)",
                    margin: "0 0 8px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Memories
                </h3>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.18em",
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
                aria-label="Close"
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "50%",
                  color: "var(--fg-muted)",
                  fontSize: 18,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", padding: isMobile ? "20px 24px 8px" : "28px 36px 12px", flex: 1 }}>
              {caption && (
                <p
                  style={{
                    fontFamily: "var(--font-display)",
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
                    fontFamily: "var(--font-display)",
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
                <div style={{ display: "flex", flexDirection: "column", gap: 26, marginBottom: 28 }}>
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
                          fontFamily: "var(--font-display)",
                          fontSize: 16,
                          fontWeight: 300,
                          fontStyle: "italic",
                          lineHeight: 1.7,
                          color: "var(--fg)",
                          margin: "0 0 10px",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {c.body}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={metaStyle}>{c.author_name}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border)" }} />
                        <span style={{ ...metaStyle, opacity: 0.7 }}>{relativeDate(c.created_at)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / add memory */}
            <div style={{ borderTop: "1px solid var(--border)", padding: isMobile ? "18px 24px 22px" : "22px 36px 30px", flexShrink: 0 }}>
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.p
                    key="ok"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      fontFamily: "var(--font-display)",
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
                    style={{
                      width: "100%",
                      background: "var(--accent)",
                      border: "none",
                      color: "#FAF9F6",
                      fontFamily: "var(--font-body)",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      padding: "14px 24px",
                      cursor: "pointer",
                      borderRadius: 4,
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
                      style={{ ...inputStyle, resize: "vertical", minHeight: 84 }}
                    />
                    {errorMsg && (
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--accent)" }}>{errorMsg}</span>
                    )}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        style={{
                          background: "var(--accent)",
                          border: "none",
                          color: "#FAF9F6",
                          fontFamily: "var(--font-body)",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          padding: "12px 22px",
                          cursor: "pointer",
                          borderRadius: 4,
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
                          fontFamily: "var(--font-body)",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          padding: "12px 22px",
                          cursor: "pointer",
                          borderRadius: 4,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

const metaStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--fg-muted)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  padding: "11px 14px",
  outline: "none",
  width: "100%",
  borderRadius: 4,
};
