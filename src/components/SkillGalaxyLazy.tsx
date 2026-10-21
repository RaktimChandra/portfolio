"use client";
import dynamic from "next/dynamic";
import { useCaps } from "@/lib/device";
const SkillGalaxy = dynamic(() => import("@/three/SkillGalaxy"), { ssr: false, loading: () => <div className="constellation panel galaxy" /> });
export default function SkillGalaxyLazy() {
  const { gl, lite } = useCaps();
  return gl && !lite ? <SkillGalaxy /> : null;
}
