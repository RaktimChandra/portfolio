"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { blip } from "@/lib/sound";

/** Konami-code easter egg: keep the ball in the air. Click or tap under it. */
export default function KeepyUppy() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    try { setBest(Number(localStorage.getItem("rc.keepy") || 0)); } catch {}
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const W = (c.width = c.clientWidth * devicePixelRatio);
    const H = (c.height = c.clientHeight * devicePixelRatio);
    const R = 22 * devicePixelRatio;
    const b = { x: W / 2, y: H * 0.3, vx: 0, vy: 0 };
    let s = 0;
    let raf = 0;
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--ink").trim() || "#fff";
    const accent = css.getPropertyValue("--accent").trim() || "#b08f74";
    const g = 0.42 * devicePixelRatio;

    const kick = (px: number, py: number) => {
      const dx = b.x - px;
      const dy = b.y - py;
      if (Math.hypot(dx, dy) < R * 2.6) {
        b.vy = -14 * devicePixelRatio;
        b.vx = (dx / R) * 3.2 * devicePixelRatio;
        s += 1;
        setScore(s);
        blip("tick");
      }
    };
    const onDown = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      kick((e.clientX - r.left) * devicePixelRatio, (e.clientY - r.top) * devicePixelRatio);
    };
    c.addEventListener("pointerdown", onDown);

    const loop = () => {
      b.vy += g;
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < R || b.x > W - R) (b.vx *= -0.8), (b.x = Math.max(R, Math.min(W - R, b.x)));
      if (b.y > H - R) {
        b.y = H - R;
        b.vy *= -0.45;
        b.vx *= 0.9;
        if (s > 0) {
          setBest((bst) => {
            const nb = Math.max(bst, s);
            try { localStorage.setItem("rc.keepy", String(nb)); } catch {}
            return nb;
          });
          s = 0;
          setScore(0);
          blip("close");
        }
      }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = accent;
      ctx.fillRect(0, H - 4 * devicePixelRatio, W, 4 * devicePixelRatio);
      ctx.beginPath();
      ctx.arc(b.x, b.y, R, 0, Math.PI * 2);
      ctx.fillStyle = ink;
      ctx.fill();
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.x / R);
      ctx.fillStyle = accent;
      for (let i = 0; i < 5; i++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.arc(R * 0.55, 0, R * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <Modal label="Keepy-uppy" className="game">
      <div className="game__head">
        <p className="text-lead">Keepy-uppy</p>
        <p className="tabular">Touches <b>{score}</b> · Best <b>{best}</b></p>
      </div>
      <canvas ref={ref} className="game__canvas" aria-label="Click or tap under the ball to keep it in the air" />
      <p className="text-small muted">Click just under the ball. Every touch counts; a bounce resets the count.</p>
    </Modal>
  );
}
