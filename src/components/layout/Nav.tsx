"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Nav() {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "28px 48px",
        pointerEvents: "none",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: 15,
          fontWeight: 300,
          color: "var(--fg-muted)",
          textDecoration: "none",
          letterSpacing: "0.01em",
          pointerEvents: "auto",
          transition: "color 400ms var(--ease-memorial)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
      >
        Urmila & Ajay
      </Link>

      <div style={{ display: "flex", gap: 32, pointerEvents: "auto" }}>
        <NavLink href="#archive">Archive</NavLink>
        <NavLink href="#memories">Memories</NavLink>
      </div>
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        fontFamily: "Inter Tight, sans-serif",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--fg-muted)",
        textDecoration: "none",
        transition: "color 400ms var(--ease-memorial)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
    >
      {children}
    </a>
  );
}
