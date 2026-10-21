import MiniSearch from "minisearch";
import { profile } from "@/content/profile";
import { experience, freelance } from "@/content/experience";
import { projects, repoUrl } from "@/content/projects";
import { awards, certifications, papers, research, services, skills } from "@/content/record";

export type Doc = { id: string; title: string; kind: string; href: string; text: string; tags: string };

const fmt = (ym: string | null) => {
  if (!ym) return "present";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1).toLocaleString("en-GB", { month: "short", year: "numeric" });
};

export function buildDocs(): Doc[] {
  const docs: Doc[] = [];
  docs.push({
    id: "profile",
    title: "About Raktim",
    kind: "profile",
    href: "/about",
    text: `${profile.name} is an ${profile.role} based in ${profile.location}, originally from ${profile.from}. ${profile.pitch} ${profile.education.degree} at ${profile.education.school}, ${profile.education.years}, CGPA ${profile.education.cgpa}. ${profile.education.note} ${profile.availability} Outside work: ${profile.outside.join(", ")}.`,
    tags: "about who background education college srm cgpa location chennai bengal hobbies football gym",
  });
  docs.push({
    id: "contact",
    title: "Contact",
    kind: "contact",
    href: "/contact",
    text: `Email ${profile.email}. Phone ${profile.phone}. GitHub ${profile.github}. LinkedIn ${profile.linkedin}. ${profile.availability}`,
    tags: "contact email phone reach hire call linkedin github available availability",
  });
  docs.push({
    id: "freelance",
    title: "Freelance practice",
    kind: "experience",
    href: "/services",
    text: `${freelance.summary} ${freelance.clients} clients so far: ${freelance.clientTypes.join(", ")}. Kinds of work: ${freelance.kinds.map((k) => `${k.name} (${k.detail})`).join("; ")}. ${freelance.confidentiality}`,
    tags: "freelance clients contract hire project rates services build",
  });
  for (const e of experience) {
    docs.push({
      id: `exp-${e.id}`,
      title: `${e.role}, ${e.org}`,
      kind: "experience",
      href: "/experience",
      text: `${e.role} at ${e.org}${e.place ? ` (${e.place})` : ""}, ${fmt(e.start)} – ${fmt(e.end)}, ${e.mode}. ${e.summary} ${e.points.join(" ")} Stack: ${e.stack.join(", ")}.`,
      tags: `internship work experience ${e.stack.join(" ")}`,
    });
  }
  for (const p of projects) {
    const m = p.metrics?.map((x) => `${x.label}: ${x.value}`).join("; ");
    docs.push({
      id: `p-${p.slug}`,
      title: p.title,
      kind: "project",
      href: `/work/${p.slug}`,
      text: `${p.title} (${p.year}): ${p.tagline} ${p.summary} ${p.problem ?? ""} ${(p.approach ?? []).join(" ")} ${m ? `Measured: ${m}.` : ""} ${p.context ?? ""} Stack: ${p.stack.join(", ")}.${repoUrl(p) ? ` Code: ${repoUrl(p)}.` : ""}${p.demo ? ` Live: ${p.demo}.` : ""}`,
      tags: `project ${p.domains.join(" ")} ${p.stack.join(" ")}`,
    });
  }
  docs.push({
    id: "research",
    title: "Research and publications",
    kind: "research",
    href: "/research",
    text: `Seven IEEE conference papers: ${papers.map((p) => `${p.title} (${p.year}, ${p.area})`).join("; ")}. Co-authors include ${research.coauthors}. An ${research.igi.publisher} ${research.igi.title.toLowerCase()}. Undergraduate research ${research.urop.id}: ${research.urop.title}.`,
    tags: "research papers ieee publications conference igi urop pinn academic",
  });
  docs.push({
    id: "awards",
    title: "Recognition",
    kind: "awards",
    href: "/achievements",
    text: awards.map((a) => `${a.title}${a.detail ? ` — ${a.detail}` : ""} (${a.year})`).join(". "),
    tags: "awards hackathons achievements wins semifinalist ey amazon guidewire open source",
  });
  docs.push({
    id: "certs",
    title: "Certifications",
    kind: "certs",
    href: "/certifications",
    text: certifications.map((c) => `${c.name} (${c.issuer})`).join("; "),
    tags: "certifications certificates aws azure oracle ibm google databricks cisco",
  });
  docs.push({
    id: "services",
    title: "Services",
    kind: "services",
    href: "/services",
    text: services.map((s) => `${s.name}: ${s.line} Includes ${s.includes.join(", ")}. Typical timeline ${s.timeline}.`).join(" "),
    tags: "services freelance hire build project cost timeline offer",
  });
  docs.push({
    id: "skills",
    title: "Skills",
    kind: "skills",
    href: "/skills",
    text: Object.entries(skills).map(([k, v]) => `${k}: ${v.join(", ")}`).join(". "),
    tags: "skills stack technologies languages tools",
  });
  return docs;
}

let index: { ms: MiniSearch<Doc>; docs: Doc[] } | null = null;
export function getIndex() {
  if (index) return index;
  const docs = buildDocs();
  const ms = new MiniSearch<Doc>({
    fields: ["title", "text", "tags"],
    storeFields: ["title", "href", "kind", "text"],
    searchOptions: { boost: { title: 3, tags: 2 }, fuzzy: 0.15, prefix: true, combineWith: "OR" },
  });
  ms.addAll(docs);
  index = { ms, docs };
  return index;
}

const STOP = new Set("a an the is are was were what which who whom has have had did does do of in on at to for with and or by from about tell me raktim raktim's his he him please can you your built build made make any some projects project use used using uses work worked working know show list does him".split(" "));

export function retrieve(q: string, k = 5) {
  const { ms, docs } = getIndex();
  const terms = q.toLowerCase().replace(/[^\p{L}\p{N}\s.+#-]/gu, " ").split(/\s+/).filter((w) => w && !STOP.has(w));
  const query = terms.join(" ") || q;
  const hits = ms.search(query).slice(0, k);
  return hits.map((h) => docs.find((d) => d.id === h.id)!).filter(Boolean);
}

/** Answer without an LLM: pick the sentences that carry the query terms, cite the documents. */
export function extractive(q: string, hits: Doc[]) {
  if (!hits.length) {
    return `I don't have that in my notes. Try asking about a project (for example Bulwark or TestHarness), a technology, my internships, papers or how to hire me. Or write to ${profile.email}.`;
  }
  const terms = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !STOP.has(w));
  const score = (s: string) => terms.reduce((n, t) => n + (s.toLowerCase().includes(t) ? 1 : 0), 0);
  const out: string[] = [];
  const top = hits[0];
  const sentences = top.text.split(/(?<=[.!?])\s+/);
  const best = sentences.map((s, i) => ({ s, i, n: score(s) + (i === 0 ? 0.5 : 0) })).sort((a, b) => b.n - a.n).slice(0, 3).sort((a, b) => a.i - b.i).map((x) => x.s);
  out.push(best.join(" "));
  const others = terms.length ? hits.slice(1, 4).filter((h) => score(`${h.title} ${h.text}`) > 0) : [];
  if (others.length) out.push(`Also relevant: ${others.map((h) => h.title).join(", ")}.`);
  return out.join("\n\n");
}
