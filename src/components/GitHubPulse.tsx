"use client";

import { useEffect, useState } from "react";
import { profile } from "@/content/profile";

type Data = { ok: boolean; recent?: { repo: string; what: string; at: string; type: string }[]; days?: Record<string, number> };

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

/** Live: what Raktim pushed to GitHub recently. Hidden if GitHub can't be reached. */
export default function GitHubPulse() {
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => {
    fetch("/api/github").then((r) => r.json()).then(setD).catch(() => setD({ ok: false }));
  }, []);
  if (!d?.ok || !d.recent?.length) return null;
  const today = new Date();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(today.getTime() - (41 - i) * 86400000).toISOString().slice(0, 10);
    return { day, n: d.days?.[day] ?? 0 };
  });
  const max = Math.max(1, ...cells.map((c) => c.n));
  const total = cells.reduce((a, c) => a + c.n, 0);
  return (
    <section className="section wrap pulse" aria-labelledby="pulse-h">
      <div className="pulse__head">
        <h2 id="pulse-h" className="sec-title display">Right now.</h2>
        <p className="sec-note">Live from GitHub: {total} public contributions in the last six weeks. Last activity {ago(d.recent[0].at)}.</p>
      </div>
      <div className="pulse__grid" role="img" aria-label={`Activity over the last 42 days, ${total} contributions`}>
        {cells.map((c) => (
          <span key={c.day} title={`${c.day}: ${c.n}`} style={{ ["--v" as string]: c.n ? 0.25 + (c.n / max) * 0.75 : 0.06 }} />
        ))}
      </div>
      <ul className="pulse__list">
        {d.recent.slice(0, 5).map((e, i) => (
          <li key={i}>
            <a className="link-u" href={`${profile.github}/${e.repo}`} target="_blank" rel="noopener">{e.repo}</a>
            <span className="muted"> · {e.what}</span>
            <span className="muted tabular pulse__ago">{ago(e.at)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
