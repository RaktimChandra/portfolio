"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/*
 * A replay of Marginalia's deliberation protocol (orchestrator.py): Explorer proposes claims,
 * then Skeptic → Verifier rounds until nothing is contested, then the Synthesizer writes.
 * The messages are prewritten to show the protocol; in the real system each one is an LLM agent
 * reading retrieved sources.
 */
type Role = "orchestrator" | "explorer" | "skeptic" | "verifier" | "synthesizer";
type Claim = { id: string; text: string; conf: number; contested?: boolean };
type Ev = { role: Role; round: number; text: string; set?: Partial<Record<string, Partial<Claim>>> };

const Q = "Should a rural clinic's record system work fully offline?";
const START: Claim[] = [
  { id: "c1", text: "Offline-first keeps records usable when the network is down.", conf: 0.7 },
  { id: "c2", text: "Offline systems are always cheaper to run.", conf: 0.6 },
  { id: "c3", text: "Local processing keeps patient data on the premises.", conf: 0.65 },
];
const SCRIPT: Ev[] = [
  { role: "orchestrator", round: 0, text: "Retrieved 8 sources. Starting deliberation." },
  { role: "explorer", round: 0, text: "Proposing three claims from the sources: availability, cost, and data locality." },
  { role: "skeptic", round: 1, text: "c2 says 'always'. Hardware, updates and on-site support cost money; the sources compare setups, they don't prove a universal rule." },
  { role: "verifier", round: 1, text: "c1 is supported by two sources. c2 is not supported as stated: marking it contested. c3 holds if backups also stay local.", set: { c1: { conf: 0.82 }, c2: { conf: 0.35, contested: true }, c3: { conf: 0.72, text: "Local processing keeps patient data on the premises, if backups stay local too." } } },
  { role: "skeptic", round: 2, text: "No new objection to c1 or c3. c2 still has no evidence for 'always'." },
  { role: "verifier", round: 2, text: "Narrowing c2 to what the sources say: lower bandwidth costs, but not lower total cost. Contest resolved.", set: { c2: { text: "Offline systems avoid recurring bandwidth costs; total cost depends on the setup.", conf: 0.66, contested: false } } },
  { role: "skeptic", round: 3, text: "No objections this round." },
  { role: "orchestrator", round: 3, text: "Convergence detected after round 3. Halting debate." },
  { role: "synthesizer", round: 4, text: "Report: yes, with care. Availability and data locality are well supported; the cost claim survives only in its narrowed form. Each sentence cites the sources the Verifier checked." },
];

export default function DebateSim() {
  const xl = useX();
  const [n, setN] = useState(0);
  const [claims, setClaims] = useState(START);
  const [playing, setPlaying] = useState(false);
  const log = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (!playing || n >= SCRIPT.length) return;
    const t = setTimeout(() => {
      const ev = SCRIPT[n];
      if (ev.set) setClaims((cs) => cs.map((c) => ({ ...c, ...(ev.set![c.id] ?? {}) })));
      setN(n + 1);
      if (n + 1 >= SCRIPT.length) setPlaying(false);
    }, n === 0 ? 300 : 1500);
    return () => clearTimeout(t);
  }, [playing, n]);
  useEffect(() => { log.current?.lastElementChild?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [n]);
  const start = () => { setN(0); setClaims(START); setPlaying(true); track("demo_used", { demo: "debate" }); };
  return (
    <div className="demo">
      <p className="demo__row"><b>{xl("Query:")}</b> {xl(Q)} <button type="button" className="btn" onClick={start} disabled={playing}>{n ? xl("Replay") : xl("Start the debate")}</button></p>
      <div className="demo__split">
        <ol className="debate__log" ref={log} aria-live="polite">
          {SCRIPT.slice(0, n).map((e, i) => (
            <li key={i} data-role={e.role}><span className="debate__who">{xl(e.role)}{e.round ? ` · round ${e.round}` : ""}</span>{xl(e.text)}</li>
          ))}
          {!n && <li className="muted">{xl("Press start to watch the agents argue.")}</li>}
        </ol>
        <ul className="debate__claims">
          {claims.map((c) => (
            <li key={c.id} data-contested={c.contested || undefined}>
              <span className="text-small muted">{xl(c.id)}{c.contested ? xl(" · contested") : ""}</span>
              <span>{xl(c.text)}</span>
              <span className="debate__bar" style={{ ["--w" as string]: `${c.conf * 100}%` }}><i /></span>
              <span className="tabular text-small">{xl("confidence")}{" "}{c.conf.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-small muted"><b>{xl("Protocol simulation.")}</b>{" "}{xl("The messages are prewritten to show how the protocol runs; in Marginalia each one is an LLM agent working from retrieved sources, streamed over a WebSocket.")}</p>
    </div>
  );
}
