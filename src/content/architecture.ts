/**
 * System diagrams for case studies. Every node and edge restates what the project's own
 * write-up says; nothing here adds components the project does not have.
 * `layer` is the column, left to right in the order data flows.
 */
export type ArchNode = { id: string; label: string; note?: string; layer: number; kind?: "io" | "agent" | "store" | "model" | "ui" | "guard" };
export type Arch = { nodes: ArchNode[]; edges: [string, string][]; caption: string };

export const architecture: Record<string, Arch> = {
  clindocmicro: {
    caption: "Paper note in, FHIR record out, on one CPU laptop with no network.",
    nodes: [
      { id: "photo", label: "Photo of note", layer: 0, kind: "io" },
      { id: "ocr", label: "PaddleOCR", note: "Printed and handwritten text, layout-aware line grouping", layer: 1, kind: "model" },
      { id: "ner", label: "GLiNER", note: "Zero-shot entities: drugs, dose, frequency, diagnoses", layer: 2, kind: "model" },
      { id: "llm", label: "Phi-3-mini", note: "Runs on llama.cpp; reconciles fields and flags low confidence", layer: 3, kind: "agent" },
      { id: "human", label: "Human check", note: "Low-confidence fields go to a person", layer: 4, kind: "guard" },
      { id: "fhir", label: "FHIR R4B", layer: 4, kind: "io" },
      { id: "db", label: "SQLite", layer: 5, kind: "store" },
    ],
    edges: [["photo", "ocr"], ["ocr", "ner"], ["ner", "llm"], ["llm", "human"], ["llm", "fhir"], ["fhir", "db"]],
  },
  bulwark: {
    caption: "Every transaction fans out to five agents; a consensus layer decides and keeps the reasoning.",
    nodes: [
      { id: "txn", label: "Transaction", layer: 0, kind: "io" },
      { id: "ing", label: "Ingestion checks", layer: 1, kind: "agent" },
      { id: "att", label: "Attention risk model", note: "PyTorch, five feature-group tokens, perturbation attribution", layer: 1, kind: "model" },
      { id: "graph", label: "Graph agent", note: "Shared devices, peer entities, 4-cycle mule patterns", layer: 1, kind: "agent" },
      { id: "beh", label: "Behavioural baseline", layer: 1, kind: "agent" },
      { id: "rules", label: "Rules engine", note: "Sanctions and structuring", layer: 1, kind: "guard" },
      { id: "cons", label: "Weighted consensus", note: "Records the full reasoning trail", layer: 2, kind: "agent" },
      { id: "pg", label: "PostgreSQL", layer: 3, kind: "store" },
      { id: "ui", label: "Analyst UI", note: "Next.js, shows reasoning not just the score", layer: 3, kind: "ui" },
    ],
    edges: [["txn", "ing"], ["txn", "att"], ["txn", "graph"], ["txn", "beh"], ["txn", "rules"], ["ing", "cons"], ["att", "cons"], ["graph", "cons"], ["beh", "cons"], ["rules", "cons"], ["cons", "pg"], ["cons", "ui"]],
  },
  marginalia: {
    caption: "Four agents investigate, then argue under a protocol before anything is written.",
    nodes: [
      { id: "q", label: "Query", layer: 0, kind: "io" },
      { id: "exp", label: "Explorer", layer: 1, kind: "agent" },
      { id: "sk", label: "Skeptic", layer: 1, kind: "agent" },
      { id: "ver", label: "Verifier", layer: 1, kind: "agent" },
      { id: "syn", label: "Synthesizer", layer: 1, kind: "agent" },
      { id: "chroma", label: "ChromaDB", layer: 1.5, kind: "store" },
      { id: "debate", label: "Debate protocol", note: "Agents must answer each other's objections", layer: 2, kind: "guard" },
      { id: "rep", label: "Cited report", note: "Sentence-level sources and per-claim confidence", layer: 3, kind: "io" },
      { id: "ws", label: "WebSocket → React", note: "Every internal message streams live", layer: 3, kind: "ui" },
    ],
    edges: [["q", "exp"], ["q", "sk"], ["q", "ver"], ["q", "syn"], ["exp", "chroma"], ["exp", "debate"], ["sk", "debate"], ["ver", "debate"], ["syn", "debate"], ["debate", "rep"], ["debate", "ws"]],
  },
  "business-entity-resolution": {
    caption: "1.7M queries against a 10M+ pool: normalise, block wide, prune, then match.",
    nodes: [
      { id: "in", label: "1.7M records", layer: 0, kind: "io" },
      { id: "pool", label: "10M+ pool", layer: 0, kind: "store" },
      { id: "norm", label: "Normalise", note: "Indic-to-Latin transliteration, legal suffixes, phonetic and vowel-free skeletons", layer: 1, kind: "model" },
      { id: "block", label: "12 blocking channels", note: "Hashed keys, IDF-weighted vote, two-path rerank", layer: 2, kind: "agent" },
      { id: "prune", label: "LightGBM pruner", note: "About five-fold fewer pairs, recall kept", layer: 3, kind: "model" },
      { id: "match", label: "Matcher", layer: 4, kind: "model" },
      { id: "out", label: "Matches", layer: 5, kind: "io" },
    ],
    edges: [["in", "norm"], ["pool", "norm"], ["norm", "block"], ["block", "prune"], ["prune", "match"], ["match", "out"]],
  },
  testharness: {
    caption: "Eight suites against one app with six switchable defects; the experiment shows which suite catches what.",
    nodes: [
      { id: "sut", label: "Gate-appointment app", note: "Six switchable defects", layer: 0, kind: "io" },
      { id: "api", label: "API", layer: 1, kind: "guard" },
      { id: "ui", label: "UI", layer: 1, kind: "guard" },
      { id: "bdd", label: "BDD", layer: 1, kind: "guard" },
      { id: "con", label: "Contract", layer: 1, kind: "guard" },
      { id: "a11y", label: "Accessibility", layer: 1.5, kind: "guard" },
      { id: "vis", label: "Visual", layer: 1.5, kind: "guard" },
      { id: "sec", label: "Security", layer: 1.5, kind: "guard" },
      { id: "perf", label: "Performance", layer: 1.5, kind: "guard" },
      { id: "fault", label: "Fault-seeding experiment", layer: 2.5, kind: "agent" },
      { id: "ci", label: "CI history", layer: 3.5, kind: "store" },
      { id: "dash", label: "Quality dashboard", layer: 4.5, kind: "ui" },
    ],
    edges: [["sut", "api"], ["sut", "ui"], ["sut", "bdd"], ["sut", "con"], ["sut", "a11y"], ["sut", "vis"], ["sut", "sec"], ["sut", "perf"], ["api", "fault"], ["ui", "fault"], ["bdd", "fault"], ["con", "fault"], ["a11y", "fault"], ["vis", "fault"], ["sec", "fault"], ["perf", "fault"], ["fault", "ci"], ["ci", "dash"]],
  },
  "medgraph-rag": {
    caption: "A graph of the literature, walked hop by hop, so the model reads a small precise context.",
    nodes: [
      { id: "lit", label: "Biomedical literature", note: "2M+ tokens", layer: 0, kind: "io" },
      { id: "kg", label: "Knowledge graph", note: "Genes, proteins, pathways, drugs, interactions", layer: 1, kind: "store" },
      { id: "q", label: "Question", layer: 1, kind: "io" },
      { id: "hop", label: "Multi-hop traversal", layer: 2, kind: "agent" },
      { id: "ctx", label: "Compact context", layer: 3, kind: "io" },
      { id: "llm", label: "LLM answer", layer: 4, kind: "model" },
    ],
    edges: [["lit", "kg"], ["kg", "hop"], ["q", "hop"], ["hop", "ctx"], ["ctx", "llm"]],
  },
  aerosentinel: {
    caption: "Detect, look up, assess, draft, and wait for a licensed engineer; every step on a ledger.",
    nodes: [
      { id: "img", label: "Surface image", layer: 0, kind: "io" },
      { id: "det", label: "Damage detection", layer: 1, kind: "model" },
      { id: "man", label: "Manual retrieval", layer: 2, kind: "agent" },
      { id: "sev", label: "Severity vs limits", note: "Allowable damage limits", layer: 3, kind: "guard" },
      { id: "card", label: "Draft work card", layer: 4, kind: "agent" },
      { id: "eng", label: "Engineer signs", layer: 5, kind: "guard" },
      { id: "ledger", label: "Tamper-evident ledger", layer: 2.5, kind: "store" },
    ],
    edges: [["img", "det"], ["det", "man"], ["man", "sev"], ["sev", "card"], ["card", "eng"], ["det", "ledger"], ["sev", "ledger"], ["eng", "ledger"]],
  },
  genesis: {
    caption: "Seven agents design, write, audit and repair an app, then boot it in the browser.",
    nodes: [
      { id: "req", label: "Request", layer: 0, kind: "io" },
      { id: "arch", label: "Architect", layer: 1, kind: "agent" },
      { id: "plan", label: "Planner", layer: 2, kind: "agent" },
      { id: "gen", label: "Generator", layer: 3, kind: "agent" },
      { id: "ver", label: "Verifier", note: "Hunts frontend–backend contract mismatches", layer: 4, kind: "guard" },
      { id: "dbg", label: "Debugger", note: "Loops until clean", layer: 4, kind: "agent" },
      { id: "rev", label: "Reverse-Verifier", note: "Reads the code blind, checks it against the request", layer: 5, kind: "guard" },
      { id: "rvw", label: "Reviewer", note: "Signs off with a confidence score", layer: 6, kind: "agent" },
      { id: "app", label: "Live app in browser", layer: 7, kind: "ui" },
    ],
    edges: [["req", "arch"], ["arch", "plan"], ["plan", "gen"], ["gen", "ver"], ["ver", "dbg"], ["dbg", "gen"], ["ver", "rev"], ["rev", "rvw"], ["rvw", "app"]],
  },
  provenance: {
    caption: "A proof that the audited model made the decision, without revealing weights or data.",
    nodes: [
      { id: "data", label: "Applicant data", note: "Stays private", layer: 0, kind: "io" },
      { id: "model", label: "Audited model", note: "Weights stay private", layer: 0, kind: "model" },
      { id: "score", label: "Credit decision", layer: 1, kind: "agent" },
      { id: "zk", label: "Zero-knowledge proof", layer: 2, kind: "guard" },
      { id: "chain", label: "On-chain verifier", note: "Anyone can check", layer: 3, kind: "store" },
    ],
    edges: [["data", "score"], ["model", "score"], ["score", "zk"], ["zk", "chain"]],
  },
  obscura: {
    caption: "Faces are gone before any feature exists; unlocking identity takes two of three keys, in public.",
    nodes: [
      { id: "cam", label: "Camera", layer: 0, kind: "io" },
      { id: "red", label: "Edge face redaction", layer: 1, kind: "guard" },
      { id: "feat", label: "Features", layer: 2, kind: "model" },
      { id: "dp", label: "Differentially private analytics", layer: 3, kind: "agent" },
      { id: "keys", label: "2-of-3 key holders", note: "Lawful identity unlock only", layer: 2, kind: "guard" },
      { id: "hash", label: "Public hash chain", layer: 3, kind: "store" },
    ],
    edges: [["cam", "red"], ["red", "feat"], ["feat", "dp"], ["red", "keys"], ["keys", "hash"]],
  },
  agentos: {
    caption: "Agents run with an identity, every tool call is authorised, and every run can be replayed.",
    nodes: [
      { id: "agent", label: "Agent", note: "Verifiable identity, delegation chain", layer: 0, kind: "agent" },
      { id: "gw", label: "Tool gateway", note: "Authorises every call", layer: 1, kind: "guard" },
      { id: "pol", label: "Policy + budgets", layer: 2, kind: "guard" },
      { id: "tools", label: "Tools", layer: 3, kind: "io" },
      { id: "otel", label: "OpenTelemetry traces", layer: 2, kind: "store" },
      { id: "replay", label: "Record and replay", note: "Deterministic regression tests", layer: 3, kind: "store" },
    ],
    edges: [["agent", "gw"], ["gw", "pol"], ["pol", "tools"], ["gw", "otel"], ["otel", "replay"]],
  },
  portsync: {
    caption: "Port events through Kafka, applied exactly once, impossible ones dead-lettered.",
    nodes: [
      { id: "ev", label: "Cranes, berths, gates, yard", layer: 0, kind: "io" },
      { id: "kafka", label: "Kafka", layer: 1, kind: "store" },
      { id: "svc", label: "Spring Boot", note: "Applies each event exactly once", layer: 2, kind: "agent" },
      { id: "dlq", label: "Dead letters", layer: 3, kind: "store" },
      { id: "sla", label: "SLA rules", layer: 3, kind: "guard" },
      { id: "ui", label: "React dashboard", layer: 4, kind: "ui" },
    ],
    edges: [["ev", "kafka"], ["kafka", "svc"], ["svc", "dlq"], ["svc", "sla"], ["sla", "ui"], ["svc", "ui"]],
  },
};
