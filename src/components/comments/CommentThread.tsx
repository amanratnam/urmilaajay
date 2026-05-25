"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface Props {
  photoId: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function CommentThread({ photoId }: Props) {
  const [comments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const submitTimeRef = useRef(Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (honeypot) return;

    // Time-to-submit guard (bots submit instantly)
    if (Date.now() - submitTimeRef.current < 3000) return;

    const trimmedBody = body.trim();
    if (!name.trim() || !trimmedBody) return;
    if (trimmedBody.length > 1000) {
      setErrorMsg("Please keep your memory under 1000 characters.");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_id: photoId, author_name: name.trim(), body: trimmedBody }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
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
    <section
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "64px 40px 96px",
      }}
    >
      <h2
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: 28,
          fontWeight: 300,
          color: "var(--fg)",
          marginBottom: 48,
          letterSpacing: "-0.01em",
        }}
      >
        Memories
      </h2>

      {/* Approved comments */}
      {comments.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 40, marginBottom: 64 }}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              style={{ borderLeft: "1px solid var(--border)", paddingLeft: 20 }}
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
              <span
                style={{
                  fontFamily: "Inter Tight, sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--fg-muted)",
                }}
              >
                {c.author_name}
              </span>
            </motion.div>
          ))}
        </div>
      ) : null}

      {/* Submission form */}
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: 16,
              fontWeight: 300,
              fontStyle: "italic",
              color: "var(--fg-muted)",
              lineHeight: 1.7,
            }}
          >
            Thank you — your memory has been received and will appear here once approved.
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* Honeypot — hidden from real users */}
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How you knew her"
                maxLength={80}
                required
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>A memory</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share a moment, a feeling, anything…"
                maxLength={1000}
                required
                rows={5}
                style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
              <span
                style={{
                  fontFamily: "Inter Tight, sans-serif",
                  fontSize: 10,
                  color: "var(--fg-muted)",
                  textAlign: "right",
                  opacity: 0.6,
                }}
              >
                {body.length} / 1000
              </span>
            </div>

            {errorMsg ? (
              <p style={{ fontFamily: "Inter Tight, sans-serif", fontSize: 12, color: "var(--accent)", margin: 0 }}>
                {errorMsg}
              </p>
            ) : null}

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
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "12px 24px",
                cursor: "pointer",
                opacity: status === "submitting" ? 0.5 : 1,
                transition: "border-color 0.3s, opacity 0.3s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.borderColor = "var(--fg-muted)")}
              onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.borderColor = "var(--border)")}
            >
              {status === "submitting" ? "Sending…" : "Leave a memory"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "Inter Tight, sans-serif",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--fg-muted)",
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "Inter Tight, sans-serif",
  fontSize: 14,
  padding: "12px 16px",
  outline: "none",
  width: "100%",
  transition: "border-color 0.3s",
};

function inputFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = "var(--fg-muted)";
}
function inputBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = "var(--border)";
}
