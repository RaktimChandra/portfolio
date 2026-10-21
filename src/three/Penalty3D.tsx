"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { cssColor } from "./util";
import { blip } from "@/lib/sound";
import { track } from "@/lib/analytics";

/* Real proportions: goal 7.32 m x 2.44 m, spot 11 m out. */
const GW = 7.32, GH = 2.44, SPOT = 11;
type Phase = "aim" | "flight" | "done";
type Result = "goal" | "saved" | "wide" | "over" | "post";

function pitchTexture() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const x = c.getContext("2d")!;
  for (let i = 0; i < 8; i++) {
    x.fillStyle = i % 2 ? "#2f6b3a" : "#356f40";
    x.fillRect(0, i * 64, 512, 64);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Net() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const D = 1.6;
    for (let x = -GW / 2; x <= GW / 2 + 0.01; x += 0.3) pts.push(x, 0, -D, x, GH, -D * 0.4, x, GH, -D * 0.4, x, GH, 0);
    for (let y = 0; y <= GH + 0.01; y += 0.3) { const z = -D + (y / GH) * D * 0.6; pts.push(-GW / 2, y, z, GW / 2, y, z); }
    for (let z = 0; z >= -D; z -= 0.3) for (const s of [-1, 1]) pts.push(s * GW / 2, 0, z, s * GW / 2, GH, Math.max(z, -D * 0.4));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return <lineSegments geometry={geo}><lineBasicMaterial color="#ffffff" transparent opacity={0.35} /></lineSegments>;
}

function Keeper({ color, pose }: { color: string; pose: React.RefObject<{ x: number; y: number; tilt: number }> }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!g.current) return;
    const p = pose.current;
    g.current.position.set(p.x, p.y, 0.3);
    g.current.rotation.z = p.tilt;
  });
  return (
    <group ref={g}>
      <mesh position={[0, 1.05, 0]}><capsuleGeometry args={[0.24, 0.7, 6, 12]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
      <mesh position={[0, 1.72, 0]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color="#c99a72" /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.48, 1.45, 0]} rotation={[0, 0, s * -1.1]}><capsuleGeometry args={[0.07, 0.6, 4, 8]} /><meshStandardMaterial color={color} /></mesh>
          <mesh position={[s * 0.78, 1.68, 0]}><sphereGeometry args={[0.11, 12, 12]} /><meshStandardMaterial color="#f2f2f2" /></mesh>
          <mesh position={[s * 0.14, 0.38, 0]}><capsuleGeometry args={[0.09, 0.55, 4, 8]} /><meshStandardMaterial color="#1b1b1b" /></mesh>
        </group>
      ))}
    </group>
  );
}

function Scene({ accent, onResult, phase, setPhase }: { accent: string; onResult: (r: Result) => void; phase: Phase; setPhase: (p: Phase) => void }) {
  const { camera } = useThree();
  const pitch = useMemo(pitchTexture, []);
  const ball = useRef<THREE.Mesh>(null);
  const aim = useRef<THREE.Mesh>(null);
  const target = useRef(new THREE.Vector3(0, 1, 0));
  const keeper = useRef({ x: 0, y: 0, tilt: 0 });
  const shot = useRef<{ t: number; from: THREE.Vector3; to: THREE.Vector3; curve: number; kx: number; ky: number; result?: Result } | null>(null);

  useEffect(() => {
    camera.position.set(0, 1.45, SPOT + 1.7);
    camera.lookAt(0, 1.0, 0);
  }, [camera]);

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (phase !== "aim") return;
    target.current.set(THREE.MathUtils.clamp(e.point.x, -5.5, 5.5), THREE.MathUtils.clamp(e.point.y, 0.1, 3.6), 0);
  };
  const onShoot = (e: ThreeEvent<MouseEvent>) => {
    if (phase !== "aim") return;
    e.stopPropagation();
    target.current.set(THREE.MathUtils.clamp(e.point.x, -5.5, 5.5), THREE.MathUtils.clamp(e.point.y, 0.1, 3.6), 0);
    const to = target.current.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.25, 0));
    // The keeper reads one shot in three, otherwise guesses.
    const read = Math.random() < 0.34;
    const side = read ? Math.sign(to.x) * (Math.abs(to.x) > 0.7 ? 1 : 0) : [-1, 0, 1][Math.floor(Math.random() * 3)];
    const kx = side * (1.9 + Math.random() * 1.1);
    const ky = read ? THREE.MathUtils.clamp(to.y - 1.1, 0, 0.9) : Math.random() * 0.7;
    shot.current = { t: 0, from: new THREE.Vector3(0, 0.11, SPOT), to, curve: (Math.random() - 0.5) * 0.8, kx, ky };
    setPhase("flight");
    blip("tick");
  };

  useFrame((_, dt) => {
    if (aim.current) {
      aim.current.position.copy(target.current).setZ(0.05);
      aim.current.visible = phase === "aim";
    }
    const s = shot.current;
    const k = keeper.current;
    if (!s) {
      k.x += (Math.sin(performance.now() / 600) * 0.4 - k.x) * Math.min(1, dt * 3);
      k.y = 0; k.tilt *= 0.9;
      return;
    }
    s.t += dt / 0.62;
    const t = Math.min(1, s.t);
    // keeper dives after a short reaction
    const kd = THREE.MathUtils.clamp((s.t - 0.18) / 0.55, 0, 1);
    const ease = 1 - Math.pow(1 - kd, 3);
    k.x = THREE.MathUtils.lerp(k.x, s.kx, ease * 0.25);
    k.y = s.ky * Math.sin(kd * Math.PI * 0.9);
    k.tilt = -Math.sign(s.kx) * ease * (Math.abs(s.kx) > 0.5 ? 1.2 : 0);
    if (ball.current) {
      const p = new THREE.Vector3().lerpVectors(s.from, s.to, t);
      p.x += Math.sin(t * Math.PI) * s.curve;
      p.y += Math.sin(t * Math.PI) * 0.35;
      ball.current.position.copy(p);
      ball.current.rotation.x -= dt * 18;
    }
    if (t >= 1 && !s.result) {
      const { x, y } = s.to;
      const hands = new THREE.Vector2(k.x - Math.sign(s.kx || 1) * Math.sin(k.tilt) * 1.1, k.y + 1.2 * Math.cos(k.tilt));
      const reach = Math.hypot(x - hands.x, y - hands.y) < 0.95 || (Math.abs(x - k.x) < 0.45 && y < 1.9 + k.y);
      let r: Result;
      if (Math.abs(Math.abs(x) - GW / 2) < 0.08 || Math.abs(y - GH) < 0.06) r = "post";
      else if (Math.abs(x) > GW / 2) r = "wide";
      else if (y > GH) r = "over";
      else r = reach ? "saved" : "goal";
      s.result = r;
      onResult(r);
      setPhase("done");
      setTimeout(() => {
        shot.current = null;
        if (ball.current) ball.current.position.set(0, 0.11, SPOT);
        setPhase("aim");
      }, 1400);
    }
  });

  return (
    <>
      <color attach="background" args={["#0e1a12"]} />
      <fog attach="fog" args={["#0e1a12", 18, 40]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 10, 8]} intensity={2.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]}><planeGeometry args={[40, 40]} /><meshStandardMaterial map={pitch} roughness={1} /></mesh>
      {/* lines: goal line, six-yard box, spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><planeGeometry args={[30, 0.08]} /><meshBasicMaterial color="#e8e8e8" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 5.5]}><planeGeometry args={[18.3, 0.08]} /><meshBasicMaterial color="#e8e8e8" /></mesh>
      {[-1, 1].map((sx) => <mesh key={sx} rotation={[-Math.PI / 2, 0, 0]} position={[sx * 9.15, 0.01, 2.75]}><planeGeometry args={[0.08, 5.5]} /><meshBasicMaterial color="#e8e8e8" /></mesh>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, SPOT]}><circleGeometry args={[0.12, 20]} /><meshBasicMaterial color="#e8e8e8" /></mesh>
      {/* frame */}
      {[-1, 1].map((sx) => <mesh key={sx} position={[sx * GW / 2, GH / 2, 0]}><cylinderGeometry args={[0.06, 0.06, GH, 12]} /><meshStandardMaterial color="#fafafa" /></mesh>)}
      <mesh position={[0, GH, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, GW + 0.12, 12]} /><meshStandardMaterial color="#fafafa" /></mesh>
      <Net />
      <Keeper color={accent} pose={keeper} />
      <mesh ref={ball} position={[0, 0.11, SPOT]}><icosahedronGeometry args={[0.11, 1]} /><meshStandardMaterial color="#f7f7f7" flatShading /></mesh>
      <mesh ref={aim}><ringGeometry args={[0.16, 0.22, 32]} /><meshBasicMaterial color={accent} /></mesh>
      {/* invisible aiming wall at the goal line */}
      <mesh position={[0, 2, 0]} onPointerMove={onMove} onClick={onShoot}><planeGeometry args={[12, 4.4]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
    </>
  );
}

const SAY: Record<Result, string> = { goal: "GOAL. Top bins.", saved: "Saved. He read it.", wide: "Wide. Into the stands.", over: "Over the bar.", post: "Off the woodwork!" };

export default function Penalty3D() {
  const accent = useMemo(() => `#${cssColor("--accent", "#b08f74").getHexString()}`, []);
  const [phase, setPhase] = useState<Phase>("aim");
  const [log, setLog] = useState<Result[]>([]);
  const [best, setBest] = useState(0);
  useEffect(() => { try { setBest(Number(localStorage.getItem("rc.pens") || 0)); } catch {} }, []);
  const goals = log.filter((r) => r === "goal").length;
  const over = log.length >= 5;
  const onResult = (r: Result) => {
    blip(r === "goal" ? "goal" : "close");
    setLog((l) => {
      const next = [...l, r];
      if (next.length === 5) {
        const g = next.filter((x) => x === "goal").length;
        track("penalty_round", { goals: g });
        try { if (g > Number(localStorage.getItem("rc.pens") || 0)) (localStorage.setItem("rc.pens", String(g)), setBest(g)); } catch {}
      }
      return next;
    });
  };
  const last = log[log.length - 1];
  return (
    <div className="pens">
      <Canvas dpr={[1, 1.5]} camera={{ fov: 33, near: 0.1, far: 80 }} gl={{ antialias: true }}>
        <Scene accent={accent} onResult={onResult} phase={over ? "done" : phase} setPhase={setPhase} />
      </Canvas>
      <div className="pens__hud">
        <span className="pens__dots" aria-label={`${goals} goals from ${log.length} kicks`}>
          {Array.from({ length: 5 }, (_, i) => <i key={i} data-r={log[i] ?? ""} />)}
        </span>
        <b aria-live="polite">{over ? `${goals} / 5. ${goals >= 4 ? "Ice cold." : goals >= 2 ? "Respectable." : "The keeper had your number."}` : phase === "done" && last ? SAY[last] : "Aim at the goal. Click to shoot."}</b>
        <span className="tabular">Best {best}/5</span>
        {over && <button type="button" className="btn" onClick={() => setLog([])}>Again</button>}
      </div>
    </div>
  );
}
