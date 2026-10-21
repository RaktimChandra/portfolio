import { SITE_URL } from "@/lib/site";
import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { projects, repoUrl } from "@/content/projects";
import { awards, papers } from "@/content/record";

export const dynamic = "force-static";

export function GET() {
  const body = `# ${profile.name}

> ${profile.role}. ${profile.pitch}

Contact: ${profile.email} · ${profile.linkedin} · ${profile.github}
Availability: ${profile.availability}

## Pages
- [Work](${SITE_URL}/work): all projects
- [Résumé](${SITE_URL}/resume) · [PDF](${SITE_URL}/resume.pdf)
- [Experience](${SITE_URL}/experience)
- [Services](${SITE_URL}/services)
- [Research](${SITE_URL}/research)

## Education
${profile.education.degree}, ${profile.education.school}, ${profile.education.years}. CGPA ${profile.education.cgpa}.

## Experience
${experience.map((e) => `- ${e.role}, ${e.org} (${e.start} to ${e.end ?? "present"}): ${e.summary}`).join("\n")}
- Freelance full-stack and AI/ML engineer, 2024 to present: 17+ clients.

## Projects
${projects.map((p) => `- [${p.title}](${SITE_URL}/work/${p.slug}): ${p.tagline}${p.metrics?.length ? ` (${p.metrics.map((m) => `${m.label} ${m.value}`).join("; ")})` : ""}${repoUrl(p) ? ` — ${repoUrl(p)}` : ""}`).join("\n")}

## Research
${papers.map((p) => `- ${p.title}, ${p.venue}, ${p.year}`).join("\n")}

## Recognition
${awards.map((a) => `- ${a.title}`).join("\n")}
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
