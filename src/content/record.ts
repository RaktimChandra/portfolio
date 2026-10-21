/** Research, recognition, certifications, services, skills and the owner-editable link registry. */

/* ---------- Links the owner fills in. Empty string = shown as plain text, never a dead link. ---------- */
export const links = {
  resumePdf: "/resume.pdf",
  igiPublication: "",
  ieee: {
    AutoGenAI: "",
    VitalMind: "",
    JobPortal: "",
    FakeNews: "",
    Vortex: "",
    ChainGuard: "",
    CryptoPrediction: "",
  } as Record<string, string>,
  platforms: {
    LeetCode: "",
    HackerRank: "",
    CodeChef: "",
    GeeksforGeeks: "",
    HackerEarth: "",
    Kaggle: "",
    HuggingFace: "https://huggingface.co/RaktimChandra",
  } as Record<string, string>,
  calendly: "",
  /** Abstracts for the paper pages, keyed like `ieee`. Empty = "abstract to follow". */
  abstracts: {} as Record<string, string>,
  cert: {} as Record<string, string>,
};

/* ---------- Research ---------- */
export type Paper = { key: string; title: string; venue: string; year: number; area: string };
export const papers: Paper[] = [
  { key: "AutoGenAI", title: "AutoGenAI", venue: "IEEE conference", year: 2026, area: "Agentic and generative AI" },
  { key: "VitalMind", title: "VitalMind", venue: "IEEE conference", year: 2026, area: "AI for health" },
  { key: "Vortex", title: "Vortex", venue: "IEEE conference", year: 2026, area: "Applied machine learning" },
  { key: "ChainGuard", title: "ChainGuard", venue: "IEEE conference", year: 2026, area: "Blockchain security" },
  { key: "JobPortal", title: "Job Portal", venue: "IEEE conference", year: 2025, area: "Web systems" },
  { key: "FakeNews", title: "Fake News Detection", venue: "IEEE conference", year: 2025, area: "Natural language processing" },
  { key: "CryptoPrediction", title: "Cryptocurrency Price Prediction", venue: "IEEE conference", year: 2025, area: "Deep learning for time series" },
];
export const research = {
  coauthors: "Kaviyaraj R, Juhi Hai",
  igi: { title: "Book chapter", publisher: "IGI Global", note: "Title to be announced on publication." },
  urop: { id: "UR2526CI302", title: "Physics-informed neural networks with the Fisher-KPP equation for brain-tumour MRI classification", dept: "with Juhi Hai, under Dr. Mohammad Ishtiyaq Qureshi, SRMIST" },
};

/* ---------- Recognition ---------- */
export type Award = { title: string; detail: string; year: string; tier: 1 | 2 | 3 };
export const awards: Award[] = [
  { title: "2× National Hackathon Winner", detail: "", year: "2025–26", tier: 1 },
  { title: "EY Techathon 6.0, semifinalist", detail: "From more than 1.8 lakh registrations.", year: "2026", tier: 1 },
  { title: "Guidewire DevTrails, semifinalist", detail: "VORTEX Shield, parametric insurance for gig workers.", year: "2026", tier: 1 },
  { title: "Amazon ML Challenge 2026", detail: "Team Null Pointers reached the code-submission round. Macro F0.5 0.9628 on the public board.", year: "2026", tier: 1 },
  { title: "OBSCURA at Codorra 2026, quarterfinalists", detail: "Led a team of four.", year: "2026", tier: 2 },
  { title: "Team lead, VORTEXXX", detail: "Schneider HMI, Yuva Yodha, Sankalp, Paytm Innovation Challenge, Digital Twin, Eurogrip TORQ, DataForge.", year: "2025–26", tier: 2 },
  { title: "Tata InnoVent-27", detail: "AeroSentinel, offline agentic inspection for aircraft maintenance.", year: "2026", tier: 2 },
  { title: "Razorpay AI Buildathon", detail: "Participant.", year: "2026", tier: 3 },
  { title: "40+ hackathons", detail: "Across AI, fintech, health and infrastructure themes.", year: "2024–26", tier: 2 },
  { title: "Open source", detail: "Merged contributions including Hushh PR #784 (1344/1344 checks green), plus fixes and docs across other projects.", year: "2026", tier: 3 },
  { title: "SRMIST Disciplinary Committee", detail: "Former member.", year: "2024–25", tier: 3 },
];

/* ---------- Certifications ---------- */
export type Cert = { name: string; issuer: string; group: string };
export const certifications: Cert[] = [
  { name: "AWS Certified Cloud Practitioner (CLF-C02)", issuer: "Amazon Web Services", group: "Cloud" },
  { name: "Azure Fundamentals (AZ-900)", issuer: "Microsoft", group: "Cloud" },
  { name: "OCI Generative AI Professional", issuer: "Oracle", group: "Cloud" },
  { name: "OCI AI Foundations Associate", issuer: "Oracle", group: "Cloud" },
  { name: "OCI Data Platform Foundations", issuer: "Oracle", group: "Cloud" },
  { name: "Fusion Cloud ERP and SCM Essentials", issuer: "Oracle", group: "Cloud" },
  { name: "Agentic AI", issuer: "IBM", group: "AI and ML" },
  { name: "Retrieval-Augmented Generation", issuer: "IBM", group: "AI and ML" },
  { name: "Multimodal Generative AI", issuer: "IBM", group: "AI and ML" },
  { name: "Prompt Engineering", issuer: "Microsoft", group: "AI and ML" },
  { name: "Generative AI Developer", issuer: "SAP", group: "AI and ML" },
  { name: "Applied Accelerated AI", issuer: "NPTEL", group: "AI and ML" },
  { name: "Introduction to Machine Learning", issuer: "NPTEL", group: "AI and ML" },
  { name: "Data Analytics Professional Certificate", issuer: "Google", group: "Data" },
  { name: "Lakehouse Fundamentals", issuer: "Databricks", group: "Data" },
  { name: "Data Engineering Foundations", issuer: "Databricks", group: "Data" },
  { name: "Data Analyst (SAP HANA)", issuer: "SAP", group: "Data" },
  { name: "Databases for Back-End Development", issuer: "Meta", group: "Data" },
  { name: "DBMS", issuer: "Scaler", group: "Data" },
  { name: "SQL (Advanced)", issuer: "HackerRank", group: "Data" },
  { name: "Software Engineer", issuer: "HackerRank", group: "Development" },
  { name: "Problem Solving", issuer: "HackerRank", group: "Development" },
  { name: "Python", issuer: "HackerRank", group: "Development" },
  { name: "Programming in Java", issuer: "NPTEL", group: "Development" },
  { name: "Backend Developer (ABAP Cloud)", issuer: "SAP", group: "Development" },
  { name: "Postman API Student Expert", issuer: "Postman", group: "Development" },
  { name: "GitHub Foundations", issuer: "GitHub", group: "Development" },
  { name: "Python Essentials", issuer: "Cisco", group: "Development" },
  { name: "IT Automation with Python", issuer: "Google", group: "Development" },
  { name: "Introduction to Cybersecurity", issuer: "Cisco", group: "Networking and security" },
  { name: "Networking Basics", issuer: "Cisco", group: "Networking and security" },
  { name: "Introduction to Data Science", issuer: "Cisco", group: "Networking and security" },
  { name: "NSE 4, FortiOS 7.6", issuer: "Fortinet", group: "Networking and security" },
  { name: "Operating Systems and You", issuer: "Google", group: "Networking and security" },
];

/* ---------- Services (for clients) ---------- */
export type Service = { name: string; line: string; includes: string[]; timeline: string };
export const services: Service[] = [
  {
    name: "AI agents and copilots",
    line: "Agents that use your tools, follow your rules and show their work.",
    includes: ["Tool-using agents and multi-agent workflows", "Guardrails, audit trails and human sign-off", "Evaluation sets so quality is measured, not hoped for"],
    timeline: "2–6 weeks",
  },
  {
    name: "RAG and knowledge assistants",
    line: "Answers grounded in your documents, with citations.",
    includes: ["Vector or graph retrieval", "Offline or private deployment when data cannot leave", "Cost and latency tuning"],
    timeline: "2–4 weeks",
  },
  {
    name: "Machine learning models",
    line: "Prediction, classification, vision and forecasting that hold up on real data.",
    includes: ["Data cleaning and feature work", "Training, validation and honest error analysis", "Serving with FastAPI or ONNX, plus monitoring"],
    timeline: "3–8 weeks",
  },
  {
    name: "Full-stack products",
    line: "Web apps, dashboards and APIs, from first screen to production.",
    includes: ["Next.js, React, Node.js or Python backends", "Auth, payments, admin panels", "CI/CD, tests and deployment"],
    timeline: "3–10 weeks",
  },
  {
    name: "Data and dashboards",
    line: "Clean pipelines and reports people actually read.",
    includes: ["SQL modelling and ETL", "Power BI or custom dashboards", "KPI definitions agreed with your team"],
    timeline: "1–4 weeks",
  },
  {
    name: "Testing and QA automation",
    line: "Test suites that catch real defects, with the numbers to prove it.",
    includes: ["API, UI, contract and load tests", "Mutation testing and coverage gates", "CI pipelines with quality dashboards"],
    timeline: "2–6 weeks",
  },
];

export const process = [
  { step: "Call", body: "Thirty minutes on the problem, the users and what done looks like." },
  { step: "Scope", body: "A written plan with milestones, a fixed quote or a weekly rate, and what is out of scope." },
  { step: "Build", body: "Weekly demos on a live preview link. You see progress, not status reports." },
  { step: "Ship", body: "Deployment, handover documents, and a support window after launch." },
];

/* ---------- Skills taxonomy (also used by the JD matcher) ---------- */
export const skills: Record<string, string[]> = {
  "Agentic AI and GenAI": ["LLM agents", "Multi-agent systems", "Tool calling", "RAG", "GraphRAG", "LangChain", "LlamaIndex", "Prompt engineering", "Evaluation", "Phi-3", "llama.cpp", "Ollama", "OpenAI API", "Anthropic API", "Hugging Face"],
  "Machine learning": ["PyTorch", "TensorFlow", "Keras", "scikit-learn", "LightGBM", "XGBoost", "Computer vision", "YOLOv8", "OpenCV", "NLP", "BERT", "GLiNER", "PINNs", "Time series", "SHAP"],
  MLOps: ["ONNX Runtime", "FastAPI serving", "Docker", "MLflow", "Prometheus", "GitHub Actions", "Model monitoring"],
  "Languages": ["Python", "TypeScript", "JavaScript", "Java", "C++", "SQL", "Solidity", "C", "PHP", "Bash"],
  "Web and backend": ["Next.js", "React", "Node.js", "Express", "Spring Boot", "Tailwind CSS", "REST", "WebSocket", "JWT", "Expo"],
  "Data": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Neo4j", "TigerGraph", "ChromaDB", "pgvector", "Kafka", "pandas", "Power BI", "Databricks"],
  "Cloud and DevOps": ["AWS", "Azure", "Oracle Cloud", "Vercel", "Render", "Linux", "Nginx", "CI/CD", "Kubernetes basics"],
  "Testing": ["pytest", "JUnit", "Selenium", "Playwright", "REST Assured", "Cucumber", "Pact", "Gatling", "Locust", "Mutation testing"],
  "Blockchain and security": ["Ethereum", "Foundry", "Halo2 / EZKL", "Differential privacy", "Threshold cryptography", "OWASP"],
};

export const uses = {
  Daily: ["VS Code and Cursor", "Windows with WSL2 Ubuntu", "Git and GitHub CLI", "Docker Desktop", "Postman"],
  "AI tooling": ["Claude", "Ollama for local models", "Hugging Face Hub", "Jupyter and Colab"],
  Deploy: ["Vercel for front ends", "Render for APIs", "GitHub Actions for CI"],
  Design: ["Figma", "Canva", "Excalidraw for architecture sketches"],
};

export const now = {
  updated: "October 2026",
  items: [
    "Final year of B.Tech at SRM, semester seven.",
    "Building verification-first systems: TestHarness, CIForge and PortSync.",
    "UROP research: physics-informed networks for brain-tumour MRI.",
    "Taking a small number of freelance AI and full-stack projects.",
    "Open to full-time SDE, AI/ML and GenAI roles starting 2027.",
  ],
};
