"use client";

import { useEffect, useRef } from "react";

/**
 * The living sky behind the whole memorial.
 *
 * One fixed layer under every section: the light shifts from sunrise
 * (hero) through warm day (the archive) into dusk (the letters), while a
 * single canvas keeps quiet company — dust motes drifting, petals falling,
 * the occasional bird crossing, and stars with fireflies arriving as the
 * visitor reaches the letters.
 *
 * Kept deliberately cheap: one canvas, DPR-capped, densities scaled for
 * mobile, paused when the tab hides, and fully static under
 * prefers-reduced-motion.
 */

const GOLD = "201, 168, 120"; // dusty gold
const SAGE = "154, 169, 139"; // muted sage
const INK = "107, 99, 90"; // warm muted (bird silhouettes)

interface Mote {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  alpha: number;
}
interface Petal {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  sway: number;
  phase: number;
  rot: number;
  vr: number;
  sage: boolean;
}
interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}
interface Firefly {
  x: number;
  y: number;
  phase: number;
  wanderA: number;
  wanderB: number;
  pulse: number;
}
interface Bird {
  x: number;
  y: number;
  v: number;
  size: number;
  flapPhase: number;
}

const smoothstep = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

export function Atmosphere() {
  const dawnRef = useRef<HTMLDivElement>(null);
  const duskRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Static, gentle morning light for reduced-motion visitors.
    if (reduced) {
      if (dawnRef.current) dawnRef.current.style.opacity = "0.6";
      if (glowRef.current) glowRef.current.style.opacity = "0.4";
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75);

    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ── Populate the world ──────────────────────────────────────────
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const motes: Mote[] = Array.from({ length: isMobile ? 26 : 60 }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.6, 1.9),
      vy: rand(-9, -3),
      sway: rand(6, 22),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.1, 0.3),
    }));

    const petals: Petal[] = Array.from({ length: isMobile ? 3 : 6 }, () => ({
      x: rand(0, w),
      y: rand(-h, 0),
      w: rand(4, 7),
      h: rand(2.2, 3.6),
      vy: rand(9, 18),
      sway: rand(24, 60),
      phase: rand(0, Math.PI * 2),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.6, 0.6),
      sage: Math.random() > 0.5,
    }));

    const stars: Star[] = Array.from({ length: isMobile ? 34 : 64 }, () => ({
      x: rand(0, w),
      y: rand(0, h * 0.62),
      r: rand(0.5, 1.4),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.4, 1.1),
    }));

    const fireflies: Firefly[] = Array.from({ length: isMobile ? 6 : 11 }, () => ({
      x: rand(0, w),
      y: rand(h * 0.3, h * 0.95),
      phase: rand(0, Math.PI * 2),
      wanderA: rand(0.12, 0.3),
      wanderB: rand(0.07, 0.2),
      pulse: rand(0.5, 1.2),
    }));

    let birds: Bird[] = [];
    let nextFlockAt = performance.now() + rand(6000, 14000);

    // Cursor: motes drift away from the hand, very softly.
    let mx = -9999;
    let my = -9999;
    const onPointer = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    // ── Loop ────────────────────────────────────────────────────────
    let raf = 0;
    let last = performance.now();
    let running = true;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Scroll position → time of day.
      const max = document.documentElement.scrollHeight - h;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const dawn = 1 - smoothstep(p / 0.34);
      const dusk = smoothstep((p - 0.56) / 0.36);

      if (dawnRef.current) dawnRef.current.style.opacity = (dawn * 0.85).toFixed(3);
      if (duskRef.current) duskRef.current.style.opacity = (dusk * 0.9).toFixed(3);
      if (glowRef.current)
        glowRef.current.style.opacity = (0.25 + Math.max(dawn, dusk) * 0.45).toFixed(3);

      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;

      // Stars — only visible as dusk settles in.
      if (dusk > 0.02) {
        for (const s of stars) {
          const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${GOLD}, ${(dusk * tw * 0.9).toFixed(3)})`;
          ctx.fill();
        }
      }

      // Dust motes — always present, rising like pollen in light.
      for (const m of motes) {
        m.y += m.vy * dt;
        const sx = Math.sin(t * 0.4 + m.phase) * m.sway * dt;
        m.x += sx;
        // A soft push away from the cursor.
        const dx = m.x - mx;
        const dy = m.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120 && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = ((120 - d) / 120) * 26 * dt;
          m.x += (dx / d) * f;
          m.y += (dy / d) * f;
        }
        if (m.y < -8) {
          m.y = h + 8;
          m.x = rand(0, w);
        }
        if (m.x < -8) m.x = w + 8;
        if (m.x > w + 8) m.x = -8;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD}, ${m.alpha.toFixed(3)})`;
        ctx.fill();
      }

      // Petals — a few, falling slowly, tumbling.
      for (const pt of petals) {
        pt.y += pt.vy * dt;
        pt.x += Math.sin(t * 0.55 + pt.phase) * pt.sway * dt;
        pt.rot += pt.vr * dt;
        if (pt.y > h + 12) {
          pt.y = -12;
          pt.x = rand(0, w);
        }
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot + Math.sin(t * 0.8 + pt.phase) * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.w, pt.h, 0, 0, Math.PI * 2);
        ctx.fillStyle = pt.sage ? `rgba(${SAGE}, 0.4)` : `rgba(${GOLD}, 0.4)`;
        ctx.fill();
        ctx.restore();
      }

      // Fireflies — they arrive with the evening.
      if (dusk > 0.04) {
        for (const f of fireflies) {
          f.x += Math.sin(t * f.wanderA * 2 + f.phase) * 14 * dt;
          f.y += Math.cos(t * f.wanderB * 2 + f.phase * 1.7) * 11 * dt;
          if (f.x < 0) f.x = w;
          if (f.x > w) f.x = 0;
          if (f.y < h * 0.2) f.y = h * 0.2;
          if (f.y > h) f.y = h;
          const glow = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * f.pulse + f.phase));
          const a = dusk * glow;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${GOLD}, ${(a * 0.14).toFixed(3)})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(f.x, f.y, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 190, 130, ${(a * 0.9).toFixed(3)})`;
          ctx.fill();
        }
      }

      // Birds — a small flock crosses the sky now and then, daytime only.
      if (dusk < 0.5 && now > nextFlockAt) {
        const n = 1 + Math.floor(Math.random() * 3);
        const baseY = rand(h * 0.08, h * 0.3);
        const v = rand(46, 72);
        for (let i = 0; i < n; i++) {
          birds.push({
            x: -40 - i * rand(26, 46),
            y: baseY + rand(-18, 18),
            v,
            size: rand(5, 8),
            flapPhase: rand(0, Math.PI * 2),
          });
        }
        nextFlockAt = now + rand(18000, 38000);
      }
      if (birds.length > 0) {
        ctx.strokeStyle = `rgba(${INK}, 0.45)`;
        ctx.lineWidth = 1.1;
        ctx.lineCap = "round";
        for (const b of birds) {
          b.x += b.v * dt;
          b.y += Math.sin(t * 1.4 + b.flapPhase) * 5 * dt;
          const flap = Math.sin(t * 9 + b.flapPhase) * 0.5 + 0.5;
          const s = b.size;
          const lift = s * (0.4 + flap * 0.7);
          ctx.beginPath();
          ctx.moveTo(b.x - s, b.y);
          ctx.quadraticCurveTo(b.x - s * 0.5, b.y - lift, b.x, b.y);
          ctx.quadraticCurveTo(b.x + s * 0.5, b.y - lift, b.x + s, b.y);
          ctx.stroke();
        }
        birds = birds.filter((b) => b.x < w + 60);
      }
    };
    raf = requestAnimationFrame(tick);

    const onVisibility = () => {
      if (document.hidden) {
        if (running) cancelAnimationFrame(raf);
        running = false;
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      if (fine) window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Sunrise wash — soft morning-sky blue melting into warm light */}
      <div
        ref={dawnRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          transition: "opacity 300ms linear",
          background:
            "linear-gradient(180deg, rgba(173, 197, 208, 0.30) 0%, rgba(220, 213, 190, 0.14) 46%, rgba(214, 181, 133, 0.16) 100%)",
        }}
      />
      {/* Dusk wash — the evening the letters are written in */}
      <div
        ref={duskRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          transition: "opacity 300ms linear",
          background:
            "linear-gradient(180deg, rgba(96, 104, 121, 0.20) 0%, rgba(150, 131, 105, 0.14) 52%, rgba(201, 168, 120, 0.26) 100%)",
        }}
      />
      {/* Warm horizon glow, low in the frame */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          left: "-20%",
          right: "-20%",
          bottom: "-30%",
          height: "70%",
          opacity: 0.25,
          transition: "opacity 300ms linear",
          background:
            "radial-gradient(ellipse 60% 55% at 50% 100%, rgba(201, 168, 120, 0.34) 0%, rgba(201, 168, 120, 0.10) 55%, transparent 100%)",
        }}
      />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
