"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { profile } from "@/content/profile";

const HoloPortrait = dynamic(() => import("@/three/HoloPortrait"), { ssr: false });

/** Static portrait card first (fast, no JS needed), upgraded to the 3D holo card when the browser can. */
export default function HeroPortrait() {
  const [three, setThree] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = document.createElement("canvas").getContext("webgl2");
    } catch {}
    if (!gl) return;
    const go = () => setThree(true);
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(go, { timeout: 1800 });
    else setTimeout(go, 600);
  }, []);
  return (
    <div className="hero__portrait">
      {three ? (
        <HoloPortrait />
      ) : (
        <figure className="portrait-static">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatar} alt={`Portrait of ${profile.name}`} width={400} height={400} fetchPriority="high" decoding="async" />
        </figure>
      )}
    </div>
  );
}
