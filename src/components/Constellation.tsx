"use client";

import { useX } from "@/i18n/x/client";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "@/i18n/navigation";
import { DOMAIN_LABEL, type Project } from "@/content/projects";

function cssColor(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c || fallback;
}

function positions(n: number, r: number) {
  const out: THREE.Vector3[] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = g * i;
    out.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r));
  }
  return out;
}

function Scene({ items, onHover, onPick }: { items: Project[]; onHover: (p: Project | null) => void; onPick: (p: Project) => void }) {
  const group = useRef<THREE.Group>(null);
  const [hot, setHot] = useState<number | null>(null);
  const pts = useMemo(() => positions(items.length, 3.2), [items.length]);
  const ink = useMemo(() => new THREE.Color(cssColor("--ink", "#f2f2f2")), []);
  const accent = useMemo(() => new THREE.Color(cssColor("--accent", "#b08f74")), []);

  const lines = useMemo(() => {
    const seg: number[] = [];
    items.forEach((a, i) => {
      items.forEach((b, j) => {
        if (j <= i) return;
        const shared = a.domains.filter((d) => b.domains.includes(d)).length;
        if (shared >= 2 && pts[i].distanceTo(pts[j]) < 3.4) seg.push(...pts[i].toArray(), ...pts[j].toArray());
      });
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    return g;
  }, [items, pts]);

  useFrame((_, dt) => {
    if (group.current && hot === null) group.current.rotation.y += dt * 0.08;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={ink} transparent opacity={0.16} />
      </lineSegments>
      {items.map((p, i) => {
        const size = p.featured ? 0.16 : 0.09;
        return (
          <mesh
            key={p.slug}
            position={pts[i]}
            scale={hot === i ? 1.8 : 1}
            onPointerOver={(e) => (e.stopPropagation(), setHot(i), onHover(p), (document.body.style.cursor = "pointer"))}
            onPointerOut={() => (setHot(null), onHover(null), (document.body.style.cursor = ""))}
            onClick={(e) => (e.stopPropagation(), onPick(p))}
          >
            <icosahedronGeometry args={[size, 1]} />
            <meshStandardMaterial color={p.featured ? accent : ink} emissive={p.featured ? accent : ink} emissiveIntensity={hot === i ? 1.4 : 0.35} roughness={0.3} metalness={0.4} />
          </mesh>
        );
      })}
      <mesh>
        <sphereGeometry args={[1.25, 48, 48]} />
        <meshPhysicalMaterial color={accent} transmission={0.9} roughness={0.15} thickness={1.2} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function Constellation({ items }: { items: Project[] }) {
  const xl = useX();
  const router = useRouter();
  const [hover, setHover] = useState<Project | null>(null);
  return (
    <div className="constellation panel" data-title={xl("Constellation")}>
      <Canvas camera={{ position: [0, 0, 8.5], fov: 45 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[6, 6, 6]} intensity={60} />
        <pointLight position={[-6, -4, -2]} intensity={25} color="#8fb3ff" />
        <Scene items={items} onHover={setHover} onPick={(p) => router.push(`/work/${p.slug}`)} />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} enableDamping />
      </Canvas>
      <div className="constellation__label">
        {hover ? (
          <>
            <p className="display">{xl(hover.title)}</p>
            <p className="text-small">{xl(hover.tagline)} <span className="muted">· {hover.domains.map((d) => DOMAIN_LABEL[d]).join(", ")}</span></p>
          </>
        ) : (
          <p className="text-small muted">{xl("Drag to turn. Bronze nodes are featured work; lines join projects that share two or more areas. Click a node to open it.")}</p>
        )}
      </div>
    </div>
  );
}
