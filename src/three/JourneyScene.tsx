"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { journey, KIND_COLOR } from "@/content/journey";
import { fontFamily } from "./util";

function cardTexture(i: number) {
  const m = journey[i];
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 600;
  const x = c.getContext("2d")!;
  x.fillStyle = "rgba(14,14,14,0.86)";
  x.beginPath();
  x.roundRect(4, 4, 1016, 592, 36);
  x.fill();
  x.strokeStyle = KIND_COLOR[m.kind];
  x.lineWidth = 6;
  x.stroke();
  x.fillStyle = KIND_COLOR[m.kind];
  x.font = `700 44px ${fontFamily()}`;
  x.fillText(`${String(i + 1).padStart(2, "0")} · ${m.when}`, 60, 100);
  x.fillStyle = "#f4f4f4";
  x.font = `800 84px ${fontFamily()}`;
  // wrap title
  const words = m.title.split(" ");
  let line = "";
  let y = 210;
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (x.measureText(t).width > 900) {
      x.fillText(line, 60, y);
      y += 92;
      line = w;
    } else line = t;
  }
  x.fillText(line, 60, y);
  x.fillStyle = "#b9b9b9";
  x.font = `500 40px ${fontFamily()}`;
  let l2 = "";
  y += 80;
  for (const w of m.line.split(" ")) {
    const t = l2 ? `${l2} ${w}` : w;
    if (x.measureText(t).width > 900) {
      x.fillText(l2, 60, y);
      y += 52;
      l2 = w;
    } else l2 = t;
  }
  x.fillText(l2, 60, y);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeCurve() {
  const pts: THREE.Vector3[] = [];
  const n = journey.length;
  for (let i = 0; i <= n + 1; i++) {
    pts.push(new THREE.Vector3(Math.sin(i * 0.9) * 3.2, Math.cos(i * 0.6) * 1.4, -i * 7));
  }
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
}

function World({ progress }: { progress: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const curve = useMemo(() => makeCurve(), []);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 600, 0.05, 8, false), [curve]);
  const smooth = useRef(0);
  const cards = useMemo(
    () =>
      journey.map((m, i) => {
        const t = (i + 1) / (journey.length + 1);
        const p = curve.getPointAt(t);
        const side = i % 2 ? 1 : -1;
        const tangent = curve.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(side * 2.6);
        return { tex: cardTexture(i), pos: p.clone().add(normal).add(new THREE.Vector3(0, 0.4, 0)), color: KIND_COLOR[m.kind], dot: p };
      }),
    [curve],
  );
  const stars = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(2400 * 3);
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 2400; i++) {
      arr[i * 3] = (rand() - 0.5) * 60;
      arr[i * 3 + 1] = (rand() - 0.5) * 40;
      arr[i * 3 + 2] = -rand() * (journey.length + 3) * 7 + 10;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  const cardRefs = useRef<THREE.Mesh[]>([]);

  useFrame((_, dt) => {
    smooth.current += (progress.current - smooth.current) * Math.min(1, dt * 4);
    const t = THREE.MathUtils.clamp(smooth.current, 0, 0.999) * ((journey.length + 0.6) / (journey.length + 1));
    const p = curve.getPointAt(t);
    const look = curve.getPointAt(Math.min(1, t + 0.02));
    camera.position.set(p.x, p.y + 0.6, p.z + 2.2);
    camera.lookAt(look.x, look.y + 0.3, look.z);
    cardRefs.current.forEach((m, i) => {
      if (!m) return;
      m.lookAt(camera.position);
      const d = m.position.distanceTo(camera.position);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.clamp(1.4 - Math.abs(d - 6) / 6, 0.08, 1);
      void i;
    });
  });

  return (
    <>
      <fog attach="fog" args={["#0b0b0d", 6, 28]} />
      <points geometry={stars}>
        <pointsMaterial size={0.06} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
      </points>
      <mesh geometry={tube}>
        <meshBasicMaterial color="#b08f74" />
      </mesh>
      {cards.map((c, i) => (
        <group key={i}>
          <mesh position={c.dot}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshBasicMaterial color={c.color} />
          </mesh>
          <mesh ref={(m) => { if (m) cardRefs.current[i] = m; }} position={c.pos}>
            <planeGeometry args={[2.7, 1.58]} />
            <meshBasicMaterial map={c.tex} transparent depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export default function JourneyScene({ progress }: { progress: React.MutableRefObject<number> }) {
  const ok = useRef(true);
  useEffect(() => () => void (ok.current = false), []);
  return (
    <Canvas dpr={[1, 1.5]} camera={{ fov: 60, near: 0.1, far: 80 }} gl={{ antialias: true, alpha: false }} onCreated={({ gl }) => gl.setClearColor("#0b0b0d")}>
      <World progress={progress} />
    </Canvas>
  );
}
