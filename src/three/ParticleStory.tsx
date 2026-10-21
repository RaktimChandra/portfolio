"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cssColor, fontFamily } from "./util";

/* Point clouds for each stage, all the same length so they can morph. */
function fromText(text: string, n: number, width: number) {
  const c = document.createElement("canvas");
  c.width = 1000; c.height = 300;
  const x = c.getContext("2d")!;
  x.fillStyle = "#000";
  x.textAlign = "center";
  x.textBaseline = "middle";
  let size = 260;
  x.font = `800 ${size}px ${fontFamily()}`;
  while (x.measureText(text).width > 940 && size > 40) x.font = `800 ${--size}px ${fontFamily()}`;
  x.fillText(text, 500, 155);
  const d = x.getImageData(0, 0, 1000, 300).data;
  const px: [number, number][] = [];
  for (let y = 0; y < 300; y += 2) for (let xx = 0; xx < 1000; xx += 2) if (d[(y * 1000 + xx) * 4 + 3] > 128) px.push([xx, y]);
  const out = new Float32Array(n * 3);
  const s = width / 1000;
  for (let i = 0; i < n; i++) {
    const [a, b] = px[Math.floor(Math.random() * px.length)] ?? [500, 150];
    out.set([(a - 500) * s + (Math.random() - 0.5) * s * 2, -(b - 150) * s + (Math.random() - 0.5) * s * 2, (Math.random() - 0.5) * 0.25], i * 3);
  }
  return out;
}

function network(n: number) {
  const layers = [5, 8, 8, 3];
  const nodes: THREE.Vector3[][] = layers.map((k, li) => Array.from({ length: k }, (_, j) => new THREE.Vector3((li - 1.5) * 2.4, (j - (k - 1) / 2) * 0.62, Math.sin(j + li) * 0.3)));
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let p: THREE.Vector3;
    if (Math.random() < 0.55) {
      const L = nodes[Math.floor(Math.random() * nodes.length)];
      const c = L[Math.floor(Math.random() * L.length)];
      p = c.clone().add(new THREE.Vector3().randomDirection().multiplyScalar(Math.cbrt(Math.random()) * 0.14));
    } else {
      const li = Math.floor(Math.random() * (layers.length - 1));
      const a = nodes[li][Math.floor(Math.random() * layers[li])];
      const b = nodes[li + 1][Math.floor(Math.random() * layers[li + 1])];
      p = a.clone().lerp(b, Math.random());
    }
    out.set([p.x, p.y, p.z], i * 3);
  }
  return out;
}

function globe(n: number) {
  const out = new Float32Array(n * 3);
  const R = 2.3;
  for (let i = 0; i < n; i++) {
    let v: THREE.Vector3;
    if (i % 3 === 0) {
      const lat = (Math.floor(Math.random() * 7) - 3) * 0.38;
      const lon = Math.random() * Math.PI * 2;
      v = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));
    } else {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      v = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    }
    v.multiplyScalar(R);
    out.set([v.x, v.y, v.z], i * 3);
  }
  return out;
}

const VERT = `
attribute vec3 a1; attribute vec3 a2; attribute vec3 a3; attribute float rnd;
uniform float p; uniform float t; uniform float size; uniform float spin;
varying float vR;
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
void main(){
  float seg = clamp(floor(p), 0., 2.);
  float local = clamp((p - seg) * 1.5 - rnd * 0.5, 0., 1.);
  float e = local * local * (3. - 2. * local);
  vec3 A = seg < .5 ? position : seg < 1.5 ? a1 : a2;
  vec3 B = seg < .5 ? a1 : seg < 1.5 ? a2 : a3;
  if (seg > 1.5) A = rotY(spin) * A;
  if (seg > 0.5 && seg < 1.5) B = rotY(spin * e) * B;
  vec3 pos = mix(A, B, e);
  vec3 dir = normalize(vec3(sin(rnd * 91.), cos(rnd * 47.), sin(rnd * 13.)));
  pos += dir * sin(e * 3.14159) * (0.9 + rnd);
  pos += 0.025 * vec3(sin(t + rnd * 40.), cos(t * 1.3 + rnd * 20.), 0.);
  vR = rnd;
  vec4 mv = modelViewMatrix * vec4(pos, 1.);
  gl_PointSize = size * (0.6 + rnd * 0.8) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform vec3 c1; uniform vec3 c2; varying float vR;
void main(){
  vec2 d = gl_PointCoord - .5; float r = length(d);
  if (r > .5) discard;
  gl_FragColor = vec4(mix(c1, c2, step(.82, vR)), smoothstep(.5, .2, r));
}`;

function Cloud({ progress }: { progress: React.RefObject<number> }) {
  const { size, camera } = useThree();
  const n = size.width < 700 ? 5000 : 9000;
  const w = size.width < 700 ? 5.6 : 9;
  const aspect = size.width / size.height;
  const z = aspect < 1 ? 7.5 / Math.max(0.42, aspect * 1.15) : 7.5;
  useMemo(() => {
    camera.position.set(0, aspect < 1 ? -1.6 : -0.3, z);
    camera.lookAt(0, aspect < 1 ? -1.6 : -0.3, 0);
  }, [camera, aspect, z]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(fromText("RAKTIM", n, w), 3));
    g.setAttribute("a1", new THREE.BufferAttribute(network(n), 3));
    g.setAttribute("a2", new THREE.BufferAttribute(globe(n), 3));
    g.setAttribute("a3", new THREE.BufferAttribute(fromText("2027", n, w * 0.8), 3));
    g.setAttribute("rnd", new THREE.BufferAttribute(Float32Array.from({ length: n }, Math.random), 1));
    return g;
  }, [n, w]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          p: { value: 0 }, t: { value: 0 }, spin: { value: 0 },
          size: { value: (size.width < 700 ? 34 : 44) * (z / 7.5) * Math.min(devicePixelRatio, 1.6) },
          c1: { value: cssColor("--ink", "#f2f2f2") },
          c2: { value: cssColor("--accent", "#b08f74") },
        },
      }),
    [size.width, z],
  );
  const shown = useRef(0);
  const pts = useRef<THREE.Points>(null);
  useFrame((s, dt) => {
    const m = pts.current?.material as THREE.ShaderMaterial | undefined;
    if (!m) return;
    shown.current += ((progress.current ?? 0) - shown.current) * Math.min(1, dt * 6);
    m.uniforms.p.value = shown.current;
    m.uniforms.t.value = s.clock.elapsedTime;
    m.uniforms.spin.value = s.clock.elapsedTime * 0.25;
  });
  return <points ref={pts} geometry={geo} material={mat} />;
}

export default function ParticleStory({ progress, live }: { progress: React.RefObject<number>; live: boolean }) {
  return (
    <Canvas frameloop={live ? "always" : "never"} dpr={[1, 1.6]} camera={{ position: [0, 0, 7.5], fov: 50 }} gl={{ alpha: true, antialias: false }}>
      <Cloud progress={progress} />
    </Canvas>
  );
}
