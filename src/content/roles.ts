import { getProject, type Project } from "./projects";
import { profile } from "./profile";

/**
 * Résumé versions by role. Each only re-orders and filters the real record: which projects lead,
 * which skills are highlighted, and a summary line built from facts already on the site.
 */
export type RoleCV = { slug: string; title: string; summary: string; projects: string[]; skills: string[] };

const base = `B.Tech CSE (Software Engineering), SRMIST, ${profile.education.years.split(" – ")[1]}, CGPA ${profile.education.cgpa}. ${profile.numbers.internships} internships and program roles, ${profile.numbers.clients} freelance clients, ${profile.numbers.papers} IEEE papers.`;

export const roleCVs: RoleCV[] = [
  {
    slug: "sde",
    title: "Software engineer",
    summary: `Software engineer who ships complete systems: APIs, web and mobile frontends, event streams, tests and CI. ${base}`,
    projects: ["bulwark", "portsync", "genesis", "codity-job-scheduler", "testharness", "vectorengine"],
    skills: ["TypeScript", "Java", "Python", "C++", "Next.js", "React", "Node.js", "Spring Boot", "PostgreSQL", "Redis", "Kafka", "REST", "WebSocket", "Docker", "CI/CD"],
  },
  {
    slug: "ai-ml",
    title: "AI / ML engineer",
    summary: `AI and ML engineer focused on agentic systems that run under real constraints: offline, explainable, measured. ${base}`,
    projects: ["clindocmicro", "bulwark", "marginalia", "business-entity-resolution", "medgraph-rag", "aerosentinel"],
    skills: ["LLM agents", "Multi-agent systems", "RAG", "GraphRAG", "Evaluation", "PyTorch", "LightGBM", "Computer vision", "NLP", "GLiNER", "llama.cpp", "Ollama", "ONNX Runtime", "FastAPI serving", "MLflow"],
  },
  {
    slug: "data",
    title: "Data scientist / analyst",
    summary: `Data scientist who takes messy, multilingual, large data to a measured result, then explains it. ${base}`,
    projects: ["business-entity-resolution", "medgraph-rag", "neurosentry", "self-pruning-nn", "fake-news-detection", "bulwark"],
    skills: ["Python", "SQL", "pandas", "LightGBM", "XGBoost", "scikit-learn", "SHAP", "Time series", "PostgreSQL", "Neo4j", "Power BI", "Databricks", "PyTorch"],
  },
  {
    slug: "qa",
    title: "QA / SDET",
    summary: `Test engineer who builds the harness, not just the tests: eight suite types, fault seeding to prove which suite catches what, and a live quality dashboard from CI. ${base}`,
    projects: ["testharness", "hotel-reservation-vv", "ciforge", "lumen", "portsync", "bulwark"],
    skills: ["Playwright", "Selenium", "pytest", "JUnit", "REST Assured", "Cucumber", "Pact", "Gatling", "Locust", "Mutation testing", "GitHub Actions", "CI/CD", "Docker", "Java", "TypeScript"],
  },
];

export const getRoleCV = (slug: string) => roleCVs.find((r) => r.slug === slug);
export const roleProjects = (r: RoleCV) => r.projects.map(getProject).filter(Boolean) as Project[];
