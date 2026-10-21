import * as THREE from "three";

/** Read a CSS colour token (resolving color-mix etc.) as a THREE.Color. */
export function cssColor(name: string, fallback = "#ffffff") {
  if (typeof document === "undefined") return new THREE.Color(fallback);
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return new THREE.Color(fallback);
  const [r, g, b] = m[1].split(/[ ,/]+/).map(Number);
  return new THREE.Color(r / 255, g / 255, b / 255);
}

/** The real (hashed) Archivo family name from next/font, for canvas text. */
export function fontFamily() {
  if (typeof document === "undefined") return "Arial, sans-serif";
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-archivo").trim();
  return `${v || "Archivo"}, "Arial Narrow", Arial, sans-serif`;
}

/** A crisp text label as a sprite texture (no font files to download). */
export function labelTexture(text: string, opts: { color?: string; bg?: string; size?: number; weight?: number; pad?: number; border?: string } = {}) {
  const { color = "#f2f2f2", bg = "rgba(20,20,20,0.72)", size = 44, weight = 600, pad = 22, border = "rgba(255,255,255,0.18)" } = opts;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = `${weight} ${size}px ${fontFamily()}`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = size + pad * 1.4;
  c.width = w;
  c.height = h;
  ctx.font = font;
  const r = h / 2;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(1, 1, w - 2, h - 2, r);
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, pad, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, aspect: w / h };
}

export const prefersReduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
