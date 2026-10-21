"use client";

import { useEffect, useMemo, useState } from "react";
import Resume from "./Resume";
import { match } from "@/lib/matcher";
import { profile } from "@/content/profile";
import { Link } from "@/i18n/navigation";
import { track } from "@/lib/analytics";

const SAMPLE = `Machine Learning Engineer (New Grad)
We're looking for an engineer to build LLM agents and RAG pipelines in Python, deploy models with Docker and FastAPI on AWS, and set up CI/CD. Experience with PyTorch, PostgreSQL, React and Kubernetes is a plus. Familiarity with Spark or Airflow helps.`;

export default function Matcher() {
  const [jd, setJd] = useState("");
  const [shown, setShown] = useState("");
  const r = useMemo(() => (shown ? match(shown) : null), [shown]);
  useEffect(() => {
    if (r) track("job_matched", { score: r.score, matched: r.matched.length, gaps: r.missing.length, role: r.role.slice(0, 80) });
  }, [r]);

  const summary = r
    ? `${profile.role} applying${r.role ? ` for ${r.role}` : ""}. Hands-on with ${r.matched.slice(0, 8).join(", ")}${r.matched.length > 8 ? " and more" : ""}. ${profile.numbers.internships} internships, ${profile.numbers.clients} freelance clients, 7 IEEE papers. B.Tech CSE, SRMIST, 2027, CGPA ${profile.education.cgpa}.`
    : "";

  return (
    <>
      <div className="match-ui no-print">
        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            setShown(jd);
          }}
        >
          <label htmlFor="jd" className="text-small muted">Paste a job description</label>
          <textarea id="jd" className="textarea" value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full job post here…" maxLength={20000} />
          <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="submit" className="btn" disabled={jd.trim().length < 30}>Match</button>
            <button type="button" className="btn btn-quiet" onClick={() => (setJd(SAMPLE), setShown(SAMPLE))}>Try a sample</button>
          </p>
        </form>

        {r && (
          <section className="section" aria-live="polite" style={{ paddingBlock: "2rem" }}>
            <div className="big-metrics">
              <div><dt className="text-small muted">Skill coverage</dt><dd className="tabular">{r.score}%</dd></div>
              <div><dt className="text-small muted">Skills matched</dt><dd className="tabular">{r.matched.length}</dd></div>
              <div><dt className="text-small muted">Gaps named</dt><dd className="tabular">{r.missing.length}</dd></div>
            </div>
            <div className="meter" aria-hidden="true"><span style={{ width: `${r.score}%` }} /></div>
            <div className="card-grid" style={{ marginTop: "2rem" }}>
              <div className="card panel" data-title="Matched">
                <h2 className="card__title">Matched</h2>
                <p className="card__meta">{r.matched.length ? r.matched.map((m) => <span className="tag" key={m}>{m}</span>) : "No overlap found. Is this the right post?"}</p>
              </div>
              <div className="card panel" data-title="Gaps">
                <h2 className="card__title">Gaps, honestly</h2>
                <p className="card__meta">{r.missing.length ? r.missing.map((m) => <span className="tag" key={m}>{m}</span>) : "None of the common technologies in the post are missing."}</p>
                {!!r.missing.length && <p className="text-small muted">Listed so you don&apos;t have to find them. I pick up new stacks quickly; ask me how.</p>}
              </div>
              <div className="card panel" data-title="Projects">
                <h2 className="card__title">Most relevant work</h2>
                <ul style={{ paddingLeft: "1.1rem", display: "grid", gap: 4 }}>{r.projects.map((p) => <li key={p.slug}><Link href={`/work/${p.slug}`} className="link-u">{p.title}</Link></li>)}</ul>
              </div>
            </div>
            <p style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button type="button" className="btn" onClick={() => window.print()}>Print or save this tailored résumé</button>
              <a className="btn btn-quiet" href={`mailto:${profile.email}?subject=${encodeURIComponent(`Role: ${r.role || "opportunity"}`)}`}>Email Raktim about this role</a>
            </p>
          </section>
        )}
      </div>
      {r && (
        <div className="cv-sheet" style={{ marginTop: "2rem" }}>
          <Resume projects={r.projects} summary={summary} highlightSkills={r.matched} />
        </div>
      )}
    </>
  );
}
