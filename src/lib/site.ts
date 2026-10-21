export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://raktimchandra.vercel.app").replace(/\/$/, "");

export const NAV = [
  { href: "/work", key: "work" },
  { href: "/experience", key: "experience" },
  { href: "/services", key: "services" },
  { href: "/research", key: "research" },
  { href: "/about", key: "about" },
  { href: "/resume", key: "resume" },
] as const;

export const MORE = [
  { href: "/interview", key: "interview" },
  { href: "/journey", key: "journey" },
  { href: "/blog", key: "blog" },
  { href: "/achievements", key: "achievements" },
  { href: "/certifications", key: "certifications" },
  { href: "/skills", key: "skills" },
  { href: "/open-source", key: "openSource" },
  { href: "/match", key: "match" },
  { href: "/scope", key: "scope" },
  { href: "/brief", key: "brief" },
  { href: "/now", key: "now" },
  { href: "/uses", key: "uses" },
  { href: "/lab", key: "lab" },
  { href: "/status", key: "status" },
  { href: "/contact", key: "contact" },
] as const;
