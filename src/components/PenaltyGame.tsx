"use client";

import dynamic from "next/dynamic";
import Penalty from "./Penalty";
import { useCaps } from "@/lib/device";

const Penalty3D = dynamic(() => import("@/three/Penalty3D"), { ssr: false, loading: () => <div className="pens" /> });

/** 3D penalty when the device can take it; the flat six-zone version on low-end phones or without WebGL. */
export default function PenaltyGame() {
  const { gl, lite } = useCaps();
  return gl && !lite ? <Penalty3D /> : <Penalty />;
}
