"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { labelTexture } from "./util";
import { skills } from "@/content/record";
import { projects } from "@/content/projects";
import { Link } from "@/i18n/navigation";

const GROUP_COLORS = ["#b08f74", "#3fcf8e", "#8fb3ff", "#ffcc33", "#c38bff", "#ff6b5e", "#4fd1c5", "#f78fb3", "#e8e8e8"];

type Node = { name: string; group: string; color: string; pos: THREE.Vector3; used: number };

function useNodes() {
  return useMemo(() => {
    const groups = Object.entries(skills);
    const nodes: Node[] = [];
    groups.forEach(([g, list], gi) => {
      // each group is a cluster on a sphere
      const phi = Math.acos(1 - (2 * (gi + 0.5)) / groups.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * gi;
      const centre = new THREE.Vector3(Math.cos(theta) * Math.sin(phi), Math.cos(phi), Math.sin(theta) * Math.sin(phi)).multiplyScalar(4.2);
      list.forEach((s, i) => {
        const a = (i / list.length) * Math.PI * 2;
        const r = 0.9 + (i % 3) * 0.35;
        const off = new THREE.Vector3(Math.cos(a) * r, Math.sin(a * 1.3) * 0.7, Math.sin(a) * r);
        const key = s.toLowerCase().split(" ")[0];
        const used = projects.filter((p) => p.stack.some((x) => x.toLowerCase().includes(key))).length;
        nodes.push({ name: s, group: g, color: GROUP_COLORS[gi % GROUP_COLORS.length], pos: centre.clone().add(off), used });
      });
    });
    return nodes;
  }, []);
}

function Galaxy({ nodes, onPick, picked }: { nodes: Node[]; onPick: (n: Node | null) => void; picked: Node | null }) {
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(() => nodes.map((n) => labelTexture(n.name, { color: n.color, bg: "rgba(12,12,12,0.7)", size: 40, border: n.color + "66" })), [nodes]);
  const lines = useMemo(() => {
    const seg: number[] = [];
    const byGroup = new Map<string, Node[]>();
    nodes.forEach((n) => byGroup.set(n.group, [...(byGroup.get(n.group) ?? []), n]));
    byGroup.forEach((ns) => ns.forEach((a, i) => { const b = ns[(i + 1) % ns.length]; seg.push(...a.pos.toArray(), ...b.pos.toArray()); }));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    return g;
  }, [nodes]);
  useFrame((_, dt) => {
    if (ref.current && !picked) ref.current.rotation.y += dt * 0.05;
  });
  return (
    <group ref={ref}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </lineSegments>
      {nodes.map((n, i) => {
        const s = 0.26 + Math.min(n.used, 12) * 0.018;
        const dim = picked && picked.group !== n.group ? 0.25 : 1;
        return (
          <sprite
            key={n.name + i}
            position={n.pos}
            scale={[s * tex[i].aspect, s, 1]}
            onClick={(e) => (e.stopPropagation(), onPick(n))}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "")}
          >
            <spriteMaterial map={tex[i].tex} transparent opacity={dim} depthWrite={false} />
          </sprite>
        );
      })}
      <mesh>
        <icosahedronGeometry args={[1.1, 2]} />
        <meshStandardMaterial color="#b08f74" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function SkillGalaxy() {
  const xl = useX();
  const nodes = useNodes();
  const [picked, setPicked] = useState<Node | null>(null);
  const [live, setLive] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  const used = picked ? projects.filter((p) => p.stack.some((x) => x.toLowerCase().includes(picked.name.toLowerCase().split(" ")[0]))).slice(0, 6) : [];
  return (
    <div ref={wrap} className="constellation panel galaxy" data-title={xl("Skill galaxy")}>
      <Canvas frameloop={live ? "always" : "never"} camera={{ position: [0, 0, 8.6], fov: 50 }} dpr={[1, 1.6]} onPointerMissed={() => setPicked(null)}>
        <ambientLight intensity={0.8} />
        <Galaxy nodes={nodes} onPick={setPicked} picked={picked} />
        <OrbitControls enablePan={false} enableZoom minDistance={5} maxDistance={16} enableDamping />
      </Canvas>
      <div className="constellation__label" style={{ pointerEvents: picked ? "auto" : "none" }}>
        {picked ? (
          <>
            <p className="display">{xl(picked.name)}</p>
            <p className="text-small">
              <span style={{ color: picked.color }}>{xl(picked.group)}</span>
              {used.length ? <> · {xl("used in")}{" "}{used.map((p, i) => <span key={p.slug}><Link className="link-u" href={`/work/${p.slug}`}>{xl(p.title)}</Link>{i < used.length - 1 ? ", " : ""}</span>)}</> : xl(" · used at work and in coursework")}
            </p>
          </>
        ) : (
          <p className="text-small muted">{xl("Drag to turn, scroll to zoom. Each colour is a group; bigger labels appear in more projects. Click a skill to see where it was used.")}</p>
        )}
      </div>
    </div>
  );
}
