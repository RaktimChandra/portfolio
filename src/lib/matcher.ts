import { skills } from "@/content/record";
import { projects, type Project } from "@/content/projects";

const ALIASES: Record<string, string[]> = {
  "Machine learning": ["machine learning", "ml engineer", "ml models"],
  "LLM agents": ["llm", "large language model", "agentic", "ai agent", "agents"],
  RAG: ["retrieval augmented", "retrieval-augmented", "rag"],
  "Prompt engineering": ["prompt"],
  "Computer vision": ["computer vision", "image recognition", "object detection"],
  NLP: ["nlp", "natural language"],
  "Time series": ["forecasting", "time series", "time-series"],
  "Node.js": ["node", "nodejs", "node.js"],
  "Next.js": ["next.js", "nextjs"],
  TypeScript: ["typescript", " ts "],
  JavaScript: ["javascript", " js "],
  PostgreSQL: ["postgres", "postgresql"],
  "CI/CD": ["ci/cd", "continuous integration", "github actions", "jenkins", "pipelines"],
  AWS: ["aws", "amazon web services", "ec2", "s3", "lambda"],
  Azure: ["azure"],
  Docker: ["docker", "containers", "containerization"],
  "Kubernetes basics": ["kubernetes", "k8s"],
  REST: ["rest", "restful", "api design", "apis"],
  "Power BI": ["power bi", "powerbi", "bi dashboards"],
  pandas: ["pandas", "numpy", "data analysis"],
  SQL: ["sql"],
  "Mutation testing": ["mutation"],
  Selenium: ["selenium", "ui automation"],
  Playwright: ["playwright", "e2e"],
  "Differential privacy": ["privacy"],
  Ethereum: ["ethereum", "web3", "smart contract", "blockchain"],
  "Hugging Face": ["hugging face", "huggingface", "transformers"],
  MLflow: ["mlflow", "mlops", "model registry"],
};

const OTHER = ["Go", "Golang", "Rust", "Kotlin", "Swift", "Scala", "Spark", "Airflow", "Terraform", "GCP", "Google Cloud", "Snowflake", "dbt", "Tableau", "Angular", "Vue", "Django", "Ruby", "Rails", "C#", ".NET", "Elasticsearch", "GraphQL", "Flutter", "Hadoop", "SageMaker", "Vertex AI", "Kafka Streams", "Salesforce", "SAP"];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text: string, term: string) => {
  const t = term.trim().toLowerCase();
  if (!t) return false;
  return new RegExp(`(^|[^a-z0-9+#])${esc(t)}($|[^a-z0-9+#])`, "i").test(text);
};

export function match(jd: string) {
  const text = ` ${jd.toLowerCase()} `;
  const all = Object.values(skills).flat();
  const matched = all.filter((s) => has(text, s) || (ALIASES[s] ?? []).some((a) => text.includes(a)));
  const missing = OTHER.filter((o) => has(text, o) && !all.some((s) => s.toLowerCase() === o.toLowerCase()));
  const denom = matched.length + missing.length;
  const score = denom ? Math.round((matched.length / denom) * 100) : 0;

  const mset = matched.map((m) => m.toLowerCase());
  const ranked = projects
    .filter((p) => !p.private || p.metrics?.length)
    .map((p) => {
      const words = [...p.stack, ...p.domains, p.title, p.tagline].join(" ").toLowerCase();
      let s = mset.reduce((n, m) => n + (words.includes(m.split(" ")[0]) ? 1 : 0), 0);
      if (p.featured) s += 0.5;
      if (p.metrics?.length) s += 0.3;
      return { p, s };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, 5)
    .map((x) => x.p as Project);

  const firstLine = jd.split("\n").map((l) => l.trim()).find((l) => l.length > 3 && l.length < 90) ?? "";
  return { matched, missing, score, projects: ranked, role: firstLine };
}
