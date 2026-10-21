"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCaps } from "@/lib/device";
import { cssColor, labelTexture } from "./util";
import { Link } from "@/i18n/navigation";

const STAGES = ["Perceive", "Retrieve", "Reason", "Act", "Sign-off"];

const SCENARIOS = [
  {
    id: "clinic",
    name: "A paper prescription",
    project: { title: "ClinDocMicro", href: "/work/clindocmicro" },
    steps: [
      "PaddleOCR reads the photographed page, handwriting included.",
      "GLiNER pulls out drugs, doses, frequency and diagnoses.",
      "Phi-3-mini reconciles the fields and flags anything uncertain.",
      "Writes a FHIR R4B bundle a hospital system can import.",
      "A clinician reviews the flagged fields before it is saved.",
    ],
  },
  {
    id: "fraud",
    name: "A card transaction",
    project: { title: "Bulwark", href: "/work/bulwark" },
    steps: [
      "Ingestion agent checks the amount, currency and session.",
      "Graph agent walks shared devices and peer accounts.",
      "Risk model, behaviour and rules agents each vote with reasons.",
      "Consensus layer weighs the votes into one verdict, under 100 ms.",
      "Every decision is logged so an analyst can replay it.",
    ],
  },
  {
    id: "aircraft",
    name: "A crack on a wing panel",
    project: { title: "AeroSentinel", href: "/work/aerosentinel" },
    steps: [
      "YOLOv8 spots the defect on-device, with no network.",
      "Local RAG finds the matching maintenance-manual section.",
      "Severity is checked against allowable damage limits.",
      "A non-routine work card is drafted automatically.",
      "A licensed engineer signs it; every step is hash-chained.",
    ],
  },
];

function Scene({ stage, accent, ink }: { stage: React.MutableRefObject<number>; accent: THREE.Color; ink: THREE.Color }) {
  const pts = useMemo(() => STAGES.map((_, i) => new THREE.Vector3((i - 2) * 1.75, Math.sin(i * 1.1) * 0.5, Math.cos(i * 0.9) * 0.5)), []);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts), [pts]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.03, 8, false), [curve]);
  const labels = useMemo(() => STAGES.map((s) => labelTexture(s, { color: `#${ink.getHexString()}`, size: 40 })), [ink]);
  const nodes = useRef<THREE.Mesh[]>([]);
  const packets = useRef<THREE.Mesh[]>([]);
  const grp = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (grp.current) grp.current.rotation.y = Math.sin(t * 0.2) * 0.12;
    // packets flow along the pipe toward the current stage
    const target = stage.current / (STAGES.length - 1);
    packets.current.forEach((p, i) => {
      if (!p) return;
      const u = ((t * 0.18 + i / packets.current.length) % 1) * Math.max(0.02, target);
      p.position.copy(curve.getPointAt(Math.min(1, u)));
    });
    nodes.current.forEach((n, i) => {
      if (!n) return;
      const on = i <= stage.current;
      const m = n.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity += ((on ? 1.6 : 0.15) - m.emissiveIntensity) * Math.min(1, dt * 4);
      const s = i === stage.current ? 1.18 + Math.sin(t * 4) * 0.05 : 0.9;
      n.scale.setScalar(n.scale.x + (s - n.scale.x) * Math.min(1, dt * 6));
    });
  });

  return (
    <group ref={grp}>
      <mesh geometry={tube}>
        <meshBasicMaterial color={accent} transparent opacity={0.5} />
      </mesh>
      {pts.map((p, i) => (
        <group key={i} position={p}>
          <mesh ref={(m) => { if (m) nodes.current[i] = m; }}>
            <icosahedronGeometry args={[0.36, 1]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.15} metalness={0.4} roughness={0.3} flatShading />
          </mesh>
          <sprite position={[0, -0.75, 0]} scale={[0.4 * labels[i].aspect, 0.4, 1]}>
            <spriteMaterial map={labels[i].tex} transparent depthWrite={false} />
          </sprite>
        </group>
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} ref={(m) => { if (m) packets.current[i] = m; }}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color={ink} />
        </mesh>
      ))}
    </group>
  );
}

export default function AgentPipeline() {
  const xl = useX();
  const [sc, setSc] = useState(0);
  const [st, setSt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stage = useRef(0);
  const [live, setLive] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const { rich } = useCaps();
  const colors = useMemo(() => (typeof window === "undefined" || !rich ? null : { accent: cssColor("--accent", "#b08f74"), ink: cssColor("--ink", "#f2f2f2") }), [rich]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.15 });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    stage.current = st;
  }, [st]);
  useEffect(() => {
    if (!playing || !live) return;
    const id = setTimeout(() => {
      if (st < STAGES.length - 1) setSt(st + 1);
      else {
        setSt(0);
        setSc((x) => (x + 1) % SCENARIOS.length);
      }
    }, st === STAGES.length - 1 ? 3200 : 2200);
    return () => clearTimeout(id);
  }, [st, playing, live]);

  const s = SCENARIOS[sc];
  return (
    <div ref={wrap} className="pipe">
      <div className="pipe__stage panel" data-title={xl("Agent pipeline")}>
        {colors && (
          <Canvas frameloop={live ? "always" : "never"} camera={{ position: [0, 0.4, 8.2], fov: 45 }} dpr={[1, 1.6]}>
            <ambientLight intensity={0.6} />
            <pointLight position={[0, 4, 6]} intensity={40} />
            <Scene stage={stage} accent={colors.accent} ink={colors.ink} />
          </Canvas>
        )}
      </div>
      <div className="pipe__side">
        <div className="pipe__tabs" role="tablist" aria-label={xl("Choose an input")}>
          {SCENARIOS.map((x, i) => (
            <button key={x.id} role="tab" aria-selected={i === sc} className="chip" onClick={() => (setSc(i), setSt(0))}>{xl(x.name)}</button>
          ))}
        </div>
        <ol className="pipe__steps">
          {s.steps.map((line, i) => (
            <li key={i} className={i === st ? "is-now" : i < st ? "is-done" : ""}>
              <button type="button" onClick={() => (setSt(i), setPlaying(false))}>
                <b>{xl(STAGES[i])}</b>
                <span>{xl(line)}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="pipe__foot">
          <button type="button" className="btn btn-quiet" onClick={() => setPlaying((p) => !p)}>{playing ? xl("Pause") : xl("Play")}</button>
          <Link href={s.project.href} className="link-u">{xl("See")}{" "}{xl(s.project.title)} →</Link>
        </p>
      </div>
    </div>
  );
}
