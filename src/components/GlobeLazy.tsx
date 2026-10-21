"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { places } from "@/content/geo";
import { useCaps } from "@/lib/device";

const Globe = dynamic(() => import("@/three/Globe"), { ssr: false });

/** Mount the globe only once it scrolls near, and only with WebGL2. */
export default function GlobeLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const { gl, lite } = useCaps();
  const on = near && gl && !lite;
  useEffect(() => {
    if (!gl || lite) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "300px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [gl, lite]);
  return (
    <section ref={ref} className="globe-sec" aria-labelledby="globe-h">
      <h2 id="globe-h">On the map</h2>
      {on ? <Globe /> : <ul>{places.map((p) => <li key={p.name}><b>{p.name}</b>: {p.note}</li>)}</ul>}
    </section>
  );
}
