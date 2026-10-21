"use client";
import dynamic from "next/dynamic";
import { useCaps } from "@/lib/device";

const ProjectTiles = dynamic(() => import("@/three/ProjectTiles"), { ssr: false });

export default function ProjectTilesLazy() {
  const { rich } = useCaps();
  if (!rich) return null;
  return (
    <section className="section" style={{ paddingTop: 0 }} aria-labelledby="tiles-h">
      <h2 id="tiles-h" className="sec-title display" style={{ fontSize: "clamp(2rem, 1.2rem + 3vw, 3.6rem)", marginBottom: "1.25rem" }}>Featured, in 3D</h2>
      <ProjectTiles />
    </section>
  );
}
