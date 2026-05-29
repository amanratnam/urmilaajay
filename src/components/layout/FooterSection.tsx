"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PersonalLetterForm } from "@/components/footer/PersonalLetterForm";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "aman.ratnam.singh@gmail.com";

export function FooterSection() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        { rotateX: 4, transformOrigin: "top center", opacity: 0 },
        {
          rotateX: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 92%",
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
        background: "var(--bg-deep)",
        borderTop: "1px solid var(--border)",
        padding: "96px 24px 56px",
        display: "flex",
        flexDirection: "column",
        gap: 80,
        perspective: "1000px",
        opacity: 0,
      }}
    >
      {/* Personal letter form */}
      <PersonalLetterForm />

      {/* Identity row */}
      <div
        style={{
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 40,
          paddingTop: 56,
          borderTop: "1px solid var(--border)",
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
              margin: "0 0 14px",
            }}
          >
            Urmila &amp; Ajay
          </p>
          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "var(--fg-muted)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Remembered with love, always.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "var(--fg-muted)", margin: 0 }}>
            Made by <span style={{ color: "var(--fg)" }}>Aman &amp; Aashi</span>
          </p>
          <a
            href={`mailto:${EMAIL}`}
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 12,
              color: "var(--fg-muted)",
              textDecoration: "none",
              transition: "color 400ms var(--ease-memorial)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
          >
            {EMAIL}
          </a>
        </div>
      </div>

      {/* Bottom rule */}
      <div
        style={{
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          borderTop: "1px solid var(--border)",
          paddingTop: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 11,
            color: "var(--fg-muted)",
            letterSpacing: "0.06em",
          }}
        >
          urmilaajay.com
        </span>
        <span style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 20, fontWeight: 300, color: "var(--accent)" }}>
          &amp;
        </span>
      </div>
    </footer>
  );
}
