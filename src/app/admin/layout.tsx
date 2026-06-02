"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const TABS: { href: string; label: string }[] = [
  { href: "/admin/memories", label: "Memories" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/letters", label: "Letters" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Auth state
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  // Login form state
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const verify = useCallback(async (pw: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/verify", { headers: { "x-admin-password": pw } });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // Verify the stored password on mount
  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") : null;
    if (!stored) {
      setChecking(false);
      return;
    }
    verify(stored).then((ok) => {
      if (!ok) sessionStorage.removeItem("admin_pw");
      setAuthed(ok);
      setChecking(false);
    });
  }, [verify]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pw = password.trim();
    if (!pw) return;
    setSubmitting(true);
    setAuthError("");
    const ok = await verify(pw);
    if (ok) {
      sessionStorage.setItem("admin_pw", pw);
      setAuthed(true);
    } else {
      setAuthError("Incorrect password.");
    }
    setSubmitting(false);
  };

  const signOut = () => {
    sessionStorage.removeItem("admin_pw");
    setAuthed(false);
    setPassword("");
    router.push("/admin");
  };

  // While we're checking the stored password
  if (checking) {
    return (
      <div style={shellStyle}>
        <div style={{ padding: "120px 32px", textAlign: "center", color: "var(--fg-muted)", fontFamily: "Outfit, sans-serif", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Checking access…
        </div>
      </div>
    );
  }

  // ─── Not authed → render login form (children NEVER mount) ─────────
  if (!authed) {
    return (
      <div style={shellStyle}>
        <AdminHeader signedIn={false} />
        <main style={{ ...mainStyle, maxWidth: 480, padding: "120px 24px 64px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <h1
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 36,
                  fontWeight: 300,
                  letterSpacing: "-0.01em",
                  marginBottom: 12,
                  color: "var(--fg)",
                }}
              >
                Admin
              </h1>
              <p
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 16,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "var(--fg-muted)",
                  margin: "0 0 36px",
                  lineHeight: 1.5,
                }}
              >
                Sign in to manage memories, photos, and letters.
              </p>
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 360 }}>
                <label
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  style={inputStyle}
                />
                {authError && (
                  <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "#B85C3F", margin: 0 }}>{authError}</p>
                )}
                <button type="submit" disabled={submitting} style={primaryBtn}>
                  {submitting ? "Checking…" : "Enter"}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // ─── Authed → render admin shell + active tab content ─────────────
  return (
    <div style={shellStyle}>
      <AdminHeader signedIn signOut={signOut} />

      <div style={tabsStrip}>
        {TABS.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: active ? "var(--accent)" : "var(--fg-muted)",
                textDecoration: "none",
                padding: "14px 0",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "color 200ms, border-color 200ms",
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <main style={mainStyle}>{children}</main>
    </div>
  );
}

function AdminHeader({ signedIn, signOut }: { signedIn: boolean; signOut?: () => void }) {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(250,249,246,0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Link
          href="/"
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            textDecoration: "none",
          }}
        >
          ← Site
        </Link>
        <span
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 18,
            fontWeight: 400,
            color: "var(--fg)",
            letterSpacing: "-0.005em",
          }}
        >
          Admin
        </span>
      </div>
      {signedIn && (
        <button
          onClick={signOut}
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Sign out
        </button>
      )}
    </header>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: "100svh",
  background: "var(--bg)",
  color: "var(--fg)",
  fontFamily: "Outfit, sans-serif",
};

const tabsStrip: React.CSSProperties = {
  display: "flex",
  gap: 36,
  padding: "0 32px",
  borderBottom: "1px solid var(--border)",
  background: "var(--bg)",
  position: "sticky",
  top: 65,
  zIndex: 40,
};

const mainStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "44px 32px 96px",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "Outfit, sans-serif",
  fontSize: 14,
  padding: "12px 16px",
  outline: "none",
  borderRadius: 4,
};

const primaryBtn: React.CSSProperties = {
  alignSelf: "flex-start",
  background: "var(--accent)",
  border: "none",
  color: "#FAF9F6",
  fontFamily: "Outfit, sans-serif",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "13px 26px",
  cursor: "pointer",
  borderRadius: 4,
  marginTop: 4,
};
