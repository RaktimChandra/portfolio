"use client";
import dynamic from "next/dynamic";
const AgentPipeline = dynamic(() => import("@/three/AgentPipeline"), { ssr: false, loading: () => <div className="pipe"><div className="pipe__stage panel" /></div> });
export default function AgentPipelineLazy() {
  return <AgentPipeline />;
}
