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
}

const ease = [0.22, 1, 0.36, 1] as const;

export function InlineComments({ photoId }: Props) {
  const [comments, setComments] = useState<ApprovedComment[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Reload when the active photo changes
  useEffect(() => {
    setStatus("idle");
    mountedAt.current = Date.now();
    load();
  }, [photoId, load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - mountedAt.current < 3000) return;
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Approved comments */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22, maxHeight: 220, overflowY: "auto" }}>
        {loading ? (
          <span style={{ ...metaStyle, opacity: 0.5 }}>Loading memories…</span>
        ) : comments.length === 0 ? (
          <span
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: 15,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--fg-muted)",
            }}
          >
            No memories shared yet. Be the first.
          </span>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
              <p
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 15,
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 1.65,
                  color: "var(--fg)",
                  margin: "0 0 8px",
                }}
              >
                {c.body}
              </p>
              <span style={metaStyle}>{c.author_name}</span>
            </div>
          ))
        )}
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: 14,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--fg-muted)",
              lineHeight: 1.6,
            }}
          >
            Thank you — your memory will appear here once approved.
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
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
              style={inputStyle}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share a memory…"
              maxLength={1000}
              required
              rows={3}
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
            />
            {errorMsg && (
              <span style={{ fontFamily: "Inter Tight, sans-serif", fontSize: 11, color: "var(--accent)" }}>
                {errorMsg}
              </span>
            )}
            <button
              type="submit"
              disabled={status === "submitting"}
              data-cursor="view"
              style={{
                alignSelf: "flex-start",
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--fg)",
                fontFamily: "Inter Tight, sans-serif",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "10px 20px",
                cursor: "none",
                opacity: status === "submitting" ? 0.5 : 1,
              }}
            >
              {status === "submitting" ? "Sending…" : "Leave a memory"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const metaStyle: React.CSSProperties = {
  fontFamily: "Inter Tight, sans-serif",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--fg-muted)",
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "Inter Tight, sans-serif",
  fontSize: 13,
  padding: "10px 14px",
  outline: "none",
  width: "100%",
};
