"use client";
import { useUI } from "./store";

let ctx: AudioContext | null = null;

/** Tiny synthesized UI sounds. Silent unless the visitor turns sound on. */
export function blip(kind: "tick" | "open" | "close" | "shift" | "goal" = "tick") {
  if (!useUI.getState().sound) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const map = { tick: [880, 0.03, "triangle"], open: [520, 0.09, "sine"], close: [340, 0.08, "sine"], shift: [660, 0.16, "sawtooth"], goal: [392, 0.5, "square"] } as const;
    const [f, d, type] = map[kind];
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (kind === "shift") o.frequency.exponentialRampToValueAtTime(f * 1.5, t + d);
    if (kind === "goal") o.frequency.setValueAtTime(523, t + 0.12), o.frequency.setValueAtTime(659, t + 0.24);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(kind === "tick" ? 0.03 : 0.06, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + d + 0.02);
  } catch {}
}
