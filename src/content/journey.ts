export type Milestone = { when: string; title: string; line: string; kind: "study" | "work" | "build" | "win" | "paper" | "next"; href?: string };

/** The timeline flown through on /journey. Oldest first. */
export const journey: Milestone[] = [
  { when: "2023", title: "Starts B.Tech CSE at SRM", line: "Software Engineering specialisation, Department of Computational Intelligence, Chennai.", kind: "study", href: "/about" },
  { when: "2024", title: "Freelance practice begins", line: "First paying clients. 17+ enterprises, startups and founders since.", kind: "work", href: "/services" },
  { when: "2024", title: "Hospital Management System", line: "A Java and MySQL desktop app. The first full system.", kind: "build", href: "/work/hospital-management" },
  { when: "Feb 2025", title: "Java intern, TechnoHacks", line: "MySQL-backed services, query tuning and JUnit.", kind: "work", href: "/experience" },
  { when: "Apr 2025", title: "Full-stack intern, Codtech", line: "React, Node.js and MongoDB with JWT and role-based access.", kind: "work", href: "/experience" },
  { when: "2025", title: "Three IEEE papers", line: "Job Portal, Fake News Detection and Cryptocurrency Price Prediction.", kind: "paper", href: "/research" },
  { when: "Jul 2025", title: "Python developer, TechCorp", line: "On-site in Noida: services, automation and their tests.", kind: "work", href: "/experience" },
  { when: "Aug 2025", title: "Software engineer, HCDS Techh", line: "Node.js APIs and backend services, in a hybrid team.", kind: "work", href: "/experience" },
  { when: "Oct 2025", title: "SDE intern, Bluestock Fintech", line: "React dashboards and a faster API behind them.", kind: "work", href: "/experience" },
  { when: "Dec 2025", title: "Google, IBM and Shristi", line: "AI/ML with Google, sustainability AI with IBM, and enterprise IT on-site in Kolkata.", kind: "work", href: "/experience" },
  { when: "Jan 2026", title: "Microsoft Elevate", line: "Azure infrastructure, identity and deployment.", kind: "work", href: "/experience" },
  { when: "2026", title: "EY Techathon and Guidewire semifinals", line: "From 1.8 lakh registrations, and VORTEX Shield for gig workers.", kind: "win", href: "/achievements" },
  { when: "2026", title: "Amazon ML Challenge", line: "1.7M records against 10M+, CPU-only. Macro F0.5 0.9628.", kind: "win", href: "/work/business-entity-resolution" },
  { when: "2026", title: "Four more IEEE papers", line: "AutoGenAI, VitalMind, Vortex and ChainGuard.", kind: "paper", href: "/research" },
  { when: "Jun 2026", title: "SDE intern, Shristi", line: "Back at Shristi, now building software.", kind: "work", href: "/experience" },
  { when: "Sep 2026", title: "Bulwark, Marginalia, Genesis", line: "Agents that arbitrate fraud, argue about research and write whole apps.", kind: "build", href: "/work/bulwark" },
  { when: "Oct 2026", title: "TestHarness, CIForge, PortSync", line: "Verification-first systems: 540 tests, 92% coverage, exactly-once Kafka.", kind: "build", href: "/work/testharness" },
  { when: "2027", title: "Graduates. What's next?", line: "Open to full-time SDE, AI/ML and GenAI roles. Let's talk.", kind: "next", href: "/contact" },
];

export const KIND_COLOR: Record<Milestone["kind"], string> = {
  study: "#8fb3ff",
  work: "#b08f74",
  build: "#3fcf8e",
  win: "#ffcc33",
  paper: "#c38bff",
  next: "#ff6b5e",
};
