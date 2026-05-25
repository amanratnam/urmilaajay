"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AdminPhotos } from "@/components/admin/AdminPhotos";

interface PendingComment {
  id: string;
  photo_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

type Tab = "memories" | "photos";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("memories");
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const fetchComments = useCallback(
    async (pw: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/comments", {
          headers: { "x-admin-password": pw },
        });
        if (res.status === 401) {
          setAuthError("Incorrect password.");
          setAuthed(false);
          return;
        }
        const data = await res.json();
        setComments(data.comments ?? []);
        setAuthed(true);
        setAuthError("");
        // Persist for this session
        sessionStorage.setItem("admin_pw", pw);
      } catch {
        setAuthError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Restore session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      fetchComments(saved);
    }
  }, [fetchComments]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    fetchComments(password);
  };

  const act = async (id: string, action: "approve" | "reject") => {
    setActing(id);
    const pw = sessionStorage.getItem("admin_pw") ?? password;
    try {
      await fetch(`/api/admin/comments/${id}`, {
        method: action === "approve" ? "PATCH" : "DELETE",
        headers: { "x-admin-password": pw },
      });
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silently retry-able
    } finally {
      setActing(null);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_pw");
    setAuthed(false);
    setPassword("");
    setComments([]);
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "Inter Tight, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "28px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/"
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              textDecoration: "none",
            }}
          >
            ← Site
          </Link>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--fg)",
            }}
          >
            Admin
          </span>
        </div>
        {authed && (
          <button
            onClick={logout}
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
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

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 48px 96px" }}>
        <AnimatePresence mode="wait">
          {/* ── Login form ─────────────────────────────────────────── */}
          {!authed ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease }}
            >
              <h1
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 36,
                  fontWeight: 300,
                  letterSpacing: "-0.01em",
                  marginBottom: 48,
                  color: "var(--fg)",
                }}
              >
                Memories queue
              </h1>

              <form
                onSubmit={handleLogin}
                style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}
              >
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--fg-muted)",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--fg)",
                    fontSize: 14,
                    padding: "12px 16px",
                    outline: "none",
                    fontFamily: "Inter Tight, sans-serif",
                  }}
                />
                {authError && (
                  <p style={{ fontSize: 12, color: "var(--accent)", margin: 0 }}>{authError}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    alignSelf: "flex-start",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--fg)",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "12px 24px",
                    cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    fontFamily: "Inter Tight, sans-serif",
                    transition: "border-color 0.3s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.borderColor = "var(--fg-muted)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.borderColor = "var(--border)")
                  }
                >
                  {loading ? "Checking…" : "Enter"}
                </button>
              </form>
            </motion.div>
          ) : (
            /* ── Comment queue ───────────────────────────────────────── */
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              {/* Tab switcher */}
              <div style={{ display: "flex", gap: 24, marginBottom: 48, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                {(["memories", "photos"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      background: "none",
                      border: "none",
                      fontFamily: "Inter Tight, sans-serif",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: tab === t ? "var(--fg)" : "var(--fg-muted)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === "photos" && <AdminPhotos />}

              {tab === "memories" && (
              <>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 48,
                }}
              >
                <h1
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontSize: 36,
                    fontWeight: 300,
                    letterSpacing: "-0.01em",
                    color: "var(--fg)",
                    margin: 0,
                  }}
                >
                  Memories queue
                </h1>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--fg-muted)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {comments.length} pending
                </span>
              </div>

              {comments.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontSize: 18,
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: "var(--fg-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  All clear — no memories waiting for approval.
                </motion.p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <AnimatePresence>
                    {comments.map((c) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.5, ease }}
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          padding: "28px 32px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        {/* Meta row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "var(--fg)",
                            }}
                          >
                            {c.author_name}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--fg-muted)",
                                letterSpacing: "0.06em",
                              }}
                            >
                              Photo {c.photo_id}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--fg-muted)",
                                letterSpacing: "0.06em",
                              }}
                            >
                              {new Date(c.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Body */}
                        <p
                          style={{
                            fontFamily: "Fraunces, Georgia, serif",
                            fontSize: 16,
                            fontWeight: 300,
                            fontStyle: "italic",
                            lineHeight: 1.7,
                            color: "var(--fg)",
                            margin: 0,
                            borderLeft: "1px solid var(--border)",
                            paddingLeft: 16,
                          }}
                        >
                          {c.body}
                        </p>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                          <button
                            onClick={() => act(c.id, "approve")}
                            disabled={acting === c.id}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--accent)",
                              color: "var(--accent)",
                              fontSize: 10,
                              fontWeight: 500,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              padding: "8px 18px",
                              cursor: acting === c.id ? "default" : "pointer",
                              opacity: acting === c.id ? 0.5 : 1,
                              fontFamily: "Inter Tight, sans-serif",
                              transition: "background 0.2s, color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              const b = e.target as HTMLButtonElement;
                              b.style.background = "var(--accent)";
                              b.style.color = "var(--bg)";
                            }}
                            onMouseLeave={(e) => {
                              const b = e.target as HTMLButtonElement;
                              b.style.background = "transparent";
                              b.style.color = "var(--accent)";
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => act(c.id, "reject")}
                            disabled={acting === c.id}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--border)",
                              color: "var(--fg-muted)",
                              fontSize: 10,
                              fontWeight: 500,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              padding: "8px 18px",
                              cursor: acting === c.id ? "default" : "pointer",
                              opacity: acting === c.id ? 0.5 : 1,
                              fontFamily: "Inter Tight, sans-serif",
                              transition: "border-color 0.2s, color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              const b = e.target as HTMLButtonElement;
                              b.style.borderColor = "var(--fg-muted)";
                              b.style.color = "var(--fg)";
                            }}
                            onMouseLeave={(e) => {
                              const b = e.target as HTMLButtonElement;
                              b.style.borderColor = "var(--border)";
                              b.style.color = "var(--fg-muted)";
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <button
                onClick={() => fetchComments(sessionStorage.getItem("admin_pw") ?? password)}
                style={{
                  marginTop: 40,
                  background: "none",
                  border: "none",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-muted)",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "Inter Tight, sans-serif",
                }}
              >
                ↻ Refresh
              </button>
              </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
