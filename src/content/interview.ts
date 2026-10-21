/**
 * Common interview questions, answered in STAR form (situation, task, action, result) with
 * stories taken from Raktim's real projects. Every number here appears in the project's own repo.
 */
export type QA = { id: string; q: string; tags: string[]; match: RegExp; star?: { s: string; t: string; a: string; r: string }; a: string; links: { title: string; href: string }[] };

export const interview: QA[] = [
  {
    id: "intro",
    q: "Tell me about yourself.",
    tags: ["opener"],
    match: /tell me about yourself|introduce yourself|walk me through your (background|resume)/,
    a: "Raktim is a final-year CSE student at SRM, Chennai (CGPA 8.92), who builds AI agents that ship and the full stack around them. Since 2024 he has run a freelance practice with 17+ clients, done 11 internships and program roles from Java backends to Azure and fintech dashboards, published 7 IEEE papers, and led team VORTEXXX through 40+ hackathons. His recent work is verification-first: Bulwark, a five-agent fraud platform that decides in under 100 ms, and TestHarness, a test framework that measures which suite catches which defect.",
    links: [{ title: "About", href: "/about" }, { title: "Bulwark", href: "/work/bulwark" }],
  },
  {
    id: "hardest",
    q: "What's the hardest technical problem you've solved?",
    tags: ["technical"],
    match: /hardest|most difficult|toughest|challenging (problem|project)|complex problem/,
    star: {
      s: "Amazon ML Challenge 2026: link 1.7 million business records to their duplicates in a pool of 10M+ noisy records, many in Devanagari, Bengali and Tamil, on CPU only.",
      t: "Raise the macro F0.5 without blowing up the number of candidate pairs.",
      a: "He wrote a diagnostic that sorted every lost true match by cause. It showed 12% were lost because the name was unusable (another script, a placeholder, a social handle) even when the address was identical. He added an address-evidence rerank path and house-number × street blocking keys.",
      r: "+0.049 on the leaderboard in one iteration. Final public score 0.9628, blocking recall 95.59%, precision 0.995, with about 6 candidates per entity.",
    },
    a: "",
    links: [{ title: "Business Entity Resolution", href: "/work/business-entity-resolution" }],
  },
  {
    id: "proud",
    q: "Which project are you proudest of, and why?",
    tags: ["projects"],
    match: /proud|favou?rite project/,
    star: {
      s: "Rural clinics keep records on paper, have no reliable internet, and can't send patient data to a cloud API.",
      t: "Turn a photographed prescription into a structured record a hospital system can import, entirely offline.",
      a: "ClinDocMicro chains PaddleOCR, GLiNER entity extraction and Phi-3-mini through llama.cpp, then writes FHIR R4B. Low-confidence fields are flagged for a human. It ships as a self-contained zip with a pytest suite and CI.",
      r: "It runs on a 4 GB CPU laptop with no network, and was delivered as a company project for RPC Edulateral.",
    },
    a: "",
    links: [{ title: "ClinDocMicro", href: "/work/clindocmicro" }],
  },
  {
    id: "integrity",
    q: "Tell me about a time you had to make an ethical call.",
    tags: ["behavioural"],
    match: /ethic|integrity|honest|cheat|right thing|shortcut/,
    star: {
      s: "Flipkart Gridlock 2.0, a traffic-demand forecasting competition.",
      t: "Climb the leaderboard with a LightGBM and XGBoost ensemble.",
      a: "He noticed the public leaderboard was being inflated by leaked answers. He chose not to use them and kept tuning the legitimate model.",
      r: "His best legitimate score was about 89.4. He reports that number, not a leaked one, because a score you can't defend in an interview is worth nothing.",
    },
    a: "",
    links: [{ title: "Flipkart Gridlock 2.0", href: "/work/flipkart-gridlock" }],
  },
  {
    id: "leadership",
    q: "Describe a time you led a team.",
    tags: ["behavioural"],
    match: /leadership|led a team|lead a team|team lead|captain|in charge/,
    star: {
      s: "Codorra 2026, theme: mass surveillance versus public safety.",
      t: "As team lead of four, ship a working system in hackathon time that takes a clear position.",
      a: "The team built OBSCURA around five guarantees: anonymise faces at the edge, differential privacy on analytics, Shamir 2-of-3 key sharing for any identity unlock, a public SHA-256 audit chain and an adversarial auditor.",
      r: "Deployed on Render with a test suite; the team reached the quarterfinals. He has led VORTEXXX the same way in Schneider HMI, Yuva Yodha, Sankalp, Paytm and DataForge entries.",
    },
    a: "",
    links: [{ title: "OBSCURA", href: "/work/obscura" }, { title: "Recognition", href: "/achievements" }],
  },
  {
    id: "deadline",
    q: "Tell me about working under a tight deadline.",
    tags: ["behavioural"],
    match: /deadline|pressure|time constraint|tight time|short time/,
    star: {
      s: "AtomQuest Hackathon 2026 by Atomberg: replace spreadsheet-based goal setting with an enterprise portal.",
      t: "Build it alone, end to end, within the event.",
      a: "He scoped to three personas and one full lifecycle (cycles, approvals, weighted goal sheets, check-ins, audit), used Next.js Server Components to keep the client light, and enforced the rules on both client and server.",
      r: "A deployed portal with demo logins for every role, built solo in 30 hours.",
    },
    a: "",
    links: [{ title: "AtomQuest Portal", href: "/work/atomquest" }],
  },
  {
    id: "failure",
    q: "Tell me about a failure or a limitation you had to own.",
    tags: ["behavioural"],
    match: /fail|mistake|weakness|limitation|went wrong|didn.t work/,
    star: {
      s: "AeroSentinel, an offline inspector for aircraft maintenance, at Tata InnoVent-27.",
      t: "Detect cracks and corrosion on aircraft surfaces from a public dataset.",
      a: "Crack detection worked (mAP50 about 0.46). Corrosion did not reach a useful level with the data available. Instead of hiding it, he disclosed it as data-limited and kept the rest of the loop working: retrieval, severity check, work card and engineer sign-off, with a runnable training pipeline ready for better data.",
      r: "An honest system with 16 tests and a hash-chained audit ledger, and a clear next step instead of a staged demo.",
    },
    a: "",
    links: [{ title: "AeroSentinel", href: "/work/aerosentinel" }],
  },
  {
    id: "quality",
    q: "How do you make sure your code actually works?",
    tags: ["technical"],
    match: /code quality|test your code|make sure.*works|how do you test|reliab/,
    star: {
      s: "A Software Verification and Validation course project: a hotel reservation system.",
      t: "Show not just that tests pass, but that the tests are good.",
      a: "He wrote 554 test cases with IEEE 829 metadata, built an AST mutation engine and seeded 12 faults on purpose. Mutation testing drove the score from 85.9% to 100% over three iterations. A load test exposed a 663 ms booking p95, which WAL tuning brought to about 200 ms.",
      r: "867 of 867 statements covered, 100% mutation score, 12 of 12 seeded faults caught, p95 149.6 ms at 25 users. TestHarness takes the same idea further with 540 JVM tests.",
    },
    a: "",
    links: [{ title: "Hotel Reservation V&V", href: "/work/hotel-reservation-vv" }, { title: "TestHarness", href: "/work/testharness" }],
  },
  {
    id: "design",
    q: "Walk me through a system you designed.",
    tags: ["technical"],
    match: /system design|designed a system|architecture|design a system|scalab/,
    star: {
      s: "Fraud desks don't trust a single classifier, and regulators want every decision explained.",
      t: "Design a fraud platform that layers independent checks and stays fast.",
      a: "Bulwark sends each transaction to five agents: structural ingestion checks, a PyTorch tabular-attention model, a NetworkX graph walk for shared devices and mule rings, a behavioural baseline, and a rules engine. A weighted consensus layer arbitrates and records the full reasoning.",
      r: "Decisions in under 100 ms, every one reproducible, with a 30-test suite that runs in about two seconds.",
    },
    a: "",
    links: [{ title: "Bulwark", href: "/work/bulwark" }],
  },
  {
    id: "team",
    q: "How do you work in a team?",
    tags: ["behavioural"],
    match: /team ?work|work in a team|collaborat|conflict|disagree/,
    a: "Most of his work is in teams: Null Pointers for the Amazon ML Challenge, VORTEXXX across hackathons, co-authors Kaviyaraj R and Juhi Hai on seven IEEE papers, and hybrid or on-site teams at HCDS Techh, TechCorp and Shristi. At HCDS he worked through code reviews and design discussions with product, QA and DevOps.",
    links: [{ title: "Experience", href: "/experience" }],
  },
  {
    id: "why",
    q: "Why should we hire you?",
    tags: ["closer"],
    match: /why should we hire|why (hire|you)|what makes you different|stand out/,
    a: "Because he ships complete, measured systems, not notebooks: agents with audit trails (Bulwark, AeroSentinel), ML that holds up on 10M+ noisy records (0.9628 F0.5), and test suites that prove their own value (100% mutation score). He has already worked in 11 teams and for 17+ freelance clients, so he knows how to scope, deliver and hand over. And he reports honest numbers, including the ones that didn't work.",
    links: [{ title: "Résumé", href: "/resume" }, { title: "Match against your job description", href: "/match" }],
  },
  {
    id: "future",
    q: "Where do you want to grow next?",
    tags: ["closer"],
    match: /five years|5 years|future|grow|career goal|next step|ambition/,
    a: "Toward agentic AI systems that are safe to run in production: permissions, budgets, traces and rollback (the ideas in AgentOS), plus the MLOps to keep models honest after launch. He is open to full-time SDE, AI/ML, GenAI and MLOps roles from 2027.",
    links: [{ title: "AgentOS", href: "/work/agentos" }],
  },
];

export const starText = (x: QA) => (x.star ? `Situation: ${x.star.s} Task: ${x.star.t} Action: ${x.star.a} Result: ${x.star.r}` : x.a);
