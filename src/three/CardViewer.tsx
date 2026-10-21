"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Card() {
  const { scene } = useGLTF("/card.glb");
  return <primitive object={scene} scale={38} rotation={[Math.PI / 2 - 0.35, 0, 0]} />;
}

export default function CardViewer() {
  return (
    <Canvas dpr={[1, 1.8]} camera={{ position: [0, 0, 4.2], fov: 40 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.8} />
      <Suspense fallback={null}><Card /></Suspense>
      <OrbitControls enablePan={false} enableZoom={false} enableDamping autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}
