"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useMediaQuery";

export function Nav() {
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "16px 22px" : "20px 40px",
        background: scrolled ? "rgba(250, 249, 246, 0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(1.05)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(1.05)" : "none",
        borderBottom: scrolled ? "1px solid rgba(225, 220, 211, 0.6)" : "1px solid transparent",
        transition:
          "background 360ms cubic-bezier(0.22,1,0.36,1), backdrop-filter 360ms cubic-bezier(0.22,1,0.36,1), border-color 360ms cubic-bezier(0.22,1,0.36,1), padding 360ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: isMobile ? 19 : 22,
          fontWeight: 400,
          color: "var(--fg)",
          textDecoration: "none",
          letterSpacing: "-0.005em",
          transition: "color 400ms var(--ease-memorial)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg)")}
      >
        Urmila <span style={{ fontStyle: "italic", fontWeight: 300 }}>&amp;</span> Ajay
      </Link>

      <div style={{ display: "flex", gap: isMobile ? 20 : 32 }}>
        <NavLink href="#gallery" isMobile={isMobile}>Archive</NavLink>
        <NavLink href="#memories" isMobile={isMobile}>Write</NavLink>
      </div>
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
  isMobile,
}: {
  href: string;
  children: React.ReactNode;
  isMobile: boolean;
}) {
  return (
    <a
      href={href}
      style={{
        fontFamily: "Outfit, sans-serif",
        fontSize: isMobile ? 12 : 13,
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--fg)",
        textDecoration: "none",
        transition: "color 400ms var(--ease-memorial)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg)")}
    >
      {children}
    </a>
  );
}
