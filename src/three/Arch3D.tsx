"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Arch, ArchNode } from "@/content/architecture";
import { cssColor, labelTexture } from "./util";

const KIND_SHAPE: Record<NonNullable<ArchNode["kind"]>, "box" | "cyl" | "oct" | "sphere" | "slab"> = {
  io: "slab", agent: "sphere", store: "cyl", model: "box", ui: "slab", guard: "oct",
};

function layout(arch: Arch, vertical = false) {
  const layers = new Map<number, ArchNode[]>();
  arch.nodes.forEach((n) => layers.set(n.layer, [...(layers.get(n.layer) ?? []), n]));
  const maxL = Math.max(...arch.nodes.map((n) => n.layer));
  const span = Math.max(4, maxL * 1.9);
  const pos = new Map<string, THREE.Vector3>();
  for (const [l, ns] of layers) {
    ns.forEach((n, i) => {
      const y = (i - (ns.length - 1) / 2) * 1.25;
      const z = Math.sin(i * 1.7 + l) * 0.6;
      const along = (l / (maxL || 1) - 0.5) * span;
      pos.set(n.id, vertical ? new THREE.Vector3(y * 1.15, -along * 0.85, z) : new THREE.Vector3(along, -y, z));
    });
  }
  return { pos, span };
}

function Node({ n, p, accent, hot, onHover }: { n: ArchNode; p: THREE.Vector3; accent: THREE.Color; hot: boolean; onHover: (id: string | null) => void }) {
  const xl = useX();
  const ref = useRef<THREE.Group>(null);
  const { tex, aspect } = useMemo(() => labelTexture(n.label, { size: 40 }), [n.label]);
  const shape = KIND_SHAPE[n.kind ?? "model"];
  useFrame((s) => {
    if (!ref.current) return;
    const k = hot ? 1.18 : 1;
    ref.current.scale.lerp(new THREE.Vector3(k, k, k), 0.15);
    ref.current.children[0].rotation.y = s.clock.elapsedTime * 0.4;
  });
  const mat = <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={hot ? 0.7 : 0.22} roughness={0.35} metalness={0.2} />;
  return (
    <group ref={ref} position={p} onPointerOver={(e) => (e.stopPropagation(), onHover(n.id))} onPointerOut={() => onHover(null)}>
      <mesh>
        {shape === "box" && <boxGeometry args={[0.42, 0.42, 0.42]} />}
        {shape === "cyl" && <cylinderGeometry args={[0.24, 0.24, 0.42, 24]} />}
        {shape === "oct" && <octahedronGeometry args={[0.3]} />}
        {shape === "sphere" && <icosahedronGeometry args={[0.27, 1]} />}
        {shape === "slab" && <boxGeometry args={[0.5, 0.32, 0.1]} />}
        {xl(mat)}
      </mesh>
      <sprite position={[0, -0.48, 0]} scale={[0.3 * aspect, 0.3, 1]}>
        <spriteMaterial map={tex} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

function Edge({ a, b, accent, speed }: { a: THREE.Vector3; b: THREE.Vector3; accent: THREE.Color; speed: number }) {
  const curve = useMemo(() => {
    const mid = a.clone().lerp(b, 0.5);
    mid.z += 0.5;
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }, [a, b]);
  const line = useMemo(() => new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)), [curve]);
  const dots = useRef<THREE.Mesh[]>([]);
  useFrame((s) => {
    dots.current.forEach((d, i) => d && d.position.copy(curve.getPoint((s.clock.elapsedTime * speed + i / 3) % 1)));
  });
  return (
    <group>
      <line>
        <primitive object={line} attach="geometry" />
        <lineBasicMaterial color={accent} transparent opacity={0.35} />
      </line>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { if (m) dots.current[i] = m; }}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

/** Put the camera where the whole graph, labels included, fits the frame. */
function Fit({ pos }: { pos: Map<string, THREE.Vector3> }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const box = new THREE.Box3();
    pos.forEach((p) => box.expandByPoint(p));
    box.expandByVector(new THREE.Vector3(1.0, 1.0, 0.4));
    const w = box.max.x - box.min.x, h = box.max.y - box.min.y;
    const cam = camera as THREE.PerspectiveCamera;
    const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const d = Math.max(h / 2 / t, w / 2 / (t * (size.width / size.height)));
    const c = box.getCenter(new THREE.Vector3());
    cam.position.set(c.x, c.y + d * 0.08, d + box.max.z);
    cam.lookAt(c);
    cam.updateProjectionMatrix();
  }, [pos, camera, size]);
  return null;
}

export default function Arch3D({ arch }: { arch: Arch }) {
  const xl = useX();
  const accent = useMemo(() => cssColor("--accent", "#b08f74"), []);
  const [hot, setHot] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState(false);
  useEffect(() => {
    const el = wrap.current;
    if (el) setVertical(el.clientWidth / el.clientHeight < 1.1);
  }, []);
  const { pos } = useMemo(() => layout(arch, vertical), [arch, vertical]);
  const center = useMemo(() => {
    const b = new THREE.Box3();
    pos.forEach((p) => b.expandByPoint(p));
    return b.getCenter(new THREE.Vector3()).toArray();
  }, [pos]);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  const node = arch.nodes.find((n) => n.id === hot);
  return (
    <div ref={wrap} className="arch3d">
      <Canvas frameloop={live ? "always" : "never"} dpr={[1, 1.6]} camera={{ position: [0, 0.6, 8], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <Fit pos={pos} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 6]} intensity={1.6} />
        {arch.edges.map(([f, t], i) => <Edge key={i} a={pos.get(f)!} b={pos.get(t)!} accent={accent} speed={0.22 + (i % 3) * 0.05} />)}
        {arch.nodes.map((n) => <Node key={n.id} n={n} p={pos.get(n.id)!} accent={accent} hot={hot === n.id} onHover={setHot} />)}
        <OrbitControls enablePan={false} enableZoom={false} enableDamping target={center} minPolarAngle={Math.PI * 0.32} maxPolarAngle={Math.PI * 0.68} minAzimuthAngle={-0.7} maxAzimuthAngle={0.7} />
      </Canvas>
      <p className="arch3d__note" aria-live="polite">{node ? <><b>{xl(node.label)}</b>{node.note ? ` · ${node.note}` : ""}</> : xl("Drag to turn it. Hover a part for what it does.")}</p>
    </div>
  );
}
