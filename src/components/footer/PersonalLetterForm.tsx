"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Personal letter form — visitor sends a private note straight to the admin.
 * Plain-text body (paragraphs preserved) — safer than rich HTML and renders
 * beautifully as a serif letter in the admin Letters view.
 */
export function PersonalLetterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const mountedAt = useRef(Date.now());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - mountedAt.current < 3000) {
      setErrorMsg("Take a moment, then send.");
      return;
    }
    const trimmedBody = body.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !trimmedBody) return;
    if (trimmedBody.length > 1000) {
      setErrorMsg("Please keep your letter under 1000 characters.");
      return;
    }
    // very light client-side email shape check; server re-validates
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, body: trimmedBody }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Something went wrong.");
      }
      setStatus("success");
      setName("");
      setEmail("");
      setBody("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div
      id="memories"
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <span className="hero-eyebrow" style={{ display: "block", marginBottom: 18 }}>
        A private letter
      </span>
      <h2
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 300,
          color: "var(--fg)",
          margin: "0 0 14px",
          letterSpacing: "-0.01em",
          lineHeight: 1.12,
        }}
      >
        Write to <em style={{ fontWeight: 400, fontStyle: "italic" }}>Aman</em>
      </h2>
      <p
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: 16,
          fontStyle: "italic",
          fontWeight: 300,
          color: "var(--fg-muted)",
          margin: "0 auto 32px",
          maxWidth: 480,
          lineHeight: 1.6,
        }}
      >
        Share a memory of mom or dad just with me — privately, like a quiet letter.
      </p>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.p
            key="ok"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: 17,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--accent)",
              lineHeight: 1.6,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Thank you. Your letter has reached me.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onSubmit={submit}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 14,
              textAlign: "left",
            }}
          >
            {/* honeypot */}
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={80}
                required
                style={inputStyle}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                maxLength={140}
                required
                style={inputStyle}
              />
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Dear Aman,&#10;&#10;…"
              maxLength={1000}
              required
              rows={8}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 200,
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: 16,
                fontWeight: 300,
                lineHeight: 1.7,
                fontStyle: "italic",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "Outfit, sans-serif" }}>
                {body.length} / 1000 characters
              </span>
              {errorMsg && (
                <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "var(--accent)" }}>
                  {errorMsg}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={status === "submitting"}
              style={{
                justifySelf: "start",
                background: "var(--accent)",
                border: "none",
                color: "#FAF9F6",
                fontFamily: "Outfit, sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "14px 28px",
                cursor: "pointer",
                borderRadius: 4,
                opacity: status === "submitting" ? 0.5 : 1,
                marginTop: 6,
              }}
            >
              {status === "submitting" ? "Sending…" : "Send the letter"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.6)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "Outfit, sans-serif",
  fontSize: 14,
  padding: "12px 16px",
  outline: "none",
  width: "100%",
  borderRadius: 4,
};
