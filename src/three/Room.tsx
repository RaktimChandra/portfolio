"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useRouter } from "@/i18n/navigation";
import { useUI } from "@/lib/store";
import { cssColor, fontFamily } from "./util";
import { track } from "@/lib/analytics";

/* A small low-poly study. Every object is a door into the site. */

type Hot = { id: string; label: string; href?: string; action?: () => void };

function posterTexture(accent: string) {
  const c = document.createElement("canvas");
  c.width = 600;
  c.height = 840;
  const x = c.getContext("2d")!;
  x.fillStyle = "#121212";
  x.fillRect(0, 0, 600, 840);
  x.strokeStyle = accent;
  x.lineWidth = 10;
  x.strokeRect(24, 24, 552, 792);
  x.fillStyle = accent;
  x.fillRect(60, 100, 90, 10);
  x.fillStyle = "#f4f1ea";
  const lines = ["SHAME", "ON ME,", "IF I DIE", "AVERAGE."];
  let size = 120;
  x.font = `800 ${size}px ${fontFamily()}`;
  while (Math.max(...lines.map((l) => x.measureText(l).width)) > 488 && size > 40) x.font = `800 ${--size}px ${fontFamily()}`;
  lines.forEach((l, i) => x.fillText(l, 56, 250 + i * size * 1.1));
  x.fillStyle = accent;
  x.font = `600 30px ${fontFamily()}`;
  x.fillText("— a promise, not a slogan", 60, 790);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function screenTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const lines = [
    ["#c38bff", "async def "], ["#8fb3ff", "score"], ["#ddd", "(txn):"],
    ["#ddd", "  votes = "], ["#8fb3ff", "await gather"], ["#ddd", "(*agents)"],
    ["#ddd", "  verdict = "], ["#3fcf8e", "consensus"], ["#ddd", "(votes)"],
    ["#ddd", "  ledger."], ["#ffcc33", "append"], ["#ddd", "(verdict)"],
    ["#ddd", "  return "], ["#ff8a7a", "verdict"], ["#ddd", ""],
  ];
  let t = 0;
  const draw = () => {
    const x = c.getContext("2d")!;
    x.fillStyle = "#0d1117";
    x.fillRect(0, 0, 512, 320);
    x.fillStyle = "#1f2630";
    x.fillRect(0, 0, 512, 26);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => ((x.fillStyle = col), x.beginPath(), x.arc(16 + i * 18, 13, 5, 0, 7), x.fill()));
    x.font = "600 22px ui-monospace, monospace";
    const shown = Math.floor(t) % 22;
    let row = 0;
    for (let i = 0; i < lines.length; i += 3) {
      if (row > shown) break;
      let px = 18;
      for (let k = 0; k < 3; k++) {
        const [col, txt] = lines[i + k];
        x.fillStyle = col;
        x.fillText(txt, px, 62 + row * 40);
        px += x.measureText(txt).width;
      }
      row++;
    }
    if (Math.floor(t * 2) % 2 === 0) {
      x.fillStyle = "#e6e6e6";
      x.fillRect(18, 62 + Math.min(row, 5) * 40 - 18, 11, 22);
    }
    tex.needsUpdate = true;
  };
  draw();
  return { tex, tick: (dt: number) => ((t += dt * 1.6), draw()) };
}

function Glow({ on, children, onClick, onOver, onOut }: { on: boolean; children: React.ReactNode; onClick: () => void; onOver: () => void; onOut: () => void }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    const s = on ? 1.05 : 1;
    g.current.scale.lerp(new THREE.Vector3(s, s, s), Math.min(1, dt * 10));
  });
  return (
    <group
      ref={g}
      onClick={(e: ThreeEvent<MouseEvent>) => (e.stopPropagation(), onClick())}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => (e.stopPropagation(), onOver(), (document.body.style.cursor = "pointer"))}
      onPointerOut={() => (onOut(), (document.body.style.cursor = ""))}
    >
      {children}
    </group>
  );
}

function Scene({ hot, setHot, go }: { hot: string | null; setHot: (h: string | null) => void; go: (id: string) => void }) {
  const accent = useMemo(() => cssColor("--accent", "#b08f74"), []);
  const acc = `#${accent.getHexString()}`;
  const poster = useMemo(() => posterTexture(acc), [acc]);
  const screen = useMemo(() => screenTexture(), []);
  const steam = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => ((pointer.current.x = e.clientX / innerWidth - 0.5), (pointer.current.y = e.clientY / innerHeight - 0.5));
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);
  useFrame((state, dt) => {
    screen.tick(dt);
    steam.current?.children.forEach((c, i) => {
      c.position.y = 0.12 + ((state.clock.elapsedTime * 0.25 + i * 0.33) % 1) * 0.35;
      ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - ((state.clock.elapsedTime * 0.25 + i * 0.33) % 1));
    });
    if (rig.current) {
      rig.current.rotation.y += (-0.38 + pointer.current.x * 0.25 - rig.current.rotation.y) * Math.min(1, dt * 3);
      rig.current.rotation.x += (0.06 + pointer.current.y * 0.08 - rig.current.rotation.x) * Math.min(1, dt * 3);
    }
  });

  const wall = "#2a2622";
  const wood = "#6b4f3a";
  const H = (id: string) => ({ on: hot === id, onClick: () => go(id), onOver: () => setHot(id), onOut: () => setHot(null) });

  return (
    <group ref={rig} position={[0.2, -1.1, 0]} rotation={[0.06, -0.38, 0]}>
      {/* room shell */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[6, 6]} /><meshStandardMaterial color="#3b332c" roughness={0.95} /></mesh>
      <mesh position={[0, 1.9, -3]}><planeGeometry args={[6, 3.8]} /><meshStandardMaterial color={wall} roughness={1} /></mesh>
      <mesh position={[-3, 1.9, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[6, 3.8]} /><meshStandardMaterial color="#26221f" roughness={1} /></mesh>
      {/* rug */}
      <mesh position={[0.3, 0.005, -0.6]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.5, 48]} /><meshStandardMaterial color={acc} roughness={1} transparent opacity={0.35} /></mesh>

      {/* desk */}
      <group position={[0.4, 0, -2.3]}>
        <mesh position={[0, 0.76, 0]} castShadow><boxGeometry args={[2.6, 0.06, 1]} /><meshStandardMaterial color={wood} roughness={0.6} /></mesh>
        {[-1.2, 1.2].map((x) => <mesh key={x} position={[x, 0.38, 0]}><boxGeometry args={[0.06, 0.76, 0.9]} /><meshStandardMaterial color="#2b2b2b" /></mesh>)}
        {/* monitor → Work */}
        <Glow {...H("monitor")}>
          <mesh position={[0, 1.35, -0.25]}><boxGeometry args={[1.3, 0.8, 0.05]} /><meshStandardMaterial color="#111" metalness={0.4} roughness={0.4} /></mesh>
          <mesh position={[0, 1.35, -0.222]}><planeGeometry args={[1.22, 0.72]} /><meshBasicMaterial map={screen.tex} toneMapped={false} /></mesh>
          <mesh position={[0, 0.95, -0.25]}><boxGeometry args={[0.08, 0.35, 0.05]} /><meshStandardMaterial color="#222" /></mesh>
          <mesh position={[0, 0.8, -0.25]}><boxGeometry args={[0.4, 0.02, 0.22]} /><meshStandardMaterial color="#222" /></mesh>
          <mesh position={[0, 0.81, 0.18]}><boxGeometry args={[0.9, 0.025, 0.28]} /><meshStandardMaterial color="#1b1b1b" /></mesh>
        </Glow>
        {/* mug → Now */}
        <Glow {...H("mug")}>
          <group position={[0.95, 0.79, 0.15]}>
            <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.07, 0.065, 0.16, 20]} /><meshStandardMaterial color={acc} roughness={0.5} /></mesh>
            <mesh position={[0.085, 0.09, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.04, 0.012, 8, 16]} /><meshStandardMaterial color={acc} /></mesh>
            <group ref={steam}>{[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.2, 0]}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color="#fff" transparent opacity={0.3} /></mesh>)}</group>
          </group>
        </Glow>
        {/* phone → Contact */}
        <Glow {...H("phone")}>
          <mesh position={[-0.85, 0.795, 0.2]} rotation={[0, 0.3, 0]}><boxGeometry args={[0.16, 0.012, 0.3]} /><meshStandardMaterial color="#0f0f0f" metalness={0.6} roughness={0.3} /></mesh>
          <mesh position={[-0.85, 0.803, 0.2]} rotation={[-Math.PI / 2, 0, 0.3]}><planeGeometry args={[0.14, 0.27]} /><meshBasicMaterial color={hot === "phone" ? acc : "#24364d"} /></mesh>
        </Glow>
        {/* lamp */}
        <group position={[-1.05, 0.79, -0.3]}>
          <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.12, 0.14, 0.04, 20]} /><meshStandardMaterial color="#222" /></mesh>
          <mesh position={[0.1, 0.35, 0]} rotation={[0, 0, -0.35]}><cylinderGeometry args={[0.012, 0.012, 0.7, 8]} /><meshStandardMaterial color="#222" /></mesh>
          <mesh position={[0.25, 0.66, 0.05]} rotation={[0.3, 0, -1]}><coneGeometry args={[0.13, 0.2, 20, 1, true]} /><meshStandardMaterial color="#222" side={THREE.DoubleSide} /></mesh>
          <pointLight position={[0.3, 0.55, 0.1]} intensity={3} distance={3} color="#ffd9a8" />
        </group>
      </group>

      {/* chair */}
      <group position={[0.4, 0, -1.25]}>
        <mesh position={[0, 0.48, 0]}><boxGeometry args={[0.55, 0.06, 0.55]} /><meshStandardMaterial color="#1c1c1c" /></mesh>
        <mesh position={[0, 0.85, 0.25]}><boxGeometry args={[0.55, 0.7, 0.06]} /><meshStandardMaterial color="#1c1c1c" /></mesh>
        <mesh position={[0, 0.24, 0]}><cylinderGeometry args={[0.03, 0.03, 0.46, 8]} /><meshStandardMaterial color="#444" /></mesh>
      </group>

      {/* poster → About */}
      <Glow {...H("poster")}>
        <mesh position={[-0.95, 2.15, -2.97]}><planeGeometry args={[1.15, 1.61]} /><meshBasicMaterial map={poster} toneMapped={false} /></mesh>
      </Glow>

      {/* certificate frames → Certifications */}
      <Glow {...H("certs")}>
        {[[1.15, 2.55], [1.65, 2.55], [1.15, 2.05], [1.65, 2.05]].map(([x, y], i) => (
          <group key={i} position={[x, y, -2.98]}>
            <mesh><boxGeometry args={[0.42, 0.32, 0.03]} /><meshStandardMaterial color="#d9c9a8" /></mesh>
            <mesh position={[0, 0, 0.02]}><planeGeometry args={[0.34, 0.24]} /><meshStandardMaterial color="#f6f1e6" /></mesh>
            <mesh position={[0, -0.06, 0.025]}><circleGeometry args={[0.035, 16]} /><meshStandardMaterial color={acc} /></mesh>
          </group>
        ))}
      </Glow>

      {/* bookshelf → Research */}
      <Glow {...H("books")}>
        <group position={[-2.75, 0, -1.6]} rotation={[0, Math.PI / 2, 0]}>
          {[0.5, 1.1, 1.7].map((y) => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[1.4, 0.04, 0.35]} /><meshStandardMaterial color={wood} /></mesh>)}
          {Array.from({ length: 21 }, (_, i) => {
            const shelf = Math.floor(i / 7);
            const h = 0.3 + ((i * 37) % 10) / 50;
            const colors = [acc, "#3d5a80", "#8a3b2e", "#2e5e4e", "#c9b27c", "#4b3f72", "#d0d0d0"];
            return <mesh key={i} position={[-0.6 + (i % 7) * 0.18, 0.52 + shelf * 0.6 + h / 2, 0]}><boxGeometry args={[0.13, h, 0.26]} /><meshStandardMaterial color={colors[i % 7]} roughness={0.8} /></mesh>;
          })}
        </group>
      </Glow>

      {/* trophy shelf → Recognition */}
      <Glow {...H("trophies")}>
        <group position={[-2.85, 2.35, -0.2]} rotation={[0, Math.PI / 2, 0]}>
          <mesh><boxGeometry args={[1.2, 0.04, 0.3]} /><meshStandardMaterial color={wood} /></mesh>
          {[-0.4, 0, 0.4].map((x, i) => (
            <group key={x} position={[x, 0.02, 0]}>
              <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.12, 0.1, 0.12]} /><meshStandardMaterial color="#222" /></mesh>
              <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.09 - i * 0.01, 0.03, 0.2, 16]} /><meshStandardMaterial color={i === 1 ? "#e5c15a" : "#c0c0c0"} metalness={1} roughness={0.25} /></mesh>
            </group>
          ))}
        </group>
      </Glow>

      {/* football → game */}
      <Glow {...H("ball")}>
        <mesh position={[1.3, 0.16, -0.4]}><icosahedronGeometry args={[0.16, 1]} /><meshStandardMaterial color="#f4f4f4" flatShading roughness={0.6} /></mesh>
      </Glow>

      {/* plant */}
      <group position={[2.3, 0, -2.5]}>
        <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.18, 0.14, 0.4, 16]} /><meshStandardMaterial color="#5a4636" /></mesh>
        {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[Math.cos(i) * 0.12, 0.6 + (i % 3) * 0.12, Math.sin(i) * 0.12]} rotation={[Math.cos(i) * 0.6, i, Math.sin(i) * 0.6]}><coneGeometry args={[0.06, 0.45, 5]} /><meshStandardMaterial color="#3f7a4a" flatShading /></mesh>)}
      </group>
    </group>
  );
}

const SPOTS: Record<string, Hot> = {
  monitor: { id: "monitor", label: "The monitor · see the work", href: "/work" },
  books: { id: "books", label: "The bookshelf · 7 IEEE papers and research", href: "/research" },
  trophies: { id: "trophies", label: "The trophy shelf · hackathons and recognition", href: "/achievements" },
  certs: { id: "certs", label: "The frames · 34 certifications", href: "/certifications" },
  poster: { id: "poster", label: "The poster · who I am and why", href: "/about" },
  phone: { id: "phone", label: "The phone · get in touch", href: "/contact" },
  mug: { id: "mug", label: "The coffee · what I'm doing now", href: "/now" },
  ball: { id: "ball", label: "The football · take a penalty" },
};

export default function Room() {
  const router = useRouter();
  const [hot, setHot] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  const go = (id: string) => {
    track("room_object_clicked", { object: id });
    const s = SPOTS[id];
    if (id === "ball") useUI.getState().open("game");
    else if (s?.href) router.push(s.href);
  };
  const cur = hot ? SPOTS[hot] : null;
  return (
    <div ref={wrap} className="room">
      <Canvas shadows={false} frameloop={live ? "always" : "never"} dpr={[1, 1.6]} camera={{ position: [0, 1.5, 5.2], fov: 44 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 3]} intensity={1.6} color="#fff4e6" />
        <pointLight position={[-2, 2.5, 1]} intensity={6} distance={8} color="#8fb3ff" />
        <Scene hot={hot} setHot={setHot} go={go} />
      </Canvas>
      <p className="room__label" aria-live="polite">{cur ? cur.label : "My desk. Click anything."}</p>
      <nav className="sr-only" aria-label="Room shortcuts">
        {Object.values(SPOTS).filter((s) => s.href).map((s) => <a key={s.id} href={s.href}>{s.label}</a>)}
      </nav>
    </div>
  );
}
