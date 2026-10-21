"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { profile } from "@/content/profile";
import { useCaps } from "@/lib/device";

const ParticleStory = dynamic(() => import("@/three/ParticleStory"), { ssr: false });

const STAGES = [
  { k: "01", h: "Raktim Chandra.", p: `Final-year computer science at SRM, Chennai. ${profile.education.years}.` },
  { k: "02", h: "Agents first.", p: `${profile.numbers.projects} projects, from five-agent fraud desks to offline clinical NLP on a 4 GB laptop.` },
  { k: "03", h: "For people everywhere.", p: `${profile.numbers.clients} freelance clients: startups, companies and individuals. ${profile.numbers.papers} IEEE papers.` },
  { k: "04", h: "Class of 2027.", p: "Open to 2027 roles. Taking freelance work now." },
];

/** A pinned scroll scene: one cloud of points that becomes the name, a network, a globe, then the year. */
export default function ParticleSection() {
  const sec = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);
  const gl = useCaps().rich;
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!gl) return;
    const el = sec.current!;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "50% 0px" });
    io.observe(el);
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - innerHeight;
      const k = Math.min(1, Math.max(0, -r.top / span));
      progress.current = k * 3;
      setStage(Math.min(3, Math.round(k * 3)));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => (io.disconnect(), removeEventListener("scroll", onScroll));
  }, [gl]);

  if (!gl) {
    return (
      <section className="pstory pstory--flat wrap" aria-label="In four lines">
        {STAGES.map((s) => (
          <div key={s.k}><h2 className="pstory__h display">{s.h}</h2><p>{s.p}</p></div>
        ))}
      </section>
    );
  }

  return (
    <section ref={sec} className="pstory" aria-label="In four lines">
      <div className="pstory__stick">
        <div className="pstory__canvas">{near && <ParticleStory progress={progress} live={near} />}</div>
        <div className="pstory__cap wrap" aria-live="polite">
          <span className="tabular muted">{STAGES[stage].k} / 04</span>
          <h2 className="pstory__h display">{STAGES[stage].h}</h2>
          <p>{STAGES[stage].p}</p>
          {stage === 3 && <p className="pstory__cta"><Link href="/contact" className="btn">Talk to me</Link> <Link href="/resume" className="btn btn-quiet">Résumé</Link></p>}
        </div>
        <ol className="pstory__dots" aria-hidden="true">{STAGES.map((s, i) => <li key={s.k} data-on={i === stage || undefined} />)}</ol>
      </div>
    </section>
  );
}
