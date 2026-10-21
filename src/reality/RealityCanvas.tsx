"use client";
import { getCaps } from "@/lib/device";

import { useEffect, useRef } from "react";
import { VERTEX } from "./shaders/lib";

type GLState = {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram | null;
  uni: Record<string, WebGLUniformLocation | null>;
};

function hexToRgb(value: string): [number, number, number] {
  const v = value.trim();
  const m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const rgb = v.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b] = rgb[1].split(/[ ,/]+/).map(Number);
    return [r / 255, g / 255, b / 255];
  }
  return [0.07, 0.07, 0.07];
}

/** Resolve a CSS colour token (which may be color-mix etc.) to rgb via the browser. */
function token(name: string): [number, number, number] {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return hexToRgb(c);
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("[reality] shader compile failed", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

const NAMES = ["u_res", "u_time", "u_mouse", "u_scroll", "u_bg", "u_ink", "u_accent", "u_dark"];

export default function RealityCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power", preserveDrawingBuffer: false });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    const state: GLState = { gl, prog: null, uni: {} };
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);

    let shaders: Record<string, string> | null = null;
    let colors = { bg: [0, 0, 0], ink: [1, 1, 1], accent: [1, 0.5, 0], dark: 1 };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || coarse;
    // Software rasterisers (no GPU) get one still frame instead of an animation loop.
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    const still = /swiftshader|llvmpipe|software|basic render/i.test(renderer) || getCaps().lite;
    // Pixel-art realities stay sharp; everything else renders at reduced resolution.
    const SHARP = new Set(["teletext", "dither1bit", "retrodesktop", "web1", "memphis", "opart", "datamosh"]);
    let scale = 0.5;

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let scroll = 0;
    let raf = 0;
    let running = true;
    let visible = true;
    let last = 0;
    const start = performance.now();

    const applyReality = (id: string) => {
      if (!shaders || !vs) return;
      const src = shaders[id] ?? shaders.glass;
      const fs = compile(gl, gl.FRAGMENT_SHADER, src);
      if (!fs) return;
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn("[reality] link failed", gl.getProgramInfoLog(prog));
        return;
      }
      if (state.prog) gl.deleteProgram(state.prog);
      state.prog = prog;
      gl.useProgram(prog);
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      state.uni = Object.fromEntries(NAMES.map((n) => [n, gl.getUniformLocation(prog, n)]));
      scale = SHARP.has(id) ? Math.min(1, window.devicePixelRatio || 1) : lowEnd ? 0.35 : 0.5;
      resize();
    };

    const readColors = () => {
      colors = {
        bg: token("--bg"),
        ink: token("--ink"),
        accent: token("--accent"),
        dark: document.documentElement.dataset.theme === "dark" ? 1 : 0,
      };
    };

    const resize = () => {
      const w = Math.max(1, Math.floor(window.innerWidth * scale));
      const h = Math.max(1, Math.floor(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      if (reduce.matches || still) draw(performance.now());
    };

    const draw = (now: number) => {
      if (!state.prog) return;
      const u = state.uni;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      gl.uniform2f(u.u_res, canvas.width, canvas.height);
      gl.uniform1f(u.u_time, reduce.matches || still ? 12.0 : (now - start) / 1000);
      gl.uniform2f(u.u_mouse, mouse.x, mouse.y);
      gl.uniform1f(u.u_scroll, scroll);
      gl.uniform3f(u.u_bg, colors.bg[0], colors.bg[1], colors.bg[2]);
      gl.uniform3f(u.u_ink, colors.ink[0], colors.ink[1], colors.ink[2]);
      gl.uniform3f(u.u_accent, colors.accent[0], colors.accent[1], colors.accent[2]);
      gl.uniform1f(u.u_dark, colors.dark);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frameInterval = lowEnd ? 1000 / 30 : 1000 / 45;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!running || !visible || reduce.matches || still) return;
      if (now - last < frameInterval) return;
      last = now;
      draw(now);
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll = max > 0 ? window.scrollY / max : 0;
      // The field shows fully in the first screen, then a veil rises for reading.
      const veilOn = window.scrollY > window.innerHeight * 0.55;
      document.documentElement.style.setProperty("--veil-now", veilOn ? "var(--veil)" : "0");
    };
    const onVis = () => {
      running = document.visibilityState === "visible";
    };
    const onReality = () => {
      readColors();
      applyReality(document.documentElement.dataset.reality || "glass");
      if (reduce.matches || still) draw(performance.now());
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // Shaders arrive after first paint so they never block the page.
    const loadShaders = () =>
      import("./shaders").then((m) => {
        shaders = m.SHADERS;
        readColors();
        applyReality(document.documentElement.dataset.reality || "glass");
        canvas.dataset.ready = "1";
        raf = requestAnimationFrame(loop);
        draw(performance.now());
      });
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(loadShaders, { timeout: 2500 });
    else setTimeout(loadShaders, 300);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("reality:change", onReality);
    document.addEventListener("visibilitychange", onVis);
    reduce.addEventListener?.("change", onReality);
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("reality:change", onReality);
      document.removeEventListener("visibilitychange", onVis);
      reduce.removeEventListener?.("change", onReality);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <>
      <canvas
        ref={ref}
        aria-hidden="true"
        className="no-print"
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100lvh", zIndex: -2, imageRendering: "auto", pointerEvents: "none", opacity: 1, transition: "opacity 600ms" }}
      />
      <div className="veil no-print" aria-hidden="true" />
    </>
  );
}
