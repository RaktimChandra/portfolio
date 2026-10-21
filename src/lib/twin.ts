/**
 * The AI twin's offline brain. It understands the common questions people ask about Raktim
 * (projects by technology, internships, papers, contact, education, hiring…) and composes a
 * specific answer from the structured content, instead of returning search snippets.
 * When an LLM is available the route uses it, with this engine's facts as grounding.
 */
import { profile } from "@/content/profile";
import { experience, freelance, type Experience } from "@/content/experience";
import { DOMAIN_LABEL, featured, projects, repoUrl, type Domain, type Project } from "@/content/projects";
import { awards, certifications, papers, research, services, skills } from "@/content/record";
import { extractive, retrieve } from "./knowledge";

export type Source = { title: string; href: string };
export type TwinAnswer = { answer: string; sources: Source[]; followups: string[]; projects?: string[]; intent: string };

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}+#.\s-]/gu, " ").replace(/\s+/g, " ").trim();
const has = (q: string, ...words: string[]) => words.some((w) => new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(q));
const list = (xs: string[], max = 6) => {
  const a = xs.slice(0, max);
  const more = xs.length - a.length;
  const body = a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;
  return more > 0 ? `${body}, plus ${more} more` : body;
};
const ym = (v: string | null) => {
  if (!v) return "present";
  const [y, m] = v.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
};
const metricLine = (p: Project) => (p.metrics?.length ? ` (${p.metrics.slice(0, 2).map((m) => `${m.label}: ${m.value}`).join(", ")})` : "");
const projSrc = (p: Project): Source => ({ title: p.title, href: `/work/${p.slug}` });

/* ---------- Vocabulary built from the content itself ---------- */
const ALIAS: Record<string, string[]> = {
  kafka: ["apache kafka"],
  "llm": ["llm agents", "phi-3-mini", "anthropic api", "gpt-4o-mini", "llm apis", "llama.cpp", "ollama"],
  rag: ["graphrag", "local rag", "rag"],
  react: ["react", "react native"],
  next: ["next.js", "next.js 14"],
  nextjs: ["next.js", "next.js 14"],
  node: ["node.js"],
  nodejs: ["node.js"],
  postgres: ["postgresql", "postgresql 16"],
  postgresql: ["postgresql", "postgresql 16"],
  spring: ["spring boot"],
  java: ["java", "java 21", "jdbc"],
  python: ["python", "fastapi", "pytorch"],
  pytorch: ["pytorch"],
  tensorflow: ["tensorflow", "keras"],
  blockchain: ["solidity", "ethereum", "halo2", "ezkl", "foundry"],
  solidity: ["solidity"],
  docker: ["docker", "docker compose", "testcontainers"],
  yolo: ["yolov8"],
  "computer vision": ["yolov8", "opencv", "mediapipe", "densenet-121", "resnet50", "paddleocr"],
  vision: ["yolov8", "opencv", "mediapipe", "densenet-121", "resnet50", "paddleocr"],
  nlp: ["bert", "gliner", "transformers"],
  testing: ["pytest", "selenium grid", "playwright", "rest assured", "cucumber", "pact", "gatling", "pit", "junit"],
  selenium: ["selenium grid"],
  fastapi: ["fastapi"],
  redis: ["redis", "redis streams"],
  graph: ["networkx", "neo4j", "tigergraph"],
  "c++": ["c++"],
  cpp: ["c++"],
  typescript: ["typescript"],
  mongodb: ["mongodb"],
  "zero knowledge": ["halo2", "ezkl"],
  zk: ["halo2", "ezkl"],
  onnx: ["onnx", "onnx runtime"],
  lightgbm: ["lightgbm"],
  xgboost: ["xgboost"],
};
const DOMAIN_WORDS: Record<string, Domain> = {
  agentic: "agentic", agent: "agentic", agents: "agentic",
  genai: "genai", "generative ai": "genai", rag: "genai",
  "machine learning": "ml", ml: "ml", "deep learning": "ml", "data science": "ml",
  "full stack": "fullstack", "full-stack": "fullstack", fullstack: "fullstack", web: "fullstack", backend: "fullstack", frontend: "fullstack",
  data: "data", analytics: "data", dashboard: "data",
  mlops: "mlops", devops: "mlops", "ci/cd": "mlops",
  testing: "qa", qa: "qa", sdet: "qa", "test automation": "qa",
  blockchain: "blockchain", web3: "blockchain", crypto: "blockchain",
  systems: "systems", distributed: "systems",
  security: "security", privacy: "security",
};

function techMatches(q: string) {
  const stackVocab = new Set(projects.flatMap((p) => p.stack.map((s) => s.toLowerCase())));
  const hits = new Set<string>();
  for (const s of stackVocab) if (s.length > 2 && has(q, s)) hits.add(s);
  for (const [k, v] of Object.entries(ALIAS)) if (has(q, k)) v.forEach((x) => hits.add(x));
  return [...hits];
}
function projectsUsing(techs: string[]) {
  return projects
    .map((p) => ({ p, n: p.stack.filter((s) => techs.includes(s.toLowerCase())).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || (a.p.featured ?? 99) - (b.p.featured ?? 99) || b.p.year - a.p.year)
    .map((x) => x.p);
}
const EVENT: [RegExp, string][] = [
  [/amazon|ml challenge|null pointers|entity resolution/, "business-entity-resolution"],
  [/codorra|surveillance/, "obscura"],
  [/guidewire|devtrails|gig worker/, "vortex-shield"],
  [/innovent|aircraft|aerospace|\bmro\b/, "aerosentinel"],
  [/tigergraph|graphrag|medical literature/, "medgraph-rag"],
  [/atomberg|atomquest/, "atomquest"],
  [/razorpay|buildathon/, "praman"],
  [/paytm|soundbox/, "vyapaar-chakra"],
  [/schneider|\bhmi\b|\bplc\b/, "pravah"],
  [/hushh|open source contribution/, "hushh-kai-adapter"],
  [/flipkart|gridlock/, "flipkart-gridlock"],
  [/rpc edulateral|clinical|clinic|fhir/, "clindocmicro"],
  [/fraud/, "bulwark"],
  [/zkml|zero.knowledge|credit scor/, "provenance"],
  [/\beeg\b|seizure|epilep/, "neurosentry"],
  [/brain tumou?r|\bmri\b|fisher/, "pinn-urop"],
  [/bajaj|bfhl/, "bfhl"],
  [/affordmed/, "affordmed"],
  [/tredence|pruning/, "self-pruning-nn"],
  [/\bet ai\b|energy|crude|tanker/, "setu"],
  [/container|terminal ops|port operations/, "portsync"],
  [/incident|triage/, "pulseops"],
  [/email schedul|reachinbox|outbox/, "mailflow"],
  [/dataforge|hebbian|pathway/, "dataforge"],
  [/upi offline|without internet|mesh/, "upi-offline-mesh"],
  [/vector database|hnsw/, "vectorengine"],
  [/packet|\bdpi\b/, "deep-packet-inspection"],
];
function findProject(q: string) {
  for (const [re, slug] of EVENT) if (re.test(q)) return projects.find((p) => p.slug === slug);
  const byTitle = [...projects].sort((a, b) => b.title.length - a.title.length).find((p) => {
    const t = p.title.toLowerCase();
    const short = t.split(/[\s:—-]/)[0];
    return has(q, t) || (short.length > 4 && has(q, short) && !["smart", "blockchain", "missing", "recipe", "deep", "chest", "food", "hospital", "fake", "job", "self", "business", "compiler", "distributed", "disease", "hotel", "vehicle", "age", "webpage", "sentiment", "cryptocurrency", "anti", "autonomous"].includes(short)) || has(q, p.slug.replace(/-/g, " "));
  });
  return byTitle;
}
function findOrg(q: string): Experience[] {
  return experience.filter((e) => {
    const words = e.org.toLowerCase().replace(/[().×]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !["virtual", "internship", "limited", "solutions", "development", "infrastructure"].includes(w));
    return words.some((w) => has(q, w));
  });
}

const MISSING = ["rust", "golang", "kotlin", "swift", "scala", "flutter", "angular", "vue", "ruby", "rails", "c#", ".net", "terraform", "snowflake", "tableau", "unity", "unreal", "sagemaker", "hadoop", "elixir", "haskell"];

/* ---------- Intents ---------- */
type Handler = { id: string; test: (q: string) => boolean; run: (q: string) => TwinAnswer | null };

const H: Handler[] = [
  {
    id: "greeting",
    test: (q) => /^(hi|hello|hey|yo|namaste|hola)\b/.test(q) && q.split(" ").length <= 3,
    run: () => ({
      intent: "greeting",
      answer: `Hi! I'm Raktim's portfolio assistant. Ask me about his projects, the technologies he's used, his internships, papers or how to work with him.`,
      sources: [],
      followups: ["What are his best projects?", "Is he open to full-time roles?", "What has he built with agents?"],
    }),
  },
  {
    id: "contact",
    test: (q) => has(q, "contact", "email", "e-mail", "mail id", "phone", "call him", "reach", "linkedin", "whatsapp", "get in touch"),
    run: () => ({
      intent: "contact",
      answer: `Email ${profile.email} or call ${profile.phone}. He's also on LinkedIn (${profile.linkedin}) and GitHub (${profile.github}). He's in Chennai, on IST (UTC+5:30).`,
      sources: [{ title: "Contact", href: "/contact" }],
      followups: ["Is he open to full-time roles?", "How does a freelance project work?"],
    }),
  },
  {
    id: "availability",
    test: (q) => has(q, "available", "availability", "open to", "hiring", "hire", "full time", "full-time", "job", "relocat", "notice", "join", "start date", "intern"),
    run: (q) => {
      if (has(q, "freelance", "project", "client", "contract")) return null;
      if (has(q, "internship", "interned", "interns") && !has(q, "hire", "available", "open")) return null;
      return {
        intent: "availability",
        answer: `Yes. ${profile.availability} He graduates from SRM in 2027 (B.Tech CSE, CGPA ${profile.education.cgpa}) and is looking at SDE, AI/ML, GenAI, MLOps and data roles. He has already done ${experience.length} internships and program roles, so he is used to shipping inside a team. The fastest way in is ${profile.email}.`,
        sources: [{ title: "Résumé", href: "/resume" }, { title: "Contact", href: "/contact" }],
        followups: ["Match him against my job description", "What internships has he done?", "What are his best projects?"],
      };
    },
  },
  {
    id: "freelance",
    test: (q) => has(q, "freelance", "client", "clients", "contract", "hire him for", "build for me", "my project", "my startup", "rate", "rates", "price", "pricing", "cost", "charge", "quote", "services"),
    run: () => ({
      intent: "freelance",
      answer: `He has run a freelance practice since 2024 with ${freelance.clients} clients: ${freelance.clientTypes.join(", ").toLowerCase()}. Typical work: ${list(freelance.kinds.map((k) => k.name.toLowerCase()))}. Typical timelines run from ${services.map((s) => s.timeline).sort()[0]} for small dashboards to around 10 weeks for full products. Pricing is quoted after a short call, either fixed or weekly. Client names stay private under contract. Try the project scoper for a rough plan.`,
      sources: [{ title: "Services", href: "/services" }, { title: "Project scoper", href: "/scope" }],
      followups: ["What AI products has he built?", "How do I contact him?"],
    }),
  },
  {
    id: "education",
    test: (q) => has(q, "cgpa", "gpa", "grade", "college", "university", "degree", "study", "studying", "education", "srm", "graduat", "backlog", "marks"),
    run: () => ({
      intent: "education",
      answer: `${profile.education.degree} at ${profile.education.school}, ${profile.education.dept}, class of 2027. CGPA ${profile.education.cgpa}. ${profile.education.note}`,
      sources: [{ title: "About", href: "/about" }],
      followups: ["What research has he done?", "What internships has he done?"],
    }),
  },
  {
    id: "research",
    test: (q) => has(q, "paper", "papers", "research", "publication", "published", "ieee", "igi", "urop", "journal", "conference"),
    run: () => ({
      intent: "research",
      answer: `Seven IEEE conference papers: three in 2025 (${papers.filter((p) => p.year === 2025).map((p) => p.title).join(", ")}) and four in 2026 (${papers.filter((p) => p.year === 2026).map((p) => p.title).join(", ")}), co-authored with ${research.coauthors}. He also has an ${research.igi.publisher} chapter in press and UROP research ${research.urop.id}: ${research.urop.title}.`,
      sources: [{ title: "Research", href: "/research" }],
      followups: ["Tell me about NeuroSentry", "What ML projects has he done?"],
    }),
  },
  {
    id: "awards",
    test: (q) => has(q, "award", "hackathon", "hackathons", "win", "won", "winner", "achievement", "achievements", "competition", "semifinal", "rank", "prize", "recognition"),
    run: () => {
      const top = awards.filter((a) => a.tier === 1);
      return {
        intent: "awards",
        answer: `Highlights: ${top.map((a) => (a.detail ? `${a.title} (${a.detail.replace(/\.$/, "")})` : a.title)).join("; ")}. Overall he has taken part in 40+ hackathons, mostly as team lead of VORTEXXX, including OBSCURA at Codorra 2026 (quarterfinalists) and Tata InnoVent-27.`,
        sources: [{ title: "Recognition", href: "/achievements" }],
        followups: ["Tell me about the Amazon ML Challenge", "What is OBSCURA?"],
      };
    },
  },
  {
    id: "certs",
    test: (q) => has(q, "certif", "certificate", "certified", "aws", "azure", "oracle", "oci", "databricks", "cisco", "fortinet", "badge"),
    run: (q) => {
      const ALIAS_ISSUER: Record<string, string> = { aws: "Amazon Web Services", amazon: "Amazon Web Services", azure: "Microsoft", microsoft: "Microsoft", oci: "Oracle", oracle: "Oracle", ibm: "IBM", google: "Google", databricks: "Databricks", sap: "SAP", cisco: "Cisco", fortinet: "Fortinet", hackerrank: "HackerRank", nptel: "NPTEL", meta: "Meta", postman: "Postman", github: "GitHub" };
      const issuers = [...new Set(Object.entries(ALIAS_ISSUER).filter(([k]) => has(q, k)).map(([, v]) => v))];
      const pick = issuers.length ? certifications.filter((c) => issuers.includes(c.issuer)) : certifications;
      return {
        intent: "certs",
        answer: issuers.length
          ? `From ${issuers.join(" and ")}: ${list(pick.map((c) => c.name), 10)}.`
          : `${certifications.length} completed certifications. Cloud: ${list(certifications.filter((c) => c.group === "Cloud").map((c) => `${c.name}`), 4)}. AI: ${list(certifications.filter((c) => c.group === "AI and ML").map((c) => `${c.issuer} ${c.name}`), 4)}. Also Google Data Analytics, Databricks, HackerRank Software Engineer and Fortinet NSE 4.`,
        sources: [{ title: "Certifications", href: "/certifications" }],
        followups: ["What cloud work has he done?", "What are his skills?"],
      };
    },
  },
  {
    id: "org",
    test: (q) => findOrg(q).length > 0,
    run: (q) => {
      const es = findOrg(q);
      return {
        intent: "org",
        answer: es
          .map((e) => `At ${e.org} he was ${/^[aeiou]/i.test(e.role) ? "an" : "a"} ${e.role} (${ym(e.start)} – ${ym(e.end)}, ${e.mode.toLowerCase()}${e.place ? `, ${e.place}` : ""}). ${e.points.join(" ")}${e.metrics?.some((m) => m.verified) ? ` Measured: ${e.metrics.filter((m) => m.verified).map((m) => `${m.value} ${m.label.toLowerCase()}`).join(", ")}.` : ""} Stack: ${e.stack.join(", ")}.`)
          .join("\n\n"),
        sources: [{ title: "Experience", href: "/experience" }],
        followups: ["What other internships has he done?", "What are his best projects?"],
      };
    },
  },
  {
    id: "missing-tech",
    test: (q) => MISSING.some((m) => has(q, m)),
    run: (q) => {
      const m = MISSING.find((x) => has(q, x))!;
      const name = m.replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        intent: "missing-tech",
        answer: `Honestly, ${name} isn't in anything he has shipped yet, so there's nothing to point to. Closest work: ${list(featured.slice(0, 3).map((p) => p.title))}. He picks up new stacks quickly; ask him directly at ${profile.email}.`,
        sources: [{ title: "Skills", href: "/skills" }],
        followups: ["What are his skills?", "What are his best projects?"],
      };
    },
  },
  {
    id: "tech",
    test: (q) => techMatches(q).length > 0 && projectsUsing(techMatches(q)).length > 0,
    run: (q) => {
      const t = techMatches(q);
      const ps = projectsUsing(t);
      const orig = [...new Set(ps.flatMap((p) => p.stack).filter((x) => t.includes(x.toLowerCase())))];
      const label = list(orig.slice(0, 3));
      const roles = experience.filter((e) => e.stack.some((s) => t.includes(s.toLowerCase())));
      return {
        intent: "tech",
        answer: `${ps.length === 1 ? "One project uses" : `${ps.length} projects use`} ${label}. ${ps
          .slice(0, 4)
          .map((p) => `${p.title}: ${p.tagline.replace(/\.$/, "")}${metricLine(p)}.`)
          .join(" ")}${ps.length > 4 ? ` Also ${list(ps.slice(4).map((p) => p.title), 5)}.` : ""}${roles.length ? ` He has also used it at work, at ${list(roles.map((r) => `${r.org}`))}.` : ""}`,
        sources: ps.slice(0, 4).map(projSrc),
        projects: ps.slice(0, 4).map((p) => p.slug),
        followups: [`Tell me more about ${ps[0].title}`, "What are his best projects?"],
      };
    },
  },
  {
    id: "domain",
    test: (q) => Object.keys(DOMAIN_WORDS).some((w) => has(q, w)),
    run: (q) => {
      const d = DOMAIN_WORDS[Object.keys(DOMAIN_WORDS).sort((a, b) => b.length - a.length).find((w) => has(q, w))!];
      const ps = projects.filter((p) => p.domains.includes(d)).sort((a, b) => (a.featured ?? 99) - (b.featured ?? 99) || (b.metrics?.length ?? 0) - (a.metrics?.length ?? 0));
      return {
        intent: "domain",
        answer: `${ps.length} projects in ${DOMAIN_LABEL[d]}. The strongest: ${ps
          .slice(0, 4)
          .map((p) => `${p.title}, ${p.tagline.charAt(0).toLowerCase() + p.tagline.slice(1).replace(/\.$/, "")}${metricLine(p)}`)
          .join("; ")}.`,
        sources: ps.slice(0, 4).map(projSrc),
        projects: ps.slice(0, 4).map((p) => p.slug),
        followups: [`Tell me more about ${ps[0].title}`, "Which projects have live demos?"],
      };
    },
  },
  {
    id: "experience",
    test: (q) => has(q, "experience", "internship", "internships", "interned", "worked at", "work history", "companies", "company", "roles", "career"),
    run: () => ({
      intent: "experience",
      answer: `${experience.length} internships and program roles since February 2025, plus freelance work since 2024 (${freelance.clients} clients). Most recent first: ${experience
        .slice(0, 7)
        .map((e) => `${e.role} at ${e.org} (${ym(e.start)})`)
        .join("; ")}; and earlier roles at ${list(experience.slice(7).map((e) => e.org))}.`,
      sources: [{ title: "Experience", href: "/experience" }],
      followups: ["What did he do at Bluestock Fintech?", "What did he do at Shristi?"],
    }),
  },
  {
    id: "project",
    test: (q) => !!findProject(q),
    run: (q) => {
      const p = findProject(q)!;
      const links = [repoUrl(p) ? `Code: ${repoUrl(p)}` : "The code is private", p.demo ? `live demo: ${p.demo}` : ""].filter(Boolean).join(", ");
      return {
        intent: "project",
        answer: `${p.title} (${p.year}): ${p.tagline} ${p.summary}${p.approach?.length ? ` How it works: ${p.approach.slice(0, 2).join(" ")}` : ""}${p.metrics?.length ? ` Measured: ${p.metrics.map((m) => `${m.label} ${m.value}`).join("; ")}.` : ""}${p.context ? ` ${p.context}` : ""} Built with ${list(p.stack, 8)}. ${links}.`,
        sources: [projSrc(p)],
        projects: [p.slug],
        followups: [`What else uses ${p.stack[0]}?`, "What are his best projects?"],
      };
    },
  },
  {
    id: "best",
    test: (q) => has(q, "best", "top", "flagship", "favourite", "favorite", "proudest", "impressive", "strongest", "featured", "projects", "portfolio", "built", "what has he"),
    run: (q) => {
      if (has(q, "demo", "live", "deployed")) {
        const ps = projects.filter((p) => p.demo);
        return {
          intent: "demos",
          answer: `${ps.length} projects are live: ${ps.map((p) => `${p.title} (${p.demo})`).join("; ")}.`,
          sources: [{ title: "Status", href: "/status" }],
          followups: ["What are his best projects?"],
        };
      }
      const ps = featured.slice(0, 5);
      return {
        intent: "best",
        answer: `The five he'd show first: ${ps.map((p) => `${p.title}, ${p.tagline.charAt(0).toLowerCase() + p.tagline.slice(1).replace(/\.$/, "")}${metricLine(p)}`).join("; ")}. Across the site there are ${projects.length} projects.`,
        sources: ps.map(projSrc),
        projects: ps.map((p) => p.slug),
        followups: [`Tell me more about ${ps[0].title}`, "Which projects have live demos?", "What has he built with agents?"],
      };
    },
  },
  {
    id: "skills",
    test: (q) => has(q, "skill", "skills", "stack", "tech stack", "technologies", "languages", "language", "tools", "framework", "frameworks", "know"),
    run: () => ({
      intent: "skills",
      answer: `Strongest areas: agentic AI and RAG, machine learning (PyTorch, scikit-learn, LightGBM, computer vision), and full-stack (Next.js, React, Node.js, FastAPI, Spring Boot) with PostgreSQL, Redis and Kafka. Languages: ${skills["Languages"].join(", ")}. He also does testing seriously (pytest, Playwright, Selenium, Pact, Gatling, mutation testing) and deploys on AWS, Azure, Vercel and Render.`,
      sources: [{ title: "Skills", href: "/skills" }],
      followups: ["What has he built with Kafka?", "What ML projects has he done?"],
    }),
  },
  {
    id: "about",
    test: (q) => has(q, "who is", "who's", "about him", "about raktim", "tell me about", "introduce", "summary", "background", "where is he", "where does he", "based", "from", "location", "hobby", "hobbies", "football", "free time", "fun"),
    run: (q) => {
      if (has(q, "hobby", "hobbies", "football", "free time", "fun", "sport")) {
        return { intent: "hobbies", answer: `Football first: Messi and Argentina, always. Then the gym, swimming and basketball. (Try the Konami code on this site for a keepy-uppy game.)`, sources: [{ title: "About", href: "/about" }], followups: ["What are his best projects?"] };
      }
      return {
        intent: "about",
        answer: `Raktim Chandra is an ${profile.role} in his final year of B.Tech CSE at SRM, Chennai (CGPA ${profile.education.cgpa}), originally from West Bengal. He builds AI agents that ship, and the full stack around them. He has done ${experience.length} internships and program roles, worked with ${freelance.clients} freelance clients since 2024, published 7 IEEE papers and led team VORTEXXX through 40+ hackathons. ${profile.availability}`,
        sources: [{ title: "About", href: "/about" }],
        followups: ["What are his best projects?", "What internships has he done?", "How do I contact him?"],
      };
    },
  },
];

export function answer(raw: string): TwinAnswer {
  const q = norm(raw);
  for (const h of H) {
    if (!h.test(q)) continue;
    const r = h.run(q);
    if (r) return r;
  }
  const docs = retrieve(raw, 6);
  return {
    intent: "search",
    answer: extractive(raw, docs),
    sources: docs.slice(0, 3).map((d) => ({ title: d.title, href: d.href })),
    followups: ["What are his best projects?", "What internships has he done?", "How do I contact him?"],
  };
}

/** Facts handed to the LLM: the intent answer plus retrieved passages. */
export function grounding(raw: string) {
  const a = answer(raw);
  const docs = retrieve(raw, 8);
  const ctx = [`[A] Structured answer: ${a.answer}`, ...docs.map((d, i) => `[${i + 1}] ${d.title}\n${d.text}`)].join("\n\n");
  return { base: a, ctx, docs };
}
