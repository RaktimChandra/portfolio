"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Small, cheap scenes that each say what one project does. Colours come in as props. */
type P = { accent: THREE.Color; ink: THREE.Color; hot: boolean };

function Spin({ children, speed = 0.25 }: { children: React.ReactNode; speed?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * speed;
  });
  return <group ref={g}>{children}</group>;
}

/** Fraud network: accounts and devices, one ring of mules glowing red. */
export function NetworkScene({ accent, ink, hot }: P) {
  const { pts, edges, bad } = useMemo(() => {
    const pts = Array.from({ length: 22 }, (_, i) => new THREE.Vector3(Math.cos(i * 2.4) * (1 + (i % 4) * 0.3), Math.sin(i * 1.7) * 0.9, Math.sin(i * 2.4) * (1 + (i % 4) * 0.3)));
    const seg: number[] = [];
    pts.forEach((a, i) => pts.forEach((b, j) => j > i && a.distanceTo(b) < 1.05 && seg.push(...a.toArray(), ...b.toArray())));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    return { pts, edges: g, bad: new Set([3, 7, 11, 15]) };
  }, []);
  const red = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((s) => {
    if (red.current) red.current.color.setHSL(0, 0.85, 0.5 + Math.sin(s.clock.elapsedTime * (hot ? 8 : 3)) * 0.12);
  });
  return (
    <Spin speed={hot ? 0.6 : 0.2}>
      <lineSegments geometry={edges}><lineBasicMaterial color={ink} transparent opacity={0.25} /></lineSegments>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[bad.has(i) ? 0.11 : 0.07, 12, 12]} />
          {bad.has(i) ? <meshBasicMaterial ref={i === 3 ? red : undefined} color="#e5534b" /> : <meshBasicMaterial color={i % 5 ? ink : accent} />}
        </mesh>
      ))}
    </Spin>
  );
}

/** Metal panel with a crack and a scanning detection box. */
export function CrackScene({ accent, hot }: P) {
  const crack = useMemo(() => {
    const pts: number[] = [];
    let x = -0.9, y = 0.3;
    for (let i = 0; i < 18; i++) {
      const nx = x + 0.1, ny = y + (Math.sin(i * 3.1) * 0.08 - 0.03);
      pts.push(x, y, 0.02, nx, ny, 0.02);
      x = nx; y = ny;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  const box = useRef<THREE.LineSegments>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime * (hot ? 1.6 : 0.7);
    if (box.current) {
      box.current.position.x = Math.sin(t) * 0.5;
      box.current.position.y = 0.05 + Math.cos(t * 0.7) * 0.15;
    }
  });
  const boxGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.8, 0.5)), []);
  return (
    <group rotation={[-0.35, 0.4, 0]}>
      <mesh>
        <planeGeometry args={[2.4, 1.6, 12, 8]} />
        <meshStandardMaterial color="#9aa1a8" metalness={0.9} roughness={0.35} />
      </mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((x) => [-0.6, 0.6].map((y) => (
        <mesh key={`${x}${y}`} position={[x, y, 0.02]}><circleGeometry args={[0.035, 12]} /><meshStandardMaterial color="#5c6268" metalness={1} roughness={0.3} /></mesh>
      )))}
      <lineSegments geometry={crack}><lineBasicMaterial color="#1a1a1a" /></lineSegments>
      <lineSegments ref={box} geometry={boxGeo} position={[0, 0, 0.04]}><lineBasicMaterial color={accent} /></lineSegments>
    </group>
  );
}

/** A paper record being scanned into structured fields. */
export function DocScene({ accent, ink, hot }: P) {
  const beam = useRef<THREE.Mesh>(null);
  const chips = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime * (hot ? 1.5 : 0.8);
    if (beam.current) beam.current.position.y = Math.sin(t) * 0.75;
    chips.current?.children.forEach((c, i) => {
      c.position.x = 1.0 + ((t * 0.4 + i * 0.25) % 1) * 0.9;
      (c as THREE.Mesh).scale.setScalar(1 - ((t * 0.4 + i * 0.25) % 1) * 0.5);
    });
  });
  return (
    <group rotation={[-0.2, 0.35, 0]} position={[-0.3, 0, 0]}>
      <mesh><planeGeometry args={[1.3, 1.75]} /><meshStandardMaterial color="#f3efe6" roughness={0.9} /></mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.1 + (i % 2) * 0.1, 0.65 - i * 0.15, 0.01]}><planeGeometry args={[0.9 - (i % 3) * 0.2, 0.04]} /><meshBasicMaterial color="#7b7368" /></mesh>
      ))}
      <mesh ref={beam} position={[0, 0, 0.03]}><planeGeometry args={[1.45, 0.05]} /><meshBasicMaterial color={accent} transparent opacity={0.85} /></mesh>
      <group ref={chips}>
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={i} position={[1.2, 0.45 - i * 0.3, 0.1]}><boxGeometry args={[0.32, 0.12, 0.04]} /><meshStandardMaterial color={i % 2 ? accent : ink} /></mesh>
        ))}
      </group>
    </group>
  );
}

/** Four agents trading arguments. */
export function DebateScene({ accent, ink, hot }: P) {
  const pos = useMemo(() => [0, 1, 2, 3].map((i) => new THREE.Vector3(Math.cos((i / 4) * Math.PI * 2) * 1.1, Math.sin(i * 1.3) * 0.25, Math.sin((i / 4) * Math.PI * 2) * 1.1)), []);
  const pk = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime * (hot ? 1.4 : 0.6);
    pk.current?.children.forEach((c, i) => {
      const a = pos[i % 4], b = pos[(i + 1 + (i % 2)) % 4];
      c.position.lerpVectors(a, b, (t + i * 0.37) % 1);
    });
  });
  const colors = ["#8fb3ff", "#ff6b5e", "#3fcf8e", "#ffcc33"];
  return (
    <Spin speed={0.15}>
      {pos.map((p, i) => (
        <mesh key={i} position={p}><icosahedronGeometry args={[0.24, 1]} /><meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={0.4} flatShading /></mesh>
      ))}
      <mesh><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} /></mesh>
      <group ref={pk}>{Array.from({ length: 8 }, (_, i) => <mesh key={i}><sphereGeometry args={[0.04, 8, 8]} /><meshBasicMaterial color={ink} /></mesh>)}</group>
    </Spin>
  );
}

/** Duplicate records in two clusters, links pulling them together. */
export function VectorScene({ accent, ink, hot }: P) {
  const { a, links } = useMemo(() => {
    const a = Array.from({ length: 70 }, (_, i) => {
      const c = i % 5;
      const cx = Math.cos(c * 1.25) * 1.1, cz = Math.sin(c * 1.25) * 1.1;
      return new THREE.Vector3(cx + Math.sin(i * 7.1) * 0.25, Math.cos(i * 3.3) * 0.5, cz + Math.cos(i * 5.7) * 0.25);
    });
    const seg: number[] = [];
    a.forEach((p, i) => i % 5 === 0 && a[i + 5] && seg.push(...p.toArray(), ...a[i + 5].toArray()));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    const pg = new THREE.BufferGeometry().setFromPoints(a);
    return { a: pg, links: g };
  }, []);
  return (
    <Spin speed={hot ? 0.7 : 0.2}>
      <points geometry={a}><pointsMaterial color={ink} size={0.045} /></points>
      <lineSegments geometry={links}><lineBasicMaterial color={accent} /></lineSegments>
    </Spin>
  );
}

/** A grid of tests turning green one by one. */
export function TestsScene({ ink, hot }: P) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    const n = Math.floor((s.clock.elapsedTime * (hot ? 30 : 10)) % 70);
    ref.current?.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.color.set(i < n ? "#3fcf8e" : i === n ? "#ffcc33" : "#3a3a3a");
      c.position.y = i === n ? 0.08 : 0;
    });
  });
  return (
    <group rotation={[0.9, 0, 0.6]}>
      <group ref={ref}>
        {Array.from({ length: 64 }, (_, i) => (
          <mesh key={i} position={[(i % 8) * 0.26 - 0.9, 0, Math.floor(i / 8) * 0.26 - 0.9]}><boxGeometry args={[0.2, 0.08, 0.2]} /><meshStandardMaterial color="#3a3a3a" /></mesh>
        ))}
      </group>
      <mesh position={[0, -0.06, 0]}><boxGeometry args={[2.2, 0.03, 2.2]} /><meshStandardMaterial color={ink} transparent opacity={0.08} /></mesh>
    </group>
  );
}

/** Blocks assembling into an app. */
export function BuildScene({ accent, ink, hot }: P) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = (s.clock.elapsedTime * (hot ? 0.6 : 0.25)) % 1;
    ref.current?.children.forEach((c, i) => {
      const k = THREE.MathUtils.clamp(t * 12 - i * 0.9, 0, 1);
      c.position.y = (Math.floor(i / 3) * 0.32 - 0.5) + (1 - k) * 2;
      (c as THREE.Mesh).scale.setScalar(0.3 + k * 0.7);
    });
  });
  return (
    <group rotation={[0.3, 0.6, 0]}>
      <group ref={ref}>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[(i % 3) * 0.42 - 0.42, 0, 0]}><boxGeometry args={[0.38, 0.28, 0.5]} /><meshStandardMaterial color={i % 4 === 0 ? accent : ink} roughness={0.4} /></mesh>
        ))}
      </group>
    </group>
  );
}

/** Blocks chained by proofs. */
export function ChainScene({ accent, ink }: P) {
  return (
    <Spin speed={0.35}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1]} rotation={[0, -a, 0]}>
            <mesh><boxGeometry args={[0.36, 0.36, 0.36]} /><meshStandardMaterial color={i === 0 ? accent : ink} metalness={0.5} roughness={0.3} /></mesh>
            <mesh position={[0, 0, 0.3]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.12, 0.03, 8, 20]} /><meshStandardMaterial color={accent} metalness={1} roughness={0.2} /></mesh>
          </group>
        );
      })}
    </Spin>
  );
}

/** A crowd as points, faces pixelated, a shield over them. */
export function ShieldScene({ accent, ink, hot }: P) {
  const crowd = useMemo(() => new THREE.BufferGeometry().setFromPoints(Array.from({ length: 140 }, (_, i) => new THREE.Vector3(Math.sin(i * 12.9) * 1.1, -0.6 + Math.abs(Math.cos(i * 4.1)) * 0.2, Math.cos(i * 7.3) * 1.1))), []);
  return (
    <Spin speed={hot ? 0.5 : 0.15}>
      <points geometry={crowd}><pointsMaterial color={ink} size={0.08} /></points>
      <mesh position={[0, -0.6, 0]}><sphereGeometry args={[1.35, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshBasicMaterial color={accent} wireframe transparent opacity={0.45} /></mesh>
    </Spin>
  );
}

/** EEG traces drifting toward a seizure. */
export function WaveScene({ accent, ink, hot }: P) {
  const lines = useMemo(() => [0, 1, 2, 3].map(() => new THREE.BufferGeometry().setFromPoints(Array.from({ length: 120 }, () => new THREE.Vector3()))), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime * (hot ? 2 : 1);
    lines.forEach((g, k) => {
      const pos = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < 120; i++) {
        const x = i / 119;
        const spike = x > 0.6 ? Math.sin(x * 90 + t * 6) * 0.18 * (x - 0.6) * 2.5 : 0;
        pos.setXYZ(i, x * 2.6 - 1.3, 0.6 - k * 0.4 + Math.sin(x * 20 + t * 2 + k) * 0.05 + spike, 0);
      }
      pos.needsUpdate = true;
    });
  });
  return (
    <group>
      {lines.map((g, k) => (
        // @ts-expect-error three line element
        <line key={k} geometry={g}><lineBasicMaterial color={k === 1 ? accent : ink} /></line>
      ))}
    </group>
  );
}

/** A core with agents orbiting under policy rings. */
export function OrbitScene({ accent, ink, hot }: P) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    ref.current?.children.forEach((c, i) => {
      const a = s.clock.elapsedTime * (hot ? 1.4 : 0.6) * (i % 2 ? 1 : -0.8) + i;
      const r = 0.7 + (i % 3) * 0.3;
      c.position.set(Math.cos(a) * r, Math.sin(a * 0.7) * 0.3, Math.sin(a) * r);
    });
  });
  return (
    <group>
      <mesh><octahedronGeometry args={[0.32, 0]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} flatShading /></mesh>
      {[0.7, 1.0, 1.3].map((r) => (
        <mesh key={r} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r, 0.008, 6, 64]} /><meshBasicMaterial color={ink} transparent opacity={0.3} /></mesh>
      ))}
      <group ref={ref}>{Array.from({ length: 6 }, (_, i) => <mesh key={i}><sphereGeometry args={[0.07, 10, 10]} /><meshBasicMaterial color={ink} /></mesh>)}</group>
    </group>
  );
}

export const SCENE_FOR: Record<string, (p: P) => React.ReactElement> = {
  bulwark: NetworkScene,
  "autonomous-compliance-ai": NetworkScene,
  aerosentinel: CrackScene,
  clindocmicro: DocScene,
  marginalia: DebateScene,
  "business-entity-resolution": VectorScene,
  "medgraph-rag": VectorScene,
  testharness: TestsScene,
  "hotel-reservation-vv": TestsScene,
  genesis: BuildScene,
  provenance: ChainScene,
  obscura: ShieldScene,
  neurosentry: WaveScene,
  agentos: OrbitScene,
};
