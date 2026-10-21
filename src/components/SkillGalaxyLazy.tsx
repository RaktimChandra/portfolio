"use client";
import dynamic from "next/dynamic";
const SkillGalaxy = dynamic(() => import("@/three/SkillGalaxy"), { ssr: false, loading: () => <div className="constellation panel galaxy" /> });
export default function SkillGalaxyLazy() {
  return <SkillGalaxy />;
}
