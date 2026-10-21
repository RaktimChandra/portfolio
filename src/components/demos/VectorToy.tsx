"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { projects } from "@/content/projects";
import { track } from "@/lib/analytics";

/*
 * A real (small) vector search, in the browser. Every project write-up becomes a 256-dimension
 * vector of hashed character trigrams weighted by TF-IDF; the query is embedded the same way;
 * results are ranked by the chosen metric. The map is the first two principal components.
 */
const D = 256;
type Metric = "cosine" | "euclidean" | "manhattan";

function grams(text: string) {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ")} `;
  const out: number[] = [];
  for (let i = 0; i < t.length - 2; i++) {
    let h = 2166136261;
    for (let k = 0; k < 3; k++) h = Math.imul(h ^ t.charCodeAt(i + k), 16777619);
    out.push((h >>> 0) % D);
  }
  return out;
}

function build() {
  const docs = projects.map((p) => ({ slug: p.slug, title: p.title, text: `${p.title} ${p.tagline} ${p.summary} ${p.stack.join(" ")}` }));
  const tfs = docs.map((d) => { const v = new Float32Array(D); grams(d.text).forEach((g) => v[g]++); return v; });
  const df = new Float32Array(D);
  tfs.forEach((v) => v.forEach((x, i) => x > 0 && df[i]++));
  const idf = Array.from(df, (x) => Math.log((1 + docs.length) / (1 + x)) + 1);
  const embed = (tf: Float32Array) => {
    const v = tf.map((x, i) => (x ? (1 + Math.log(x)) * idf[i] : 0));
    const n = Math.hypot(...v) || 1;
    return v.map((x) => x / n);
  };
  const vecs = tfs.map(embed);
  // PCA by power iteration on the centred data.
  const mean = new Float32Array(D);
  vecs.forEach((v) => v.forEach((x, i) => (mean[i] += x / vecs.length)));
  const C = vecs.map((v) => v.map((x, i) => x - mean[i]));
  const pc = (deflate?: Float32Array) => {
    let w = new Float32Array(D).map((_, i) => Math.sin(i * 12.9898 + (deflate ? 7 : 1)));
    for (let it = 0; it < 60; it++) {
      const nw = new Float32Array(D);
      for (const r of C) { const s = r.reduce((a, x, i) => a + x * w[i], 0); r.forEach((x, i) => (nw[i] += s * x)); }
      if (deflate) { const d = nw.reduce((a, x, i) => a + x * deflate[i], 0); nw.forEach((_, i) => (nw[i] -= d * deflate[i])); }
      const n = Math.hypot(...nw) || 1;
      w = nw.map((x) => x / n);
    }
    return w;
  };
  const p1 = pc(), p2 = pc(p1);
  const proj = (v: Float32Array) => { const c = v.map((x, i) => x - mean[i]); return [c.reduce((a, x, i) => a + x * p1[i], 0), c.reduce((a, x, i) => a + x * p2[i], 0)] as [number, number]; };
  return { docs, vecs, embed, proj, pts: vecs.map(proj) };
}

const dist = (m: Metric, a: Float32Array, b: Float32Array) => {
  let s = 0;
  if (m === "cosine") { for (let i = 0; i < D; i++) s += a[i] * b[i]; return 1 - s; }
  if (m === "euclidean") { for (let i = 0; i < D; i++) s += (a[i] - b[i]) ** 2; return Math.sqrt(s); }
  for (let i = 0; i < D; i++) s += Math.abs(a[i] - b[i]);
  return s;
};

export default function VectorToy() {
  const idx = useMemo(build, []);
  const [q, setQ] = useState("offline AI on a cheap laptop");
  const [m, setM] = useState<Metric>("cosine");
  const res = useMemo(() => {
    const t0 = performance.now();
    const tf = new Float32Array(D);
    grams(q).forEach((g) => tf[g]++);
    const qv = idx.embed(tf);
    const ranked = idx.vecs.map((v, i) => ({ i, d: dist(m, qv, v) })).sort((a, b) => a.d - b.d).slice(0, 5);
    return { ranked, qp: idx.proj(qv), ms: performance.now() - t0 };
  }, [q, m, idx]);
  const xs = idx.pts.map((p) => p[0]), ys = idx.pts.map((p) => p[1]);
  // Robust bounds (5th–95th percentile) so a few outliers don't squash the map; outliers sit at the edge.
  const pct = (a: number[], q: number) => [...a].sort((u, v) => u - v)[Math.floor(q * (a.length - 1))];
  const [x0, x1, y0, y1] = [pct(xs, 0.05), pct(xs, 0.95), pct(ys, 0.05), pct(ys, 0.95)];
  const cl = (v: number) => Math.max(-0.08, Math.min(1.08, v));
  const sx = (x: number) => 30 + cl((x - x0) / (x1 - x0 || 1)) * 340, sy = (y: number) => 25 + cl((y - y0) / (y1 - y0 || 1)) * 210;
  const top = new Set(res.ranked.map((r) => r.i));
  return (
    <div className="demo">
      <form className="demo__row" onSubmit={(e) => (e.preventDefault(), track("demo_used", { demo: "vector" }))}>
        <label className="sr-only" htmlFor="vq">Search query</label>
        <input id="vq" className="demo__input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Describe a project…" maxLength={120} />
        <div className="demo__seg" role="radiogroup" aria-label="Distance metric">
          {(["cosine", "euclidean", "manhattan"] as Metric[]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={m === k} className="chip" onClick={() => setM(k)}>{k}</button>
          ))}
        </div>
      </form>
      <div className="demo__split">
        <ol className="demo__list">
          {res.ranked.map((r) => (
            <li key={r.i}><Link href={`/work/${idx.docs[r.i].slug}`} className="link-u">{idx.docs[r.i].title}</Link> <span className="tabular muted text-small">{m === "cosine" ? `sim ${(1 - r.d).toFixed(3)}` : `d ${r.d.toFixed(3)}`}</span></li>
          ))}
        </ol>
        <svg viewBox="0 0 400 260" className="demo__map" role="img" aria-label="Projects projected onto two principal components; the query and its nearest neighbours are highlighted">
          {res.ranked.map((r) => <line key={r.i} x1={sx(res.qp[0])} y1={sy(res.qp[1])} x2={sx(idx.pts[r.i][0])} y2={sy(idx.pts[r.i][1])} stroke="var(--accent)" strokeOpacity="0.5" />)}
          {idx.pts.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={top.has(i) ? 5 : 3} fill={top.has(i) ? "var(--accent)" : "var(--ink)"} opacity={top.has(i) ? 1 : 0.35}><title>{idx.docs[i].title}</title></circle>)}
          <circle cx={sx(res.qp[0])} cy={sy(res.qp[1])} r="7" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        </svg>
      </div>
      <p className="text-small muted">Brute-force search over {idx.docs.length} projects in {res.ms.toFixed(1)} ms, in your browser. Vectors are hashed character trigrams with TF-IDF, not a neural embedding; the real VectorEngine adds HNSW and KD-tree indexes and 768-dimension embeddings.</p>
    </div>
  );
}
