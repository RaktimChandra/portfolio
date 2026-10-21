"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { profile } from "@/content/profile";

const SLIDES = [
  { k: "Who", big: "Raktim Chandra", line: `${profile.role}. Final-year CSE at SRM, Chennai. CGPA ${profile.education.cgpa}.` },
  { k: "Builds", big: "Agents that ship", line: "Bulwark: five fraud agents, one auditable verdict under 100 ms. Marginalia: agents that debate before they answer. Genesis: a sentence in, a running app out." },
  { k: "Measures", big: "0.9628 F0.5", line: "Amazon ML Challenge 2026: 1.7M records matched against 10M+, CPU-only. TestHarness: 540 tests, 100% mutation score on domain rules." },
  { k: "Track record", big: "11 · 17+ · 7", line: "Eleven internships and program roles, 17+ freelance clients since 2024, seven IEEE papers. 2× national hackathon winner." },
  { k: "Next", big: "Let's talk", line: `${profile.availability} ${profile.email}` },
];
const DUR = 6000;

export default function Brief() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || i >= SLIDES.length - 1) return;
    const t = setTimeout(() => setI((x) => x + 1), DUR);
    return () => clearTimeout(t);
  }, [i, paused]);
  const s = SLIDES[i];
  return (
    <section className="brief" aria-roledescription="slideshow" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="brief__bars" aria-hidden="true">
        {SLIDES.map((_, n) => (
          <span key={n}><i style={{ width: n < i ? "100%" : n === i ? undefined : "0%", animation: n === i && !paused && i < SLIDES.length - 1 ? `brief ${DUR}ms linear forwards` : "none" }} className={n === i && i === SLIDES.length - 1 ? "full" : ""} /></span>
        ))}
      </div>
      <div key={i} className="brief__slide" aria-live="polite">
        <p className="text-small muted">{String(i + 1).padStart(2, "0")} · {s.k}</p>
        <p className="brief__big display">{s.big}</p>
        <p className="text-lead" style={{ maxWidth: "48ch" }}>{s.line}</p>
      </div>
      <div className="brief__ctrl">
        <button type="button" className="btn btn-quiet" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>← Back</button>
        <button type="button" className="btn btn-quiet" onClick={() => setPaused((p) => !p)}>{paused ? "Play" : "Pause"}</button>
        {i < SLIDES.length - 1 ? (
          <button type="button" className="btn" onClick={() => setI((x) => x + 1)}>Next →</button>
        ) : (
          <Link href="/contact" className="btn">Contact</Link>
        )}
      </div>
    </section>
  );
}
