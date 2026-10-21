/**
 * Write-ups. Every number comes from the linked repository's README or results file.
 */
export type Block =
  | { t: "p"; x: string }
  | { t: "h2"; x: string }
  | { t: "ul"; x: string[] }
  | { t: "quote"; x: string }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "code"; x: string };

export type Post = { slug: string; title: string; dek: string; date: string; minutes: number; tags: string[]; project?: string; body: Block[] };

export const posts: Post[] = [
  {
    slug: "0-9628-f05-on-10-million-records",
    title: "How we reached 0.9628 F0.5 on 10 million noisy records",
    dek: "Entity resolution for the Amazon ML Challenge 2026, on CPU, offline, across six scripts. The gain that mattered came from a diagnostic, not a bigger model.",
    date: "2026-10-21",
    minutes: 6,
    tags: ["Machine learning", "Data", "Competitions"],
    project: "business-entity-resolution",
    body: [
      { t: "p", x: "The task: take 1.7 million business records and, for each, find its duplicates in a pool of more than 10 million noisy records from the US, India and France. Many names are written in Devanagari, Bengali, Tamil and other Indic scripts. Scoring is macro F0.5 per entity, so precision counts four times as much as recall. Everything had to run on CPU, offline." },
      { t: "h2", x: "Three rounds, measured" },
      { t: "table", head: ["", "Round 1", "Round 2", "Round 3"], rows: [["Public leaderboard (macro F0.5)", "0.9141", "0.9628", "finished after the portal closed"], ["Out-of-fold F0.5", "0.8594", "0.9553", "0.9617"], ["Blocking recall", "87.50%", "94.97%", "95.59%"], ["Candidates per entity", "5.73", "6.53", "6.87"], ["Precision (out of fold)", "0.993", "0.995", "0.995"]] },
      { t: "h2", x: "Cascade blocking: recall first, then cut" },
      { t: "p", x: "Comparing every record with every other is impossible at this size. The pipeline normalises names first (Indic-to-Latin transliteration, abbreviation and state-code folding, legal-suffix stripping, a phonetic key and a vowel-free skeleton, numeric anchors), then builds twelve hashed key channels over an inverted index of the 10 million targets. An IDF-weighted vote and a two-path rerank produce candidates, and a cheap LightGBM pruner removes about 80% of the pairs while keeping recall. Only about six candidates per entity reach the matcher: a reduction ratio of 99.99993%." },
      { t: "h2", x: "The diagnostic that was worth +0.049" },
      { t: "p", x: "Instead of guessing what to try next, we wrote a blocking diagnostic that sorts every lost true pair by cause. It showed that 12% of the missed matches were lost because the name was unusable: written in another script, a placeholder, or a social-media handle, while the address was identical. An address-evidence rerank path and house-number × street keys fixed that." },
      { t: "quote", x: "One iteration, +0.049 on the leaderboard. The model didn't change; what reached it did." },
      { t: "h2", x: "Decoys and a decoder" },
      { t: "ul", x: [
        "The data contains near-identical decoys at the same address: \"Program\" versus \"Program Co\". Raw name-variation features separate a different registered entity from formatting noise like \"& Co\" or \"(Services)\".",
        "The answer set per entity, including \"no match\", comes from one objective: maximise the expected F0.5 for that entity, rather than a fixed threshold.",
        "Validation is leakage-free: folds are grouped by entity, stage-two features are built from out-of-fold stage-one predictions, and every threshold is tuned out of fold.",
      ] },
      { t: "h2", x: "What I'd tell someone starting this" },
      { t: "p", x: "Measure where the errors come from before you add capacity. The biggest single jump came from a diagnostic, not a model change." },
    ],
  },
  {
    slug: "testing-the-tests-mutation-score",
    title: "Testing the tests: from 85.9% to 100% mutation score",
    dek: "Passing tests prove little. Mutation testing, seeded faults and load tests show whether a suite would actually catch a bug.",
    date: "2026-10-21",
    minutes: 5,
    tags: ["Testing", "Quality"],
    project: "hotel-reservation-vv",
    body: [
      { t: "p", x: "Most test suites answer one question: do the tests pass? For a verification and validation project I wanted to answer two more. Are the tests any good, and would anyone else get the same result?" },
      { t: "h2", x: "The system and the suite" },
      { t: "p", x: "I specified and built a hotel room reservation system (FastAPI, SQLite and plain JavaScript), then wrote 554 executable test cases, each carrying IEEE 829 metadata on the test itself. Every number in the report, the workbook and the dashboard is written by the real run, not typed by hand." },
      { t: "table", head: ["Check", "Result"], rows: [["Test cases", "554: 552 passed, 2 skipped (browsers unavailable in the lab), 0 failed"], ["Structural coverage", "867 / 867 statements, 255 / 256 branches"], ["Mutation score", "100% (267 of 267 non-equivalent mutants killed)"], ["Seeded faults", "12 of 12 detected"], ["Performance", "p95 149.6 ms at 25 concurrent users, 0% errors"]] },
      { t: "h2", x: "Mutation testing changed the suite" },
      { t: "p", x: "A purpose-built AST mutation engine changes the code in small ways (a < becomes <=, a constant changes, a branch flips) and checks whether any test fails. The first run killed 85.9% of mutants. Each survivor pointed at a behaviour no test pinned down. Three iterations later every non-equivalent mutant was killed." },
      { t: "h2", x: "Load testing found a real defect" },
      { t: "p", x: "Under 25 users the booking p95 was 663 ms against a 300 ms target. Tuning SQLite to write-ahead logging (WAL) brought it to about 201 ms, and the final run measured 149.6 ms." },
      { t: "h2", x: "Scaling the idea: TestHarness" },
      { t: "p", x: "TestHarness takes the same question to a Java stack: 540 JVM tests, 32 Vitest tests and a Gatling simulation against a container-terminal app with six switchable defects. Run three times, the fault-seeding experiment caught 6 of 6 bugs every time; the race-condition bug was caught by one test out of 151. Mutation testing took the domain rules from 95.1% to 100% across 143 mutants." },
      { t: "quote", x: "A suite earns trust when you can show which bug it would have caught." },
    ],
  },
  {
    slug: "five-agents-and-a-vote",
    title: "Five agents and a vote: designing an auditable fraud engine",
    dek: "Real fraud desks don't trust one classifier. Bulwark models the desk: five specialised agents, a weighted consensus, and a decision you can replay.",
    date: "2026-10-21",
    minutes: 5,
    tags: ["Agentic AI", "Fintech", "System design"],
    project: "bulwark",
    body: [
      { t: "p", x: "Most fraud demos ship a single model behind an endpoint. A real fraud desk layers defences: structural checks on the wire, a model, a rules engine with hard institutional knowledge, an analyst watching behaviour, and a team pulling threads across accounts. Bulwark gives each of those its own agent." },
      { t: "table", head: ["Agent", "Weight", "Looks at"], rows: [["Ingestion", "0.6", "Impossible amounts, currency mismatches, session freshness"], ["Risk scoring", "2.0", "A PyTorch tabular-attention model over five feature groups, with feature attribution"], ["Graph analysis", "1.2", "Shared devices, peer entities and 4-cycle mule patterns in the entity–device graph"], ["Behavioural", "1.0", "Deviation from baseline, velocity, country hops, first-time high-risk merchants"], ["Rule engine", "1.5", "Sanctions, structuring, card testing, ring reuse"]] },
      { t: "h2", x: "Consensus, not averaging" },
      { t: "p", x: "Each agent returns a score and its reasons. The consensus agent weighs them into one verdict with a confidence derived from how much the agents disagree, and an explanation agent turns the whole trace into a readable narrative. That last step is deterministic, with no language model in the loop, so the same transaction always produces the same explanation." },
      { t: "h2", x: "Fast enough to sit in the payment path" },
      { t: "p", x: "Every request to the scoring endpoint fans out to the five agents and returns in under 100 milliseconds. The test suite, 30 tests, runs in about two seconds, so regressions in any agent show up before a merge." },
      { t: "h2", x: "Why the analyst UI looks like a newspaper" },
      { t: "p", x: "The interface shows the reasoning, not just the score: which agent objected, how strongly, and why. An analyst who disagrees can see exactly where." },
    ],
  },
  {
    slug: "graph-retrieval-cut-tokens",
    title: "Graph retrieval cut our tokens by 68%",
    dek: "For multi-hop medical questions, vector search hands the model too much loosely related text. Traversing a knowledge graph first gave better answers for a third of the tokens.",
    date: "2026-10-21",
    minutes: 4,
    tags: ["GenAI", "RAG", "Graphs"],
    project: "medgraph-rag",
    body: [
      { t: "p", x: "A question like \"What drugs target the BRCA1 pathway and interact with cisplatin?\" needs several hops: genes to proteins to pathways to drugs to interactions. Vector retrieval returns chunks that look similar to the question, not the chain of facts that answers it." },
      { t: "p", x: "With teammates Nipun Dewangan and Juhi Hai, for TigerGraph's GraphRAG hackathon, we built a knowledge graph from more than two million tokens of biomedical literature, extracted genes, drugs, diseases, proteins and pathways, and let the graph do the multi-hop traversal before the language model sees anything." },
      { t: "table", head: ["", "LLM only", "Basic RAG", "GraphRAG"], rows: [["Tokens per query", "3,847", "2,134", "687"], ["Cost per query (GPT-4o-mini)", "$0.00231", "$0.00128", "$0.00041"], ["Latency", "4.2 s", "3.8 s", "1.9 s"], ["LLM-judge pass rate", "61%", "74%", "93%"], ["BERTScore F1 (rescaled)", "0.41", "0.49", "0.61"]] },
      { t: "p", x: "Against basic RAG that is 67.8% fewer tokens, half the latency, and 19 more points on the judge pass rate. We only accepted parameter settings that kept the pass rate at or above 90%." },
      { t: "quote", x: "Smaller, more precise prompts were cheaper and more accurate at the same time." },
    ],
  },
  {
    slug: "why-i-didnt-use-the-leaked-answers",
    title: "Why I didn't use the leaked answers",
    dek: "In Flipkart Gridlock 2.0 the leaderboard was inflated by leaked labels. My score is lower than it could have been, and I'd make the same call again.",
    date: "2026-10-21",
    minutes: 3,
    tags: ["Competitions", "Integrity"],
    project: "flipkart-gridlock",
    body: [
      { t: "p", x: "Flipkart Gridlock 2.0 asked for traffic-demand forecasts for Bengaluru. I built a LightGBM and XGBoost ensemble." },
      { t: "p", x: "Partway through, it became clear the public leaderboard was being inflated by leaked answers. Using them would have moved me up. I didn't. My best legitimate score was about 89.4, and that is the number I report." },
      { t: "h2", x: "The reasoning" },
      { t: "ul", x: [
        "A score I can't explain in an interview is a liability, not an achievement.",
        "Leaked labels teach you nothing about forecasting. The feature work did.",
        "The same habit runs through everything on this site: if the model scores 0.46 mAP, that's the number on the page.",
      ] },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
