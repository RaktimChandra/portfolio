"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { CENTROID, places } from "@/content/geo";
import { cssColor, labelTexture } from "./util";

const R = 2;
const ll = (lat: number, lon: number, r = R) => {
  const phi = THREE.MathUtils.degToRad(90 - lat), th = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};

function Dots({ ink }: { ink: THREE.Color }) {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);
  useEffect(() => {
    fetch("/land.json").then((r) => r.json()).then((pts: [number, number][]) => {
      const a = new Float32Array(pts.length * 3);
      pts.forEach(([lat, lon], i) => a.set(ll(lat, lon, R + 0.005).toArray(), i * 3));
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(a, 3));
      setGeo(g);
    }).catch(() => {});
  }, []);
  return geo ? <points geometry={geo}><pointsMaterial color={ink} size={0.04} transparent opacity={0.8} /></points> : null;
}

function Arc({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: THREE.Color }) {
  const curve = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    mid.setLength(R + 0.25 + from.distanceTo(to) * 0.35);
    return new THREE.QuadraticBezierCurve3(from, mid, to);
  }, [from, to]);
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), [curve]);
  const dot = useRef<THREE.Mesh>(null);
  useFrame((s) => dot.current?.position.copy(curve.getPoint((s.clock.elapsedTime * 0.3) % 1)));
  return (
    <group>
      <line><primitive object={geo} attach="geometry" /><lineBasicMaterial color={color} transparent opacity={0.55} /></line>
      <mesh ref={dot}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color={color} /></mesh>
    </group>
  );
}

function Pin({ p, color, label, hot, onHover, size = 0.05 }: { p: THREE.Vector3; color: THREE.Color; label?: string; hot: boolean; onHover: (on: boolean) => void; size?: number }) {
  const lab = useMemo(() => (label ? labelTexture(label, { size: 36 }) : null), [label]);
  return (
    <group position={p} onPointerOver={(e) => (e.stopPropagation(), onHover(true))} onPointerOut={() => onHover(false)}>
      <mesh><sphereGeometry args={[hot ? size * 1.6 : size, 12, 12]} /><meshBasicMaterial color={color} /></mesh>
      {lab && <sprite position={p.clone().normalize().multiplyScalar(0.22)} scale={[0.17 * lab.aspect, 0.17, 1]}><spriteMaterial map={lab.tex} transparent depthWrite={false} /></sprite>}
    </group>
  );
}

export default function Globe() {
  const ink = useMemo(() => cssColor("--ink", "#f2f2f2"), []);
  const accent = useMemo(() => cssColor("--accent", "#b08f74"), []);
  const [countries, setCountries] = useState<{ cc: string; v: number }[]>([]);
  const [live, setLive] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/visitors").then((r) => r.json()).then((j) => (setCountries(j.countries ?? []), setLive(!!j.live))).catch(() => {});
  }, []);
  const home = ll(places[0].lat, places[0].lon, R + 0.01);
  const visitors = countries.filter((c) => CENTROID[c.cc]);
  const total = visitors.reduce((n, c) => n + c.v, 0);
  const hp = places.find((p) => p.name === hot);
  const hc = visitors.find((c) => c.cc === hot);
  return (
    <div className="globe">
      <Canvas dpr={[1, 1.6]} camera={{ position: ll(18, 80, 6.2).toArray(), fov: 40 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.8} />
        <mesh><sphereGeometry args={[R * 0.985, 48, 48]} /><meshBasicMaterial color={ink} transparent opacity={0.07} /></mesh>
        <Dots ink={ink} />
        {places.map((p) => <Pin key={p.name} p={ll(p.lat, p.lon, R + 0.01)} color={accent} label={p.name} hot={hot === p.name} onHover={(on) => setHot(on ? p.name : null)} size={0.06} />)}
        {visitors.map((c) => {
          const [lat, lon] = CENTROID[c.cc];
          const to = ll(lat, lon, R + 0.01);
          return (
            <group key={c.cc}>
              {c.cc !== "IN" && <Arc from={home} to={to} color={accent} />}
              <Pin p={to} color={ink} hot={hot === c.cc} onHover={(on) => setHot(on ? c.cc : null)} size={0.03 + Math.min(0.05, Math.log10(1 + c.v) * 0.02)} />
            </group>
          );
        })}
        <OrbitControls enablePan={false} enableZoom={false} enableDamping autoRotate={!hot} autoRotateSpeed={0.5} />
      </Canvas>
      <p className="globe__note" aria-live="polite">
        {hp ? <><b>{hp.name}</b> · {hp.note}</> : hc ? <><b>{CENTROID[hc.cc][2]}</b> · {hc.v} {hc.v === 1 ? "visitor" : "visitors"} in 90 days</> : live && total ? `Pins: where I've studied and worked. Dots: ${total} visitors from ${visitors.length} ${visitors.length === 1 ? "country" : "countries"} in the last 90 days.` : "Pins: where I've studied and worked. Drag to spin."}
      </p>
    </div>
  );
}
