/** Shared by the scoper and the proposal page. Week counts are the scoper's rough heuristics, labelled as such wherever shown. */
export const KINDS = [
  { id: "web", label: "Web app or website", weeks: 3, stack: "Next.js, TypeScript, PostgreSQL" },
  { id: "mobile", label: "Mobile app", weeks: 4, stack: "React Native (Expo)" },
  { id: "ai", label: "AI agent or assistant", weeks: 3, stack: "Python, FastAPI, an LLM with retrieval and evaluation" },
  { id: "ml", label: "ML model or prediction", weeks: 4, stack: "Python, scikit-learn or PyTorch, model serving" },
  { id: "dash", label: "Dashboard or analytics", weeks: 2, stack: "SQL, a BI tool or a custom React dashboard" },
  { id: "auto", label: "Automation or integration", weeks: 1.5, stack: "Node.js or Python workers, third-party APIs" },
  { id: "qa", label: "Testing and QA", weeks: 2, stack: "Playwright, API and load tests in CI" },
];
export const SIZE = [
  { id: "s", label: "Small: one core flow", m: 0.6 },
  { id: "m", label: "Medium: a few user roles", m: 1 },
  { id: "l", label: "Large: many features, integrations", m: 1.8 },
];

export function planFor(kinds: string[], size: string) {
  const ks = KINDS.filter((k) => kinds.includes(k.id));
  if (!ks.length) return null;
  const m = (SIZE.find((s) => s.id === size) ?? SIZE[1]).m;
  const base = ks.reduce((n, k) => n + k.weeks, 0) * m;
  const weeks = Math.max(1, Math.round(base * (ks.length > 1 ? 0.85 : 1)));
  const lo = Math.max(1, Math.round(weeks * 0.8));
  const hi = Math.round(weeks * 1.25);
  const milestones = [
    { w: 1, t: "Discovery call, written scope, designs or data audit" },
    { w: Math.max(2, Math.round(weeks * 0.4)), t: `First working version of the core flow (${ks.map((k) => k.label.toLowerCase()).join(", ")})` },
    { w: Math.max(3, Math.round(weeks * 0.8)), t: "Feature-complete on a preview link, with tests" },
    { w: hi, t: "Launch, handover documents and a support window" },
  ];
  return { weeks, lo, hi, ks, milestones };
}
