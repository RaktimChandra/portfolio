"use client";

import dynamic from "next/dynamic";

const DEMOS = {
  vectorengine: { title: "Try it: vector search over my projects", C: dynamic(() => import("./VectorToy"), { ssr: false }) },
  testharness: { title: "Try it: seed a bug, see which suite catches it", C: dynamic(() => import("./FaultToy"), { ssr: false }) },
  marginalia: { title: "Watch it: the debate protocol", C: dynamic(() => import("./DebateSim"), { ssr: false }) },
} as const;

export const hasDemo = (slug: string) => slug in DEMOS;

export default function LiveDemo({ slug }: { slug: string }) {
  const d = DEMOS[slug as keyof typeof DEMOS];
  if (!d) return null;
  return (
    <section className="live-demo panel" aria-labelledby={`demo-${slug}`} data-title="Live demo">
      <h2 id={`demo-${slug}`}>{d.title}</h2>
      <d.C />
    </section>
  );
}
