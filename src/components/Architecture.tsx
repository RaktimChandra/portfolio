"use client";

import dynamic from "next/dynamic";
import { architecture } from "@/content/architecture";
import { useCaps } from "@/lib/device";

const Arch3D = dynamic(() => import("@/three/Arch3D"), { ssr: false });

/** A case study's system as a 3D graph, with the same structure as a plain list underneath for readers and crawlers. */
export default function Architecture({ slug, title }: { slug: string; title: string }) {
  const arch = architecture[slug];
  const gl = useCaps().rich;
  if (!arch) return null;
  const byId = Object.fromEntries(arch.nodes.map((n) => [n.id, n.label]));
  return (
    <section className="arch" aria-labelledby="arch-h">
      <h2 id="arch-h">{title}</h2>
      <p className="muted">{arch.caption}</p>
      {gl && <Arch3D arch={arch} />}
      <ol className={gl ? "sr-only" : "arch__list"}>
        {arch.edges.map(([a, b], i) => <li key={i}>{byId[a]} → {byId[b]}</li>)}
      </ol>
    </section>
  );
}
