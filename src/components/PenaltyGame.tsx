"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Penalty from "./Penalty";

const Penalty3D = dynamic(() => import("@/three/Penalty3D"), { ssr: false });

/** 3D penalty when WebGL2 is there; the flat six-zone version otherwise. */
export default function PenaltyGame() {
  const [gl, setGl] = useState<boolean | null>(null);
  useEffect(() => {
    try { setGl(!!document.createElement("canvas").getContext("webgl2")); } catch { setGl(false); }
  }, []);
  if (gl === null) return <div className="pens" />;
  return gl ? <Penalty3D /> : <Penalty />;
}
