"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Owl } from "./Owl";
import { CharReveal } from "@/components/ui/CharReveal";
import { useIsMobile } from "@/hooks/useMediaQuery";

const ease = [0.22, 1, 0.36, 1] as const;
const OWL_SIZE = 78;

type Phase = "idle" | "sending" | "flying" | "done";

// Exit trajectories in viewport-relative units (vw / vh). The owl ALWAYS
// starts at the submit button — only the destination is random.
const EXITS = [
  { x: 0.9, y: -1.2, rot: 22 },   // top-right
  { x: -0.9, y: -1.2, rot: -22 }, // top-left
  { x: 0.05, y: -1.4, rot: 4 },   // straight up, slight tilt
  { x: 1.2, y: -1.4, rot: 32 },   // far top-right
  { x: -1.2, y: -1.4, rot: -32 }, // far top-left
  { x: 0.4, y: -1.6, rot: 12 },   // up-right
  { x: -0.4, y: -1.6, rot: -12 }, // up-left
];

export function PersonalLetterForm() {
  const isMobile = useIsMobile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [flightSeed, setFlightSeed] = useState(0);

  const mountedAt = useRef(Date.now());
  const buttonRef = useRef<HTMLButtonElement>(null);
  // The owl is rendered position:fixed at this point; updated to the
  // button's centre right before launch.
  const [owlAnchor, setOwlAnchor] = useState<{ x: number; y: number } | null>(null);

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

      // Anchor the owl to the submit button's centre, then launch.
      if (buttonRef.current) {
        const r = buttonRef.current.getBoundingClientRect();
        setOwlAnchor({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
      setFlightSeed(Math.floor(Math.random() * EXITS.length));
      setPhase("flying");

      setName("");
      setEmail("");
      setBody("");

      setTimeout(() => setPhase("done"), 2300);
    } catch (err) {
      setPhase("idle");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // Tighter spacing so the whole form fits in one viewport on mobile.
  const formGap = isMobile ? 12 : 14;
  const textareaRows = isMobile ? 5 : 6;
  const textareaMinH = isMobile ? 120 : 150;

  return (
    <div
      id="memories"
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <span className="hero-eyebrow" style={{ display: "block", marginBottom: 12 }}>
        A letter
      </span>
      <h2
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: isMobile ? 32 : "clamp(36px, 4.5vw, 52px)",
          fontWeight: 300,
          color: "var(--fg)",
          margin: "0 0 10px",
          letterSpacing: "-0.015em",
          lineHeight: 1.05,
        }}
      >
        <CharReveal text="Write to" />{" "}
        <em style={{ fontWeight: 400, fontStyle: "italic", color: "var(--accent)" }}>
          <CharReveal text="us" />
        </em>
      </h2>
      <p
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: isMobile ? 14 : 16,
          fontStyle: "italic",
          fontWeight: 300,
          color: "var(--fg-muted)",
          margin: "0 auto 24px",
          maxWidth: 460,
          lineHeight: 1.5,
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
            style={{ maxWidth: 520, margin: "32px auto 0" }}
          >
            <p
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: isMobile ? 20 : 24,
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--accent)",
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              We highly appreciate this!
            </p>
            <p
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: isMobile ? 15 : 17,
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
            transition={{ duration: 0.5 }}
            onSubmit={submit}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: formGap,
              textAlign: "left",
            }}
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

            <FieldRow gap={formGap}>
              <Field label="Your kind name" helper="Or stay anonymous">
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
              <Field label="Your email" helper="So we can reach out to you :)">
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
                placeholder="Feel free to write your raw-est memories. We treasure each one and will preserve it forever."
                maxLength={1000}
                required
                rows={textareaRows}
                disabled={phase !== "idle"}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: textareaMinH,
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 15,
                  fontWeight: 300,
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}
              />
            </Field>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginTop: -2 }}>
              <span style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "Outfit, sans-serif" }}>
                {body.length} / 1000
              </span>
              {errorMsg && (
                <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "var(--accent)" }}>
                  {errorMsg}
                </span>
              )}
            </div>

            {/* Submit button (owl launches from its centre via fixed-position render) */}
            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 4 }}>
              <motion.button
                ref={buttonRef}
                type="submit"
                disabled={phase !== "idle"}
                initial={{ opacity: 1, scale: 1 }}
                animate={
                  phase === "flying"
                    ? { opacity: 0, scale: 0.6, transition: { duration: 0.25 } }
                    : { opacity: 1, scale: 1 }
                }
                style={{
                  background: "var(--accent)",
                  border: "none",
                  color: "#FAF9F6",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "13px 26px",
                  cursor: phase === "idle" ? "pointer" : "default",
                  borderRadius: 4,
                  opacity: phase === "sending" ? 0.6 : 1,
                }}
              >
                {phase === "sending" ? "Folding the letter…" : "Send the letter"}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── Flying owl rendered at the button's centre ──────────────── */}
      <AnimatePresence>
        {phase === "flying" && owlAnchor && (
          <motion.div
            key="owl"
            initial={{ opacity: 0, scale: 0.25, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0.9, 0],
              scale: [0.25, 1.05, 1, 0.85, 0.55],
              x: [
                0,
                0,
                `${exit.x * 35}vw`,
                `${exit.x * 80}vw`,
                `${exit.x * 120}vw`,
              ],
              y: [
                0,
                -8,
                `${exit.y * 35}vh`,
                `${exit.y * 80}vh`,
                `${exit.y * 120}vh`,
              ],
              rotate: [0, exit.rot * 0.15, exit.rot * 0.55, exit.rot, exit.rot * 1.15],
            }}
            transition={{
              duration: 2.2,
              times: [0, 0.18, 0.45, 0.78, 1],
              ease: [0.32, 0, 0.4, 1],
            }}
            style={{
              position: "fixed",
              // Place top-left of the owl so its centre lands on the button's centre
              left: owlAnchor.x - OWL_SIZE / 2,
              top: owlAnchor.y - OWL_SIZE / 2,
              zIndex: 9000,
              pointerEvents: "none",
              transformOrigin: "center",
            }}
          >
            <Owl size={OWL_SIZE} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldRow({ children, gap }: { children: React.ReactNode; gap: number }) {
  // 1 col on mobile, 2 cols on tablet+
  return (
    <div className="lf-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap }}>
      <style>{`
        @media (min-width: 640px) {
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
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
            fontSize: 11,
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
  padding: "11px 14px",
  outline: "none",
  width: "100%",
  borderRadius: 4,
};
