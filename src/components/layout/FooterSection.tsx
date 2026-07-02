"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PersonalLetterForm } from "@/components/footer/PersonalLetterForm";
import { CharReveal } from "@/components/ui/CharReveal";
import { MemorialIllustration } from "./MemorialIllustration";
import { useIsMobile } from "@/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "aman.ratnam.singh@gmail.com";

export function FooterSection() {
  const isMobile = useIsMobile();
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
            start: "top 94%",
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
        position: "relative",
        zIndex: 1,
        // The evening settles in: the footer fades up from the page into a
        // deeper, warmer tone instead of arriving behind a hard border.
        background:
          "linear-gradient(to bottom, rgba(236,231,222,0) 0%, rgba(236,231,222,0.72) 16%, rgba(236,231,222,0.92) 40%, #E9E3D8 100%)",
        padding: isMobile ? "72px 24px 28px" : "104px 40px 40px",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 44 : 56,
        perspective: "1000px",
        opacity: 0,
      }}
    >
      {/* Personal letter form */}
      <PersonalLetterForm />

      {/* ── Memorial heart ──────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 720,
          width: "100%",
          margin: "0 auto",
          paddingTop: isMobile ? 28 : 44,
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isMobile ? 22 : 28,
          textAlign: "center",
        }}
      >
        <MemorialIllustration />

        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: isMobile ? 16 : 19,
            fontWeight: 300,
            fontStyle: "italic",
            color: "var(--fg-muted)",
            margin: 0,
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          <CharReveal text="Two souls who took flight, three hearts still keeping their light." />
        </p>

        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: "clamp(36px, 6vw, 68px)",
            fontWeight: 300,
            color: "var(--fg)",
            lineHeight: 1,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Urmila <span style={{ fontStyle: "italic", color: "var(--accent)", fontWeight: 400 }}>&amp;</span> Ajay
        </h2>

        <span
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
          Remembered with love, always
        </span>
      </div>

      {/* ── Credits — centered on mobile, side-by-side on desktop ───── */}
      <div
        style={{
          maxWidth: 720,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? 18 : 24,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 12,
            fontWeight: 300,
            color: "var(--fg-muted)",
            margin: 0,
            order: isMobile ? 2 : 1,
          }}
        >
          Made with love by{" "}
          <span style={{ color: "var(--fg)", fontWeight: 500 }}>Aman, Aashi &amp; Shilpa</span>
        </p>
        <a
          href={`mailto:${EMAIL}`}
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 12,
            fontWeight: 400,
            color: "var(--fg-muted)",
            textDecoration: "none",
            letterSpacing: "0.02em",
            order: isMobile ? 1 : 2,
            transition: "color 400ms var(--ease-memorial)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
        >
          {EMAIL}
        </a>
      </div>

      {/* ── Bottom rule ─────────────────────────────────────────────── */}
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
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 11,
            color: "var(--fg-muted)",
            letterSpacing: "0.08em",
          }}
        >
          urmilaajay.com
        </span>
        <span
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 22,
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--accent)",
          }}
        >
          &amp;
        </span>
      </div>
    </footer>
  );
}
