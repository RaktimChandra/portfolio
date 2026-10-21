"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { journey, KIND_COLOR } from "@/content/journey";
import { useCaps } from "@/lib/device";

const JourneyScene = dynamic(() => import("@/three/JourneyScene"), { ssr: false });

export default function Journey() {
  const section = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [i, setI] = useState(0);
  const three = useCaps().rich;

  useEffect(() => {
    const on = () => {
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      progress.current = p;
      setI(Math.min(journey.length - 1, Math.floor(p * journey.length)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => (window.removeEventListener("scroll", on), window.removeEventListener("resize", on));
  }, []);

  const m = journey[i];
  return (
    <>
      {three && (
        <div ref={section} className="journey" style={{ height: `${journey.length * 70 + 100}vh` }}>
          <div className="journey__stage">
            <JourneyScene progress={progress} />
            <div className="journey__hud" aria-live="polite">
              <p className="text-small" style={{ color: KIND_COLOR[m.kind] }}>{String(i + 1).padStart(2, "0")} / {journey.length} · {m.when}</p>
              <p className="journey__title display">{m.title}</p>
              <div className="journey__bar"><span style={{ width: `${((i + 1) / journey.length) * 100}%` }} /></div>
              <p className="text-small journey__hint">Scroll to fly through the years</p>
            </div>
          </div>
        </div>
      )}
      <section className="wrap section" aria-labelledby="tl-h">
        <h2 id="tl-h" className="sec-title display" style={{ marginBottom: "2rem" }}>The whole timeline</h2>
        <ol className="timeline">
          {journey.map((x, n) => (
            <li key={n} className="timeline__item">
              <p className="timeline__when tabular" style={{ color: KIND_COLOR[x.kind] }}>{x.when}</p>
              <h3 className="timeline__role">{x.href ? <Link href={x.href} className="link-u">{x.title}</Link> : x.title}</h3>
              <p>{x.line}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
