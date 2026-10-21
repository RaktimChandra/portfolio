"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { interview } from "@/content/interview";
import { useUI } from "@/lib/store";
import { blip } from "@/lib/sound";
import { track } from "@/lib/analytics";

const STEPS = [["s", "Situation"], ["t", "Task"], ["a", "Action"], ["r", "Result"]] as const;

export default function InterviewMode() {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0); // how many STAR parts revealed
  const [auto, setAuto] = useState(false);
  const x = interview[i];
  const parts = x.star ? STEPS.length : 1;

  const [shownFor, setShownFor] = useState(i);
  if (shownFor !== i) {
    setShownFor(i);
    setShown(0);
  }
  useEffect(() => {
    track("interview_question", { id: x.id });
  }, [x.id]);
  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => {
      if (shown < parts) setShown(shown + 1);
      else if (i < interview.length - 1) setI(i + 1);
      else setAuto(false);
    }, shown === 0 ? 1600 : 3200);
    return () => clearTimeout(id);
  }, [auto, shown, parts, i]);

  const go = (n: number) => (blip("tick"), setI((n + interview.length) % interview.length));

  return (
    <div className="iv">
      <nav className="iv__rail" aria-label="Questions">
        <ol>
          {interview.map((q, n) => (
            <li key={q.id}>
              <button type="button" aria-current={n === i ? "step" : undefined} onClick={() => go(n)}>
                <span className="tabular muted">{String(n + 1).padStart(2, "0")}</span> {q.q}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="iv__stage panel" aria-live="polite" data-title="Interview">
        <p className="text-small muted">Interviewer · question {i + 1} of {interview.length} · {x.tags.join(", ")}</p>
        <h2 className="iv__q display">{x.q}</h2>
        {x.star ? (
          <ol className="iv__star">
            {STEPS.map(([k, label], n) => (
              <li key={k} className={n < shown ? "is-on" : ""} aria-hidden={n >= shown}>
                <b>{label}</b>
                <p>{x.star![k]}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className={`iv__plain ${shown ? "is-on" : ""}`} aria-hidden={!shown}>{x.a}</p>
        )}
        <div className="iv__ctrl">
          {shown < parts ? (
            <button type="button" className="btn" onClick={() => (blip("open"), setShown(x.star ? shown + 1 : 1))}>
              {shown === 0 ? "Hear Raktim's answer" : `Show ${STEPS[shown]?.[1] ?? "more"}`}
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => go(i + 1)}>Next question →</button>
          )}
          {shown < parts && shown > 0 && <button type="button" className="btn btn-quiet" onClick={() => setShown(parts)}>Show all</button>}
          <button type="button" className="btn btn-quiet" onClick={() => setAuto((a) => !a)} aria-pressed={auto}>{auto ? "Stop auto-play" : "Auto-play the interview"}</button>
          <button type="button" className="btn btn-quiet" onClick={() => useUI.getState().open("twin", `Follow-up on "${x.q}"`)}>Ask a follow-up</button>
        </div>
        {shown >= parts && (
          <p className="text-small iv__links">
            Evidence: {x.links.map((l, n) => <span key={l.href}><Link href={l.href} className="link-u">{l.title}</Link>{n < x.links.length - 1 ? " · " : ""}</span>)}
          </p>
        )}
      </section>
    </div>
  );
}
