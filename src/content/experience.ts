export type Experience = {
  id: string;
  org: string;
  role: string;
  start: string; // YYYY-MM
  end: string | null; // null = ongoing
  mode: "Remote" | "Hybrid" | "On-site";
  place?: string;
  kind: "internship" | "freelance" | "program";
  summary: string;
  points: string[];
  stack: string[];
  metrics?: { label: string; value: string; verified: boolean }[];
};

export const experience: Experience[] = [
  {
    id: "shristi-sde",
    org: "Shristi Infrastructure Development Ltd.",
    role: "Software Development Engineer Intern",
    start: "2026-06",
    end: "2026-08",
    mode: "Remote",
    place: "Kolkata",
    kind: "internship",
    summary: "Returned for a three-month engineering internship after the winter IT internship, converted from hybrid to remote.",
    points: [
      "Built internal tooling around the company's Farvision ERP workflows for project, CRM and finance teams.",
      "Automated recurring reports and data hand-offs between ERP modules and spreadsheets.",
      "Worked directly with business users to turn requests into small, shippable features.",
    ],
    stack: ["Python", "SQL", "Farvision ERP", "Excel automation", "REST APIs"],
  },
  {
    id: "brightforge",
    org: "Brightforge Labs",
    role: "Business Analyst Intern",
    start: "2026-02",
    end: "2026-04",
    mode: "Remote",
    kind: "internship",
    summary: "Requirements, analysis and reporting for product and client work.",
    points: [
      "Gathered requirements from stakeholders and wrote them up as user stories and acceptance criteria.",
      "Built dashboards and analyses in SQL and spreadsheets to answer product questions.",
      "Bridged business and engineering teams during delivery.",
    ],
    stack: ["SQL", "Excel", "Power BI", "Requirements analysis"],
  },
  {
    id: "google-eduskills",
    org: "Google AI/ML Virtual Internship (EduSkills)",
    role: "AI/ML Intern",
    start: "2025-12",
    end: "2026-03",
    mode: "Remote",
    kind: "program",
    summary: "Applied machine learning with TensorFlow on Google's curriculum.",
    points: ["Trained and evaluated vision and tabular models in TensorFlow and Keras.", "Built small end-to-end ML pipelines from data preparation to evaluation."],
    stack: ["Python", "TensorFlow", "Keras", "scikit-learn"],
  },
  {
    id: "microsoft-elevate",
    org: "Microsoft Elevate",
    role: "Azure Intern",
    start: "2026-01",
    end: "2026-02",
    mode: "Remote",
    kind: "program",
    summary: "Azure cloud infrastructure, identity and deployment.",
    points: ["Deployed and configured services on Azure, including identity and access setup.", "Practised infrastructure-as-code and enterprise deployment patterns."],
    stack: ["Azure", "Entra ID", "App Service", "CI/CD"],
  },
  {
    id: "ibm-aicte",
    org: "1M1B × AICTE × IBM",
    role: "AI Intern",
    start: "2025-12",
    end: "2026-01",
    mode: "Remote",
    kind: "program",
    summary: "Python machine learning and analytics on sustainability data.",
    points: ["Cleaned and analysed sustainability datasets in Python.", "Built and explained predictive models with an emphasis on bias and interpretability."],
    stack: ["Python", "pandas", "scikit-learn", "IBM watsonx"],
  },
  {
    id: "shristi-it",
    org: "Shristi Infrastructure Development Ltd.",
    role: "IT Intern",
    start: "2025-12",
    end: "2026-01",
    mode: "On-site",
    place: "Kolkata",
    kind: "internship",
    summary: "Enterprise IT and ERP operations for a real-estate and infrastructure company.",
    points: [
      "Supported Farvision ERP for 50+ business users across CRM, finance and project modules.",
      "Troubleshot 20+ systems across departments and gathered requirements from cross-functional teams.",
    ],
    stack: ["Farvision ERP", "Windows", "Office 365", "Networking"],
    metrics: [
      { label: "ERP users supported", value: "50+", verified: true },
      { label: "Systems troubleshot", value: "20+", verified: true },
    ],
  },
  {
    id: "bluestock",
    org: "Bluestock Fintech",
    role: "Software Developer Intern",
    start: "2025-10",
    end: "2025-11",
    mode: "Remote",
    kind: "internship",
    summary: "Fintech dashboards and backend performance.",
    points: [
      "Built React dashboard modules consuming REST APIs for financial analytics.",
      "Reduced backend API latency with Redis caching, query optimisation and connection pooling.",
    ],
    stack: ["React", "Node.js", "Redis", "PostgreSQL", "REST"],
    metrics: [{ label: "API latency reduction", value: "22%", verified: false }],
  },
  {
    id: "hcds",
    org: "HCDS Techh",
    role: "Software Engineer Intern",
    start: "2025-08",
    end: "2025-11",
    mode: "Hybrid",
    kind: "internship",
    summary: "Backend services and APIs for production web applications.",
    points: [
      "Designed and built REST APIs and backend services in Node.js and Express.",
      "Took part in code reviews, design discussions and CI/CD improvements with product, QA and DevOps.",
    ],
    stack: ["Node.js", "Express", "JavaScript", "Docker", "CI/CD"],
  },
  {
    id: "techcorp",
    org: "TechCorp",
    role: "Python Developer Intern",
    start: "2025-07",
    end: "2025-08",
    mode: "On-site",
    place: "Noida",
    kind: "internship",
    summary: "Python development and automation.",
    points: ["Wrote Python services and automation scripts for internal workflows.", "Built data-processing utilities and their tests."],
    stack: ["Python", "Flask", "pandas", "pytest"],
  },
  {
    id: "codtech",
    org: "Codtech IT Solutions",
    role: "Full-Stack Developer Intern",
    start: "2025-04",
    end: "2025-06",
    mode: "Remote",
    kind: "internship",
    summary: "Full-stack applications with authentication and data modelling.",
    points: [
      "Built full-stack apps in React, Node.js and Express with JWT authentication and role-based access.",
      "Designed MongoDB and Prisma schemas and improved query efficiency through index tuning.",
    ],
    stack: ["React", "Node.js", "Express", "MongoDB", "Prisma", "JWT"],
    metrics: [{ label: "Query efficiency gain", value: "35%", verified: false }],
  },
  {
    id: "technohacks",
    org: "TechnoHacks",
    role: "Java Developer Intern",
    start: "2025-02",
    end: "2025-04",
    mode: "Remote",
    kind: "internship",
    summary: "Java backend modules on MySQL.",
    points: ["Built Java backend modules with object-oriented design and MySQL-backed CRUD services.", "Optimised SQL queries and indexes; wrote JUnit tests and hand-off documentation."],
    stack: ["Java", "JDBC", "MySQL", "JUnit"],
    metrics: [{ label: "Database performance gain", value: "30%", verified: false }],
  },
];

export const freelance = {
  role: "Independent engineer",
  start: "2024",
  clients: "17+",
  summary:
    "Since 2024 I have built software for enterprises, startups and individuals: web and mobile applications, internal tools, dashboards, fintech features, machine-learning models and prediction systems. I take a project from the first conversation through design, build, testing, deployment and support.",
  confidentiality: "Client names and project details are covered by contract and privacy terms, so they are not listed here. Happy to discuss the work itself on a call.",
  kinds: [
    { name: "Full-stack web applications", detail: "Next.js, React, Node.js, Python backends, Postgres and MySQL" },
    { name: "AI and ML products", detail: "Prediction systems, RAG assistants, agent workflows, model training and deployment" },
    { name: "Dashboards and analytics", detail: "Business intelligence, KPI tracking, data pipelines and reporting" },
    { name: "Fintech features", detail: "Payments flows, reconciliation, transaction analytics" },
    { name: "Websites and landing pages", detail: "Fast, accessible marketing sites with CMS where needed" },
    { name: "Automation and integrations", detail: "Internal tools, APIs, third-party integrations, scheduled jobs" },
  ],
  clientTypes: ["Enterprises", "Startups", "Individuals"],
};
