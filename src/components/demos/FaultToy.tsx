"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/*
 * A miniature of TestHarness's fault-seeding experiment, running for real in the browser.
 * One small system under test (a container-gate booking function), six switchable bugs,
 * four suites of genuine assertions. A suite is credited only if it is green with no bug
 * and red with the bug on, the same rule fault_matrix.py uses.
 */
type Bug = "capacity" | "idcheck" | "double" | "contract" | "closing" | "slow";
const BUGS: { id: Bug; label: string }[] = [
  { id: "capacity", label: "Slot capacity off by one" },
  { id: "idcheck", label: "Accepts malformed container IDs" },
  { id: "double", label: "Same container booked twice" },
  { id: "contract", label: "Response field renamed" },
  { id: "closing", label: "Books at closing time" },
  { id: "slow", label: "40 ms busy-wait on every call" },
];
type Booking = { container: string; hour: number };
type Res = { ok: boolean; bookingId?: string; booking_id?: string; error?: string };

function makeGate(bug: Bug | null) {
  const CAP = 3, OPEN = 6, CLOSE = 22;
  const booked: Booking[] = [];
  return (container: string, hour: number): Res => {
    if (bug === "slow") { const t = performance.now(); while (performance.now() - t < 40); }
    const idOk = bug === "idcheck" ? /^[A-Za-z]{4}\d{6,7}$/.test(container) : /^[A-Z]{4}\d{7}$/.test(container);
    if (!idOk) return { ok: false, error: "bad-id" };
    if (hour < OPEN || (bug === "closing" ? hour > CLOSE : hour >= CLOSE)) return { ok: false, error: "closed" };
    if (bug !== "double" && booked.some((b) => b.container === container)) return { ok: false, error: "duplicate" };
    const inSlot = booked.filter((b) => b.hour === hour).length;
    if (bug === "capacity" ? inSlot > CAP : inSlot >= CAP) return { ok: false, error: "full" };
    booked.push({ container, hour });
    const id = `G-${hour}-${booked.length}`;
    return bug === "contract" ? { ok: true, booking_id: id } : { ok: true, bookingId: id };
  };
}

const SUITES: { id: string; name: string; tests: [string, (g: ReturnType<typeof makeGate>) => boolean][] }[] = [
  { id: "unit", name: "Unit", tests: [
    ["valid booking succeeds", (g) => g("MSCU1234567", 9).ok],
    ["fourth booking in a slot is refused", (g) => (["MSCU1000001", "MSCU1000002", "MSCU1000003"].forEach((c) => g(c, 10)), g("MSCU1000004", 10).error === "full")],
    ["duplicate container refused", (g) => (g("TGHU7654321", 11), g("TGHU7654321", 12).error === "duplicate")],
  ] },
  { id: "boundary", name: "Boundary", tests: [
    ["06:00 opens", (g) => g("CMAU1111111", 6).ok],
    ["22:00 is closed", (g) => g("CMAU2222222", 22).error === "closed"],
    ["lowercase ID rejected", (g) => g("cmau3333333", 9).error === "bad-id"],
    ["six-digit ID rejected", (g) => g("CMAU333333", 9).error === "bad-id"],
  ] },
  { id: "contract", name: "Contract", tests: [
    ["success has bookingId string", (g) => typeof g("HLXU5555555", 14).bookingId === "string"],
    ["failure has error code", (g) => typeof g("bad", 14).error === "string"],
  ] },
  { id: "perf", name: "Performance", tests: [
    ["6 calls under 150 ms", (g) => { const t = performance.now(); for (let i = 0; i < 6; i++) g(`OOLU${String(4000000 + i)}`, 7 + (i % 15)); return performance.now() - t < 150; }],
  ] },
];

type Cell = { caught: boolean; failed: number; total: number };
function runSuite(s: (typeof SUITES)[number], bug: Bug | null): Cell {
  let failed = 0;
  for (const [, fn] of s.tests) { try { if (!fn(makeGate(bug))) failed++; } catch { failed++; } }
  return { caught: failed > 0, failed, total: s.tests.length };
}

export default function FaultToy() {
  const [m, setM] = useState<{ base: Record<string, Cell>; rows: Record<Bug, Record<string, Cell>>; ms: number } | null>(null);
  const run = () => {
    const t = performance.now();
    const base = Object.fromEntries(SUITES.map((s) => [s.id, runSuite(s, null)]));
    const rows = Object.fromEntries(BUGS.map((b) => [b.id, Object.fromEntries(SUITES.map((s) => [s.id, runSuite(s, b.id)]))])) as Record<Bug, Record<string, Cell>>;
    setM({ base, rows, ms: performance.now() - t });
    track("demo_used", { demo: "fault" });
  };
  return (
    <div className="demo">
      <p className="demo__row"><button type="button" className="btn" onClick={run}>{m ? "Run the experiment again" : "Seed each bug and run every suite"}</button>{m && <span className="text-small muted tabular">{BUGS.length * SUITES.length + SUITES.length} suite runs in {m.ms.toFixed(0)} ms</span>}</p>
      {m && (
        <div className="demo__table-wrap">
          <table className="demo__table">
            <thead><tr><th scope="col">Seeded bug</th>{SUITES.map((s) => <th key={s.id} scope="col">{s.name}</th>)}</tr></thead>
            <tbody>
              <tr><th scope="row" className="muted">No bug (baseline)</th>{SUITES.map((s) => <td key={s.id} data-s={m.base[s.id].caught ? "red" : "green"}>{m.base[s.id].caught ? `red ${m.base[s.id].failed}/${m.base[s.id].total}` : "green"}</td>)}</tr>
              {BUGS.map((b) => (
                <tr key={b.id}>
                  <th scope="row">{b.label}</th>
                  {SUITES.map((s) => {
                    const c = m.rows[b.id][s.id], credited = !m.base[s.id].caught && c.caught;
                    return <td key={s.id} data-s={credited ? "caught" : "escaped"}>{credited ? `caught ${c.failed}/${c.total}` : "escaped"}</td>;
                  })}
                </tr>
              ))}
              <tr><th scope="row">Detection rate</th>{SUITES.map((s) => <td key={s.id} className="tabular"><b>{Math.round((100 * BUGS.filter((b) => !m.base[s.id].caught && m.rows[b.id][s.id].caught).length) / BUGS.length)}%</b></td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
      <p className="text-small muted">No single suite catches everything; that is the point of the full project, which runs eight suites against a real web app in CI.</p>
    </div>
  );
}
