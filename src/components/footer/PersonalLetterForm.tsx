"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Owl } from "./Owl";

const ease = [0.22, 1, 0.36, 1] as const;

type Phase = "idle" | "sending" | "flying" | "done";

// Possible owl exit trajectories — picked at random on each send
const EXITS = [
  { x: 65, y: -120, rot: 18 },   // top-right
  { x: -65, y: -120, rot: -18 }, // top-left
  { x: 0, y: -140, rot: 4 },     // top-centre, slight tilt
  { x: 95, y: -140, rot: 28 },   // far top-right
  { x: -95, y: -140, rot: -28 }, // far top-left
  { x: 30, y: -160, rot: 10 },   // straight-up-right
];

export function PersonalLetterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [flightSeed, setFlightSeed] = useState(0);
  const mountedAt = useRef(Date.now());

  const exit = useMemo(() => EXITS[flightSeed % EXITS.length], [flightSeed]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - mountedAt.current < 3000) {
      setErrorMsg("Take a moment, then send.");
      return;
    }
    const trimmedBody = body.trim();
    const trimmedName = name.trim() || "Anonymous";
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedBody) return;
    if (trimmedBody.length > 1000) {
      setErrorMsg("Please keep your letter under 1000 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setPhase("sending");
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

      // Pick a random exit trajectory and launch the owl
      setFlightSeed(Math.floor(Math.random() * EXITS.length));
      setPhase("flying");

      // Clear the form (so when the user submits again it's clean)
      setName("");
      setEmail("");
      setBody("");

      // After the flight completes, show the gratitude message
      setTimeout(() => setPhase("done"), 2400);
    } catch (err) {
      setPhase("idle");
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
        A letter
      </span>
      <h2
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 300,
          color: "var(--fg)",
          margin: "0 0 16px",
          letterSpacing: "-0.015em",
          lineHeight: 1.05,
        }}
      >
        Write to <em style={{ fontWeight: 400, fontStyle: "italic", color: "var(--accent)" }}>us</em>
      </h2>
      <p
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: 17,
          fontStyle: "italic",
          fontWeight: 300,
          color: "var(--fg-muted)",
          margin: "0 auto 40px",
          maxWidth: 540,
          lineHeight: 1.65,
        }}
      >
        Share anything anonymously and personally to us, just like you would write a letter.
      </p>

      <AnimatePresence mode="wait">
        {phase === "done" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            style={{ maxWidth: 520, margin: "0 auto" }}
          >
            <p
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: 22,
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--accent)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              We highly appreciate this!
            </p>
            <p
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: 17,
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--fg-muted)",
                lineHeight: 1.6,
                marginTop: 10,
              }}
            >
              We will reach out to you to talk more.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "flying" ? 0.35 : 1 }}
            transition={{ duration: 0.6 }}
            onSubmit={submit}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 18,
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

            <FieldRow>
              <Field
                label="Your kind name"
                helper="Or you can choose to stay anonymous"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your kind name"
                  maxLength={80}
                  disabled={phase !== "idle"}
                  style={inputStyle}
                />
              </Field>
              <Field
                label="Your email"
                helper="This is where we can reach out to you :)"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  maxLength={140}
                  required
                  disabled={phase !== "idle"}
                  style={inputStyle}
                />
              </Field>
            </FieldRow>

            <Field label="Your memory">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Feel free to write your raw-est memories that you would love to share with us. We treasure each and every memory / thought / story shared with us and will preserve it forever."
                maxLength={1000}
                required
                rows={9}
                disabled={phase !== "idle"}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 220,
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 16,
                  fontWeight: 300,
                  lineHeight: 1.75,
                  fontStyle: "italic",
                }}
              />
            </Field>

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

            {/* Submit area — also hosts the flying owl on send */}
            <div
              style={{
                position: "relative",
                minHeight: 56,
                marginTop: 6,
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <AnimatePresence>
                {phase !== "flying" && (
                  <motion.button
                    key="submit"
                    type="submit"
                    disabled={phase === "sending"}
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4, y: -6 }}
                    transition={{ duration: 0.35, ease }}
                    style={{
                      background: "var(--accent)",
                      border: "none",
                      color: "#FAF9F6",
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      padding: "14px 28px",
                      cursor: phase === "idle" ? "pointer" : "default",
                      borderRadius: 4,
                      opacity: phase === "sending" ? 0.6 : 1,
                    }}
                  >
                    {phase === "sending" ? "Folding the letter…" : "Send the letter"}
                  </motion.button>
                )}

                {phase === "flying" && (
                  <motion.div
                    key="owl"
                    initial={{ opacity: 0, scale: 0.25, x: 60, y: 8 }}
                    animate={{
                      opacity: [0, 1, 1, 1, 0],
                      scale: [0.25, 1.05, 1, 0.85, 0.55],
                      x: [60, 60, `${exit.x * 0.35}vw`, `${exit.x * 0.75}vw`, `${exit.x}vw`],
                      y: [8, 0, `${exit.y * 0.4}vh`, `${exit.y * 0.78}vh`, `${exit.y}vh`],
                      rotate: [0, exit.rot * 0.15, exit.rot * 0.55, exit.rot, exit.rot * 1.1],
                    }}
                    transition={{
                      duration: 2.3,
                      times: [0, 0.18, 0.42, 0.78, 1],
                      ease: [0.32, 0, 0.4, 1],
                    }}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      zIndex: 60,
                      pointerEvents: "none",
                    }}
                  >
                    <Owl size={84} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 18,
      }}
      className="lf-row"
    >
      <style>{`
        @media (min-width: 769px) {
          .lf-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      {children}
    </div>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
        {label}
      </span>
      {children}
      {helper && (
        <span
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontStyle: "italic",
            fontSize: 12,
            fontWeight: 300,
            color: "var(--fg-muted)",
            marginTop: 2,
          }}
        >
          {helper}
        </span>
      )}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "Outfit, sans-serif",
  fontSize: 14,
  padding: "13px 16px",
  outline: "none",
  width: "100%",
  borderRadius: 4,
};
