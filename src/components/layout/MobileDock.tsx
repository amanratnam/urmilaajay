"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useChromeHidden } from "@/hooks/useScrollDirection";
import { smoothScrollTo } from "@/lib/scrollTo";

/**
 * Mobile navigation dock — a floating, thumb-reachable pill at the bottom
 * of the screen, the way the best-crafted apps do it. Glassy warm paper,
 * three quiet destinations, gentle spring on touch. It steps out of the
 * way while you read (scroll down) and returns when you look up.
 *
 * Sits above iOS/Android browser chrome via safe-area insets.
 */

type SectionId = "top" | "gallery" | "memories";

const ITEMS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: "top", label: "Story", icon: <BookIcon /> },
  { id: "gallery", label: "Archive", icon: <PhotoIcon /> },
  { id: "memories", label: "Write", icon: <FeatherIcon /> },
];

export function MobileDock() {
  const hidden = useChromeHidden();
  const [active, setActive] = useState<SectionId>("top");

  // Track which chapter of the page the visitor is in.
  useEffect(() => {
    let raf = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const mid = window.innerHeight * 0.55;
      const memories = document.getElementById("memories");
      const gallery = document.getElementById("gallery");
      if (memories && memories.getBoundingClientRect().top < mid) {
        setActive("memories");
      } else if (gallery && gallery.getBoundingClientRect().top < mid) {
        setActive("gallery");
      } else {
        setActive("top");
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (id: SectionId) => {
    if (id === "top") smoothScrollTo(0);
    else smoothScrollTo(`#${id}`, id === "gallery" ? -8 : -24);
  };

  return (
    <motion.nav
      aria-label="Sections"
      initial={{ y: 96, opacity: 0 }}
      animate={{ y: hidden ? 120 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      style={{
        position: "fixed",
        left: "50%",
        x: "-50%",
        bottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
        zIndex: 200,
        display: "flex",
        alignItems: "stretch",
        gap: 2,
        padding: "6px 8px",
        borderRadius: 999,
        background: "rgba(250, 249, 246, 0.82)",
        border: "1px solid rgba(225, 220, 211, 0.9)",
        boxShadow: "0 12px 40px rgba(60, 50, 38, 0.18), 0 1px 2px rgba(60, 50, 38, 0.08)",
        backdropFilter: "blur(18px) saturate(1.1)",
        WebkitBackdropFilter: "blur(18px) saturate(1.1)",
      }}
    >
      {ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => go(item.id)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            aria-label={item.label}
            aria-current={isActive ? "true" : undefined}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              minWidth: 74,
              minHeight: 50, // comfortable 44px+ touch target
              padding: "6px 10px",
              border: "none",
              background: "transparent",
              borderRadius: 999,
              cursor: "pointer",
              color: isActive ? "var(--accent)" : "var(--fg-muted)",
              WebkitTapHighlightColor: "transparent",
              transition: "color 360ms var(--ease-memorial)",
            }}
          >
            {/* soft pill glow behind the active destination */}
            {isActive && (
              <motion.span
                layoutId="dock-active"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                style={{
                  position: "absolute",
                  inset: 2,
                  borderRadius: 999,
                  background: "rgba(201, 168, 120, 0.16)",
                  border: "1px solid rgba(201, 168, 120, 0.28)",
                }}
                aria-hidden
              />
            )}
            <span style={{ position: "relative", display: "flex" }}>{item.icon}</span>
            <span
              style={{
                position: "relative",
                fontFamily: "var(--font-body)",
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

/* ── Hand-drawn line icons, 1.5px stroke ─────────────────────────── */

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 6 C 10 4.4, 6.5 4, 4 5 V 18.5 C 6.5 17.5, 10 17.9, 12 19.5 C 14 17.9, 17.5 17.5, 20 18.5 V 5 C 17.5 4, 14 4.4, 12 6 Z" />
      <path d="M12 6 V 19.5" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <circle cx="9.2" cy="10" r="1.6" />
      <path d="M4.5 17.5 L 10 12.5 L 13.5 15.5 L 16.5 13 L 19.5 15.5" />
    </svg>
  );
}

function FeatherIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 5 C 14 4, 8.5 7.5, 7.5 13 L 5 20" />
      <path d="M19 5 C 20 10, 16.5 15.5, 11 16 L 7.5 13" />
      <path d="M9.5 11.5 L 14.5 11.5" />
    </svg>
  );
}
