"use client";

import { useMemo, useState } from "react";
import { profile } from "@/content/profile";
import { track } from "@/lib/analytics";

import { KINDS, SIZE, planFor } from "@/content/scope";
import { Link } from "@/i18n/navigation";

export default function Scoper() {
  const [idea, setIdea] = useState("");
  const [kinds, setKinds] = useState<string[]>(["web"]);
  const [size, setSize] = useState("m");
  const [deadline, setDeadline] = useState("");

  const plan = useMemo(() => planFor(kinds, size), [kinds, size]);

  const mail = plan
    ? `mailto:${profile.email}?subject=${encodeURIComponent("Project scope")}&body=${encodeURIComponent(
        `Idea: ${idea || "(see below)"}\nType: ${plan.ks.map((k) => k.label).join(", ")}\nSize: ${SIZE.find((s) => s.id === size)!.label}\nDeadline: ${deadline || "flexible"}\nRough timeline from the scoper: ${plan.lo}–${plan.hi} weeks\n\nA little more about it:\n`,
      )}`
    : "#";

  return (
    <div className="case">
      <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
        <label className="text-small muted" htmlFor="idea">What do you want built? Two lines is enough.</label>
        <textarea id="idea" className="textarea" style={{ minHeight: 120 }} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="A dashboard for our sales team that predicts which leads will close…" maxLength={2000} />
        <fieldset style={{ border: 0, padding: 0, display: "grid", gap: 8 }}>
          <legend className="text-small muted" style={{ marginBottom: 8 }}>What kind of work? Pick all that apply.</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {KINDS.map((k) => (
              <button key={k.id} type="button" className="chip" aria-pressed={kinds.includes(k.id)} onClick={() => setKinds((x) => (x.includes(k.id) ? x.filter((y) => y !== k.id) : [...x, k.id]))}>{k.label}</button>
            ))}
          </div>
        </fieldset>
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend className="text-small muted" style={{ marginBottom: 8 }}>How big?</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SIZE.map((s) => <button key={s.id} type="button" className="chip" aria-pressed={size === s.id} onClick={() => setSize(s.id)}>{s.label}</button>)}
          </div>
        </fieldset>
        <label className="text-small muted" htmlFor="deadline">Deadline, if any</label>
        <input id="deadline" type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </form>

      <aside className="case__aside panel" style={{ padding: "1.5rem" }} aria-live="polite" data-title="Plan">
        {plan ? (
          <>
            <p className="text-small muted">Rough timeline</p>
            <p className="display" style={{ fontSize: "clamp(3rem, 2rem + 3vw, 5rem)" }}>{plan.lo}–{plan.hi} weeks</p>
            <ol style={{ paddingLeft: "1.1rem", display: "grid", gap: 8 }}>
              {plan.milestones.map((m) => <li key={m.t}><b className="tabular">Week {m.w}.</b> {m.t}</li>)}
            </ol>
            <p className="text-small"><b>Likely stack:</b> {plan.ks.map((k) => k.stack).join("; ")}.</p>
            <p className="text-small muted">A starting point, not a quote. The real estimate comes after a short call.</p>
            <p style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <a className="btn" href={mail} onClick={() => track("project_scoped", { kinds, size, weeks: plan.weeks })}>Send this to Raktim</a>
              <Link className="btn btn-quiet" href={`/proposal?k=${kinds.join(",")}&s=${size}${deadline ? `&d=${deadline}` : ""}${idea ? `&i=${encodeURIComponent(idea.slice(0, 600))}` : ""}`} onClick={() => track("proposal_opened", { kinds, size })}>Make it a proposal PDF</Link>
            </p>
          </>
        ) : (
          <p className="muted">Pick at least one kind of work to see a plan.</p>
        )}
      </aside>
    </div>
  );
}
