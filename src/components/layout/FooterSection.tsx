"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function FooterSection() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        { rotateX: 5, transformOrigin: "top center", opacity: 0 },
        {
          rotateX: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      style={{
        borderTop: "1px solid var(--border)",
        padding: "80px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 40,
        perspective: "1000px",
        opacity: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 40,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 300,
              color: "var(--fg)",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            Urmila & Ajay
          </p>
          <p
            style={{
              fontFamily: "Inter Tight, sans-serif",
              fontSize: 13,
              color: "var(--fg-muted)",
              lineHeight: 1.6,
            }}
          >
            Remembered with love, always.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
          <p
            style={{
              fontFamily: "Inter Tight, sans-serif",
              fontSize: 12,
              color: "var(--fg-muted)",
            }}
          >
            Made by{" "}
            <span style={{ color: "var(--fg)" }}>Aman & Aashi</span>
          </p>
          <a
            href="mailto:hello@urmilaajay.com"
            style={{
              fontFamily: "Inter Tight, sans-serif",
              fontSize: 12,
              color: "var(--fg-muted)",
              textDecoration: "none",
              transition: "color 400ms var(--ease-memorial)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
          >
            hello@urmilaajay.com
          </a>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "Inter Tight, sans-serif",
            fontSize: 11,
            color: "var(--border)",
            letterSpacing: "0.06em",
          }}
        >
          urmilaajay.com
        </span>
        <span
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 20,
            fontWeight: 300,
            color: "var(--border)",
          }}
        >
          &
        </span>
      </div>
    </footer>
  );
}
