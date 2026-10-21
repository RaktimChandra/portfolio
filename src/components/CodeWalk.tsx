"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useMemo, useRef, useState } from "react";
import data from "@/content/walkthroughs.json";
import { track } from "@/lib/analytics";

type Walk = { slug: string; repo: string; file: string; sha: string; title: string; start: number; code: string; steps: { from: number; to: number; note: string }[] };

const KW = /\b(def|class|return|if|elif|else|for|while|in|not|and|or|await|async|import|from|const|let|function|break|continue|try|except|raise|with|as|None|True|False|null|true|false|new|of|is|lambda|yield)\b/g;

/** Tiny highlighter: comments, strings, numbers, keywords. Enough to read, no dependency. */
function paint(line: string, py: boolean) {
  const out: React.ReactNode[] = [];
  const cm = py ? line.indexOf("#") : line.indexOf("//");
  let code = line, comment = "";
  if (cm >= 0 && !/["'`][^"'`]*$/.test(line.slice(0, cm))) ((code = line.slice(0, cm)), (comment = line.slice(cm)));
  const parts = code.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g);
  parts.forEach((p, i) => {
    if (i % 2) return out.push(<span key={i} className="cw-s">{p}</span>);
    const bits = p.split(KW);
    bits.forEach((b, j) => out.push(j % 2 ? <span key={`${i}-${j}`} className="cw-k">{b}</span> : <span key={`${i}-${j}`}>{b.split(/(\b\d+(?:\.\d+)?\b)/g).map((x, k) => (k % 2 ? <span key={k} className="cw-n">{x}</span> : x))}</span>));
  });
  if (comment) out.push(<span key="c" className="cw-c">{comment}</span>);
  return out;
}

export default function CodeWalk({ slug }: { slug: string }) {
  const xl = useX();
  const w = useMemo(() => (data as Walk[]).find((x) => x.slug === slug), [slug]);
  const [i, setI] = useState(0);
  const pre = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  useEffect(() => {
    if (!w || !pre.current) return;
    const s = w.steps[i];
    const el = pre.current.querySelector<HTMLElement>(`[data-ln="${s.from}"]`);
    if (el) pre.current.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
  }, [i, w]);
  if (!w) return null;
  const lines = w.code.split("\n");
  const step = w.steps[i];
  const py = w.file.endsWith(".py");
  const go = (n: number) => {
    setI(n);
    if (!seen.current) ((seen.current = true), track("code_walkthrough", { slug }));
  };
  const gh = `https://github.com/RaktimChandra/${w.repo}/blob/${w.sha}/${w.file}#L${step.from}-L${step.to}`;
  return (
    <section className="cw" aria-labelledby="cw-h">
      <header className="cw__head">
        <h2 id="cw-h">{xl("Code walkthrough:")}{" "}{xl(w.title)}</h2>
        <p className="text-small muted"><code>{w.file}</code> @ <code>{w.sha.slice(0, 7)}</code> · {xl("copied from the public repo, unedited.")}</p>
      </header>
      <div className="cw__body">
        <ol className="cw__steps">
          {w.steps.map((s, k) => (
            <li key={k}>
              <button type="button" className="cw__step" aria-current={k === i || undefined} onClick={() => go(k)}>
                <span className="tabular cw__lines">L{xl(s.from)}–{xl(s.to)}</span>
                <span>{xl(s.note)}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="cw__code" ref={pre} tabIndex={0} aria-label={`Source of ${w.file}`}>
          <pre>
            {lines.map((l, k) => {
              const n = w.start + k;
              const on = n >= step.from && n <= step.to;
              return (
                <div key={k} data-ln={n} className={on ? "cw__ln is-on" : "cw__ln"}>
                  <span className="cw__no" aria-hidden="true">{n}</span>
                  <code>{paint(l, py)}{"\n"}</code>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
      <p className="cw__nav">
        <button type="button" className="btn btn-quiet" disabled={i === 0} onClick={() => go(i - 1)}>{xl("← Previous")}</button>
        <span className="tabular text-small muted">{i + 1} / {xl(w.steps.length)}</span>
        <button type="button" className="btn btn-quiet" disabled={i === w.steps.length - 1} onClick={() => go(i + 1)}>{xl("Next →")}</button>
        <a className="link-u text-small" href={gh} target="_blank" rel="noopener">{xl("These lines on GitHub ↗")}</a>
      </p>
    </section>
  );
}
