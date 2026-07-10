"use client";

import { useEffect, useRef } from "react";

/**
 * DotField — a grid of soft dots that bulges away from the cursor, like
 * pressing a fingertip into a sheet of dotted paper (reactbits "dot-field").
 * Vendored as a lightweight canvas layer for this memorial: warm gold dots
 * on paper, DPR-capped, paused when offscreen/hidden, and a still grid under
 * prefers-reduced-motion. Reads the pointer from the window so it works
 * behind the letter that sits on top of it.
 */

interface Props {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  bulgeStrength?: number;
  /** Dot colour as "r, g, b". */
  rgb?: string;
  baseAlpha?: number;
}

export function DotField({
  dotRadius = 4.5,
  dotSpacing = 18,
  cursorRadius = 650,
  bulgeStrength = 96,
  rgb = "201, 168, 120",
  baseAlpha = 0.4,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    // Thin the grid a little on phones for a lighter paint.
    const spacing = isMobile ? dotSpacing * 1.4 : dotSpacing;
    const rDot = isMobile ? dotRadius * 0.85 : dotRadius;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let offX = 0;
    let offY = 0;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / spacing) + 1;
      rows = Math.ceil(h / spacing) + 1;
      // Centre the grid so the margins are even.
      offX = (w - (cols - 1) * spacing) / 2;
      offY = (h - (rows - 1) * spacing) / 2;
    };
    layout();

    // Pointer in the canvas's local space; starts far away (no bulge).
    const mouse = { x: -9999, y: -9999 };
    const target = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      target.x = -9999;
      target.y = -9999;
    };
    if (!reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // Ease the cursor for a soft, weighty bulge.
      mouse.x += (target.x - mouse.x) * 0.16;
      mouse.y += (target.y - mouse.y) * 0.16;

      const cr2 = cursorRadius * cursorRadius;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offX + i * spacing;
          const y = offY + j * spacing;
          let dx = x - mouse.x;
          let dy = y - mouse.y;
          const d2 = dx * dx + dy * dy;
          let px = x;
          let py = y;
          let alpha = baseAlpha;
          let r = rDot;
          if (d2 < cr2 && d2 > 0.0001) {
            const dist = Math.sqrt(d2);
            const t = 1 - dist / cursorRadius; // 0 at edge → 1 at cursor
            const f = t * t; // ease
            const push = bulgeStrength * f;
            const nx = dx / dist;
            const ny = dy / dist;
            px = x + nx * push;
            py = y + ny * push;
            // Dots crowding the rim of the bulge brighten and swell a touch.
            alpha = baseAlpha + f * 0.45;
            r = rDot * (1 + f * 0.5);
          }
          ctx.beginPath();
          ctx.arc(px, py, r * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    let raf = 0;
    let running = true;
    let visible = true;
    const loop = () => {
      if (running && visible) draw();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      draw(); // one static frame
    } else {
      raf = requestAnimationFrame(loop);
    }

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((entries) => {
            visible = entries[0]?.isIntersecting ?? true;
          })
        : null;
    io?.observe(canvas);

    const onVisibility = () => {
      running = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      layout();
      if (reduced) draw();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      if (!reduced) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onMove);
        document.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [dotRadius, dotSpacing, cursorRadius, bulgeStrength, rgb, baseAlpha]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        // Feather the field into the paper so it has no hard rectangle.
        WebkitMaskImage:
          "radial-gradient(ellipse 92% 88% at 50% 50%, black 55%, transparent 100%)",
        maskImage: "radial-gradient(ellipse 92% 88% at 50% 50%, black 55%, transparent 100%)",
      }}
    />
  );
}
