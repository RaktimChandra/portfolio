"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { cssColor, fontFamily, labelTexture } from "./util";
import { profile } from "@/content/profile";

const ORBIT = ["Agentic AI", "RAG", "PyTorch", "LLM agents", "Next.js", "FastAPI", "Kafka", "LightGBM", "YOLOv8", "PostgreSQL", "Spring Boot", "Docker", "React", "Solidity", "Playwright", "MLOps"];

const vert = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const frag = /* glsl */ `
uniform sampler2D map;
uniform float uTime;
uniform vec2 uTilt;
uniform vec3 uAccent;
uniform float uBack;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;

vec3 hsv(float h, float s, float v) {
  vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return v * mix(vec3(1.0), k, s);
}
float rbox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }

void main() {
  vec2 uv = vUv;
  if (uBack > 0.5) uv.x = 1.0 - uv.x;
  float d = rbox(uv - 0.5, vec2(0.5), 0.06);
  if (d > 0.0) discard;
  vec3 col = texture2D(map, uv).rgb;

  // Holographic foil: a rainbow band that slides as the card turns toward you.
  float facing = dot(vN, vV);
  float s = uv.x * 0.62 + uv.y * 0.38 - 0.5 - uTilt.x * 0.9 + uTilt.y * 0.35;
  float band = exp(-pow(s * 7.0, 2.0));
  vec3 foil = hsv(fract(uv.x * 0.8 + uv.y * 0.6 + uTilt.x * 1.2 + uTime * 0.03), 0.55, 1.0);
  col = mix(col, col * 0.7 + foil * 0.45, band * 0.38);
  // Fine diffraction lines.
  col += foil * 0.03 * (0.5 + 0.5 * sin((uv.x + uv.y) * 420.0 + uTilt.x * 30.0));
  // Edge light in the site accent.
  float edge = smoothstep(-0.03, 0.0, d);
  col = mix(col, uAccent * 1.4, edge * 0.9);
  col *= 0.88 + 0.22 * pow(max(facing, 0.0), 0.6);
  gl_FragColor = vec4(col, 1.0);
}`;

function backTexture(accent: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 1024, 1024);
  g.addColorStop(0, "#151515");
  g.addColorStop(1, "#262019");
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 1024);
  x.fillStyle = accent;
  x.fillRect(80, 80, 120, 10);
  x.fillStyle = "#f2f2f2";
  x.font = `800 150px ${fontFamily()}`;
  x.fillText("RAKTIM", 72, 270);
  x.fillText("CHANDRA", 72, 410);
  x.font = `500 40px ${fontFamily()}`;
  x.fillStyle = "#bdbdbd";
  x.fillText("AI, ML and full-stack engineer", 80, 490);
  x.fillText("SRM, Chennai · Class of 2027", 80, 545);
  const stats = [
    ["8.92", "CGPA"],
    ["17+", "clients"],
    ["7", "IEEE papers"],
    ["40+", "hackathons"],
  ];
  stats.forEach(([v, l], i) => {
    const px = 80 + (i % 2) * 440;
    const py = 690 + Math.floor(i / 2) * 170;
    x.fillStyle = accent;
    x.font = `800 96px ${fontFamily()}`;
    x.fillText(v, px, py);
    x.fillStyle = "#9a9a9a";
    x.font = `500 34px ${fontFamily()}`;
    x.fillText(l, px, py + 48);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Card({ flipped, onFlip }: { flipped: boolean; onFlip: () => void }) {
  const photo = useLoader(THREE.TextureLoader, profile.avatar);
  photo.colorSpace = THREE.SRGBColorSpace;
  const accent = useMemo(() => cssColor("--accent", "#b08f74"), []);
  const back = useMemo(() => backTexture(`#${accent.getHexString()}`), [accent]);
  const group = useRef<THREE.Group>(null);
  const flip = useRef(0);
  const uni = useMemo(
    () => ({
      front: { map: { value: photo }, uTime: { value: 0 }, uTilt: { value: new THREE.Vector2() }, uAccent: { value: accent }, uBack: { value: 0 } },
      back: { map: { value: back }, uTime: { value: 0 }, uTilt: { value: new THREE.Vector2() }, uAccent: { value: accent }, uBack: { value: 1 } },
    }),
    [photo, back, accent],
  );
  const pointer = useRef({ x: 0, y: 0 }).current;
  useEffect(() => {
    const on = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [pointer]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    flip.current += ((flipped ? Math.PI : 0) - flip.current) * Math.min(1, dt * 6);
    const ty = pointer.x * 0.45 + flip.current;
    const tx = -pointer.y * 0.3;
    g.rotation.y += (ty - g.rotation.y) * Math.min(1, dt * 5);
    g.rotation.x += (tx - g.rotation.x) * Math.min(1, dt * 5);
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
    for (const u of [uni.front, uni.back]) {
      u.uTime.value = state.clock.elapsedTime;
      u.uTilt.value.set(g.rotation.y - flip.current, g.rotation.x);
    }
  });

  const geo = useMemo(() => new THREE.PlaneGeometry(2.6, 2.6, 1, 1), []);
  return (
    <group ref={group} onClick={(e) => (e.stopPropagation(), onFlip())} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
      <mesh geometry={geo}>
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uni.front} side={THREE.FrontSide} />
      </mesh>
      <mesh geometry={geo} rotation={[0, Math.PI, 0]}>
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uni.back} side={THREE.FrontSide} />
      </mesh>
      {/* glass slab edge */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[2.62, 2.62, 0.05]} />
        <meshPhysicalMaterial color={accent} metalness={0.6} roughness={0.25} clearcoat={1} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Orbit() {
  const ref = useRef<THREE.Group>(null);
  const ink = useMemo(() => `#${cssColor("--ink", "#f2f2f2").getHexString()}`, []);
  const labels = useMemo(
    () =>
      ORBIT.map((t, i) => {
        const { tex, aspect } = labelTexture(t, { color: ink, bg: "rgba(18,18,18,0.62)" });
        const ring = i % 2;
        const n = Math.ceil(ORBIT.length / 2);
        const a = ((Math.floor(i / 2) + ring * 0.5) / n) * Math.PI * 2;
        const r = ring ? 2.95 : 2.5;
        return { tex, aspect, a, r, ring };
      }),
    [ink],
  );
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      const L = labels[i];
      L.a += dt * (L.ring ? -0.14 : 0.18);
      const tilt = L.ring ? 0.42 : -0.3;
      c.position.set(Math.cos(L.a) * L.r, Math.sin(L.a) * L.r * Math.sin(tilt) * 0.55, Math.sin(L.a) * L.r * 0.9);
      const s = 0.7 + (c.position.z + 3) * 0.05;
      c.scale.set(0.2 * L.aspect * s, 0.2 * s, 1);
      // fade labels that pass in front of the face
      const m = (c as THREE.Sprite).material as THREE.SpriteMaterial;
      const front = c.position.z > 0.2 && Math.abs(c.position.x) < 1.5 && Math.abs(c.position.y) < 1.4;
      m.opacity += ((front ? 0.12 : 1) - m.opacity) * Math.min(1, dt * 8);
    });
  });
  return (
    <group ref={ref}>
      {labels.map((L, i) => (
        <sprite key={i}>
          <spriteMaterial map={L.tex} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

function Shards() {
  const accent = useMemo(() => cssColor("--accent", "#b08f74"), []);
  const items = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ p: new THREE.Vector3(Math.cos(i * 2.1) * 2.6, Math.sin(i * 1.7) * 1.7, -0.8 - (i % 3) * 0.5), s: 0.12 + (i % 3) * 0.08, sp: 0.3 + i * 0.07 })),
    [],
  );
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    ref.current?.children.forEach((m, i) => {
      const it = items[i];
      m.rotation.x = state.clock.elapsedTime * it.sp;
      m.rotation.y = state.clock.elapsedTime * it.sp * 0.7;
      m.position.y = it.p.y + Math.sin(state.clock.elapsedTime * it.sp + i) * 0.15;
    });
  });
  return (
    <group ref={ref}>
      {items.map((it, i) => (
        <mesh key={i} position={it.p} scale={it.s}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color={i % 2 ? accent : "#d9d9d9"} metalness={0.9} roughness={0.15} clearcoat={1} iridescence={1} iridescenceIOR={1.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function HoloPortrait() {
  const [flipped, setFlipped] = useState(false);
  const [live, setLive] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    const vis = () => setLive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", vis);
    return () => (io.disconnect(), document.removeEventListener("visibilitychange", vis));
  }, []);

  return (
    <div ref={wrap} className="holo" onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setFlipped((f) => !f))} tabIndex={0} role="button" aria-pressed={flipped} aria-label="3D portrait card of Raktim. Press to flip it over.">
      <Canvas frameloop={live ? "always" : "never"} dpr={[1, 1.6]} camera={{ position: [0, 0, 5.5], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <pointLight position={[-4, -2, 3]} intensity={18} color="#8fb3ff" />
        <Shards />
        <Card flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
        <Orbit />
      </Canvas>
      <p className="holo__hint text-small">{flipped ? "Click to flip back" : "Click the card to flip it"}</p>
    </div>
  );
}
