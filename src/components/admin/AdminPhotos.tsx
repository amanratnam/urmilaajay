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
const SUBJECTS = ["urmila", "ajay", "both", "family", "friends", "others"];

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

  useEffect(() => { load(); }, [load]);

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
  const saveYear = (id: string, raw: string) => {
    const num = parseInt(raw, 10);
    const year = Number.isFinite(num) && num > 1800 && num < 2200 ? num : null;
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, year } : p)));
    if (year != null) patch(id, { year });
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = photos.findIndex((p) => p.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= photos.length) return;
    const a = photos[idx];
    const b = photos[swap];
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
      <div style={headerRow}>
        <h2 style={h2Style}>Photos</h2>
        <span style={metaStyle}>{photos.length} total</span>
      </div>

      {/* Upload dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
          background: dragOver ? "rgba(139, 110, 63, 0.06)" : "rgba(255,253,247,0.5)",
          borderRadius: 4,
          padding: "28px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.3s, background 0.3s",
          marginBottom: 20,
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "var(--fg)", margin: "0 0 4px" }}>
          {uploading ? "Uploading…" : "Drop photos here, or click to choose"}
        </p>
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "var(--fg-muted)", margin: 0 }}>
          JPG / PNG / WebP · up to 25 MB · blur + dimensions generated automatically
        </p>
      </div>

      {msg && (
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "var(--accent)", marginBottom: 16 }}>
          {msg}
        </p>
      )}

      {/* Photo grid — full width, responsive */}
      {loading ? (
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "var(--fg-muted)" }}>Loading…</p>
      ) : photos.length === 0 ? (
        <p style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic", color: "var(--fg-muted)" }}>
          No photos yet. Upload the first above.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          <AnimatePresence>
            {photos.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.4, ease }}
                style={photoCardStyle}
              >
                {/* Thumb */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 11",
                    overflow: "hidden",
                    background: "var(--bg-elevated)",
                    borderRadius: 4,
                    marginBottom: 12,
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {p.src && (
                    <Image src={p.src} alt={p.caption || "photo"} fill sizes="280px" draggable={false} style={{ objectFit: "cover", pointerEvents: "none" }} />
                  )}
                  {/* Sort badge */}
                  <span style={sortBadge}>{String(i + 1).padStart(2, "0")}</span>
                </div>

                {/* Editable fields — caption */}
                <input
                  defaultValue={p.caption}
                  placeholder="Add a caption…"
                  onBlur={(e) => { if (e.target.value !== p.caption) saveCaption(p.id, e.target.value); }}
                  style={fieldStyle}
                />

                {/* Subject + year row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 6, marginTop: 6 }}>
                  <select
                    value={SUBJECTS.includes(p.subject) ? p.subject : "others"}
                    onChange={(e) => saveSubject(p.id, e.target.value)}
                    style={fieldStyle}
                  >
                    {SUBJECTS.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1800"
                    max="2200"
                    defaultValue={p.year ?? ""}
                    placeholder="Year"
                    onBlur={(e) => { if (e.target.value !== String(p.year ?? "")) saveYear(p.id, e.target.value); }}
                    style={fieldStyle}
                  />
                </div>

                {/* Action row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => move(p.id, -1)} disabled={i === 0} style={iconBtn(i === 0)} title="Move up">↑</button>
                    <button onClick={() => move(p.id, 1)} disabled={i === photos.length - 1} style={iconBtn(i === photos.length - 1)} title="Move down">↓</button>
                  </div>
                  <button onClick={() => remove(p.id)} style={deleteBtn}>Delete</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

const headerRow: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: 24,
  flexWrap: "wrap",
  gap: 12,
};

const h2Style: React.CSSProperties = {
  fontFamily: "Fraunces, Georgia, serif",
  fontSize: 30,
  fontWeight: 300,
  color: "var(--fg)",
  margin: 0,
  letterSpacing: "-0.01em",
};

const metaStyle: React.CSSProperties = {
  fontFamily: "Outfit, sans-serif",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  color: "var(--fg-muted)",
};

const photoCardStyle: React.CSSProperties = {
  background: "rgba(255,253,247,0.85)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  boxShadow: "var(--shadow)",
};

const fieldStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontFamily: "Outfit, sans-serif",
  fontSize: 13,
  padding: "8px 10px",
  outline: "none",
  width: "100%",
  borderRadius: 3,
};

const sortBadge: React.CSSProperties = {
  position: "absolute",
  top: 8,
  left: 8,
  background: "rgba(31,27,23,0.7)",
  color: "#FAF9F6",
  fontFamily: "Outfit, sans-serif",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.08em",
  padding: "3px 7px",
  borderRadius: 2,
  zIndex: 1,
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
    borderRadius: 3,
  };
}

const deleteBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #B85C3F",
  color: "#B85C3F",
  fontFamily: "Outfit, sans-serif",
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "7px 14px",
  cursor: "pointer",
  borderRadius: 3,
  transition: "background 0.2s, color 0.2s",
};
