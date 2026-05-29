"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

const easeMemorial = [0.22, 1, 0.36, 1] as const;

export default function DesignSystemPage() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parallaxRef.current || !pinRef.current) return;

    gsap.to(parallaxRef.current, {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: parallaxRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    ScrollTrigger.create({
      trigger: pinRef.current,
      start: "top center",
      end: "+=300",
      pin: true,
      pinSpacing: true,
    });

    return () => ScrollTrigger.killAll();
  }, []);

  return (
    <SmoothScrollProvider>
      <main style={{ background: "var(--bg)", minHeight: "400vh", padding: "0" }}>

        {/* ─── Section 1: Typography tokens ─── */}
        <section style={{ padding: "160px 80px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "Outfit", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 48 }}>
            Design System · Typography
          </p>

          <div className="hero-title" style={{ marginBottom: 16 }}>Urmila</div>
          <div className="hero-subtitle" style={{ marginBottom: 48 }}>& Ajay</div>
          <div className="hero-dates" style={{ marginBottom: 80 }}>1980 – 2018 &nbsp;&nbsp;·&nbsp;&nbsp; 1971 – 2021</div>

          <div className="section-header" style={{ marginBottom: 24 }}>The Archive</div>

          <p style={{ maxWidth: 640, color: "var(--fg)", marginBottom: 24 }}>
            This place will live forever in the memory of Urmila, who was a perfect mother,
            a fantastic friend, and someone who never backed down from action.
          </p>

          <p className="caption-serif" style={{ marginBottom: 24 }}>
            Italic serif caption — Fraunces, weight 300
          </p>

          <p className="tile-caption" style={{ color: "var(--accent)" }}>
            Tile label · hover state · 2003
          </p>
        </section>

        {/* ─── Section 2: Color tokens ─── */}
        <section style={{ padding: "80px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "Outfit", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 48 }}>
            Design System · Color
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { name: "--bg", value: "#12100E" },
              { name: "--bg-elevated", value: "#1A1815" },
              { name: "--fg", value: "#F2EDE4" },
              { name: "--fg-muted", value: "#8A8278" },
              { name: "--accent", value: "#C9A878" },
              { name: "--border", value: "#2A2622" },
            ].map(({ name, value }) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ width: 80, height: 80, background: value, border: "1px solid #333", borderRadius: 4 }} />
                <span style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "Outfit", letterSpacing: "0.06em" }}>{name}</span>
                <span style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "monospace" }}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 3: Framer Motion tile ─── */}
        <section style={{ padding: "80px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "Outfit", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 48 }}>
            Design System · Motion · Tile hover (600ms, memorial ease)
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                data-cursor="view"
                style={{
                  width: 280,
                  height: 360,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.6, ease: easeMemorial }}
              >
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, var(--bg-elevated) 0%, #2a2218 100%)`,
                }} />
                <motion.div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "24px 20px",
                    background: "linear-gradient(to top, rgba(10,8,6,0.9) 0%, transparent 100%)",
                    y: "100%",
                  }}
                  whileHover={{ y: "0%" }}
                  transition={{ duration: 0.6, ease: easeMemorial }}
                >
                  <p className="tile-caption">Urmila · 2003</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Section 4: Scroll-reveal (Framer Motion whileInView) ─── */}
        <section style={{ padding: "80px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "Outfit", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 48 }}>
            Design System · Scroll reveal · staggered
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, ease: easeMemorial, delay: i * 0.08 }}
                style={{
                  width: 120,
                  height: 160,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
        </section>

        {/* ─── Section 5: GSAP parallax ─── */}
        <section style={{ padding: "80px", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
          <p style={{ fontFamily: "Outfit", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 48 }}>
            Design System · GSAP parallax (0.6x speed)
          </p>
          <div style={{ height: 400, position: "relative", overflow: "hidden", borderRadius: 4 }}>
            <div
              ref={parallaxRef}
              style={{
                position: "absolute",
                inset: "-20% 0",
                background: "linear-gradient(135deg, #1e1a14 0%, #2a2218 50%, #1a1510 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="section-header" style={{ color: "var(--fg-muted)", fontSize: 32 }}>
                Parallax plane — scroll to see movement
              </span>
            </div>
          </div>
        </section>

        {/* ─── Section 6: GSAP pin ─── */}
        <section style={{ padding: "160px 80px 320px" }}>
          <p style={{ fontFamily: "Outfit", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 48 }}>
            Design System · GSAP pin (interstitial beat)
          </p>
          <div
            ref={pinRef}
            style={{
              maxWidth: 640,
              margin: "0 auto",
              padding: "80px 0",
              textAlign: "center",
            }}
          >
            <p className="caption-serif" style={{ fontSize: 28, lineHeight: 1.4 }}>
              &ldquo;She was the steadiest thing we knew.&rdquo;
            </p>
          </div>
        </section>

      </main>
    </SmoothScrollProvider>
  );
}
