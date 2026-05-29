"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AdminPhoto {
  id: string;
  storage_path: string;
  caption: string;
  subject: string;
  year: number | null;
  sort_order: number;
  src: string;
}

const ease = [0.22, 1, 0.36, 1] as const;
const SUBJECTS = ["urmila", "ajay", "both", "family"];

function pw() {
  return sessionStorage.getItem("admin_pw") ?? "";
}

export function AdminPhotos() {
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/photos", { headers: { "x-admin-password": pw() } });
      const data = await res.json();
      setPhotos(data.photos ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) return;
      setUploading(true);
      setMsg("");
      let ok = 0;
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        try {
          const res = await fetch("/api/admin/photos", {
            method: "POST",
            headers: { "x-admin-password": pw() },
            body: fd,
          });
          if (res.ok) ok++;
          else {
            const d = await res.json().catch(() => ({}));
            setMsg(d.error || "Upload failed.");
          }
        } catch {
          setMsg("Upload failed.");
        }
      }
      setUploading(false);
      if (ok > 0) setMsg(`Uploaded ${ok} photo${ok > 1 ? "s" : ""}.`);
      load();
    },
    [load]
  );

  const patch = async (id: string, body: Record<string, unknown>) => {
    await fetch(`/api/admin/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": pw() },
      body: JSON.stringify(body),
    });
  };

  const saveCaption = (id: string, caption: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
    patch(id, { caption });
  };

  const saveSubject = (id: string, subject: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, subject } : p)));
    patch(id, { subject });
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = photos.findIndex((p) => p.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= photos.length) return;
    const a = photos[idx];
    const b = photos[swap];
    // swap sort_order values
    const next = [...photos];
    next[idx] = b;
    next[swap] = a;
    setPhotos(next);
    await Promise.all([
      patch(a.id, { sort_order: b.sort_order }),
      patch(b.id, { sort_order: a.sort_order }),
    ]);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this photo permanently? This cannot be undone.")) return;
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/admin/photos/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": pw() },
    });
  };

  return (
    <div>
      {/* Upload dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
          background: dragOver ? "rgba(201,168,120,0.06)" : "var(--bg-elevated)",
          borderRadius: 2,
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.3s, background 0.3s",
          marginBottom: 16,
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 12,
            letterSpacing: "0.06em",
            color: "var(--fg)",
            margin: "0 0 6px",
          }}
        >
          {uploading ? "Uploading…" : "Drop photos here, or click to choose"}
        </p>
        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 10,
            letterSpacing: "0.06em",
            color: "var(--fg-muted)",
            margin: 0,
          }}
        >
          JPG / PNG / WebP · up to 25 MB · blur + dimensions generated automatically
        </p>
      </div>

      {msg && (
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "var(--accent)", marginBottom: 16 }}>
          {msg}
        </p>
      )}

      {/* Photo list */}
      {loading ? (
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "var(--fg-muted)" }}>Loading…</p>
      ) : photos.length === 0 ? (
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--fg-muted)",
          }}
        >
          No photos yet. Upload the first above.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AnimatePresence>
            {photos.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.4, ease }}
                style={{
                  display: "flex",
                  gap: 16,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  padding: 14,
                  alignItems: "flex-start",
                }}
              >
                {/* Thumb */}
                <div
                  style={{
                    position: "relative",
                    width: 84,
                    height: 84,
                    flexShrink: 0,
                    overflow: "hidden",
                    background: "var(--bg)",
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {p.src && (
                    <Image
                      src={p.src}
                      alt={p.caption || "photo"}
                      fill
                      sizes="84px"
                      draggable={false}
                      style={{ objectFit: "cover", pointerEvents: "none" }}
                    />
                  )}
                </div>

                {/* Fields */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    defaultValue={p.caption}
                    placeholder="Add a caption…"
                    onBlur={(e) => {
                      if (e.target.value !== p.caption) saveCaption(p.id, e.target.value);
                    }}
                    style={fieldStyle}
                  />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      value={p.subject}
                      onChange={(e) => saveSubject(p.id, e.target.value)}
                      style={{ ...fieldStyle, width: "auto", padding: "6px 10px" }}
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "var(--fg-muted)" }}>
                      {p.year ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    <button onClick={() => move(p.id, -1)} disabled={i === 0} style={iconBtn(i === 0)} title="Move up">
                      ↑
                    </button>
                    <button
                      onClick={() => move(p.id, 1)}
                      disabled={i === photos.length - 1}
                      style={iconBtn(i === photos.length - 1)}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    onClick={() => remove(p.id)}
                    style={{
                      background: "none",
                      border: "none",
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--fg-muted)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "Outfit, sans-serif",
  fontSize: 13,
  padding: "8px 12px",
  outline: "none",
  width: "100%",
};

function iconBtn(disabled: boolean): React.CSSProperties {
  return {
    background: "transparent",
    border: "1px solid var(--border)",
    color: disabled ? "var(--border)" : "var(--fg-muted)",
    width: 26,
    height: 26,
    fontSize: 12,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
  };
}
