import { profile } from "@/content/profile";
import { experience, freelance } from "@/content/experience";
import { featured, repoUrl, type Project } from "@/content/projects";
import { awards, certifications, papers, skills } from "@/content/record";
import { ym } from "@/lib/format";

/** Résumé. Server-rendered; also used (with a subset) by the job matcher. */
export default function Resume({ projects = featured.slice(0, 6), summary, highlightSkills }: { projects?: Project[]; summary?: string; highlightSkills?: string[] }) {
  const hs = new Set((highlightSkills ?? []).map((s) => s.toLowerCase()));
  return (
    <article className="cv">
      <header className="cv__head">
        <div>
          <h1 className="cv__name">{profile.name}</h1>
          <p className="cv__role">{profile.role}</p>
        </div>
        <p className="cv__contact">
          {profile.location} · {profile.phone}<br />
          <a href={`mailto:${profile.email}`}>{profile.email}</a><br />
          <a href={profile.linkedin}>linkedin.com/in/raktim-chandra-83711a321</a> · <a href={profile.github}>github.com/{profile.githubUser}</a>
        </p>
      </header>

      <section>
        <h2>Summary</h2>
        <p>{summary ?? `${profile.pitch} 7 IEEE conference papers, ${profile.numbers.clients} freelance clients, ${profile.numbers.hackathons} hackathons.`}</p>
      </section>

      <section>
        <h2>Education</h2>
        <div className="cv__row"><b>{profile.education.school}</b><span>{profile.education.years}</span></div>
        <p>{profile.education.degree} · CGPA {profile.education.cgpa} · all subjects cleared on first attempt</p>
      </section>

      <section>
        <h2>Experience</h2>
        <div className="cv__row"><b>Freelance Full-Stack and AI/ML Engineer · {freelance.clients} clients</b><span>2024 – Present</span></div>
        <p>Apps, dashboards, fintech features, ML models and prediction systems for enterprises, startups and individuals; client names under NDA.</p>
        {experience.map((e) => (
          <div key={e.id} className="cv__item">
            <div className="cv__row"><b>{e.role} · {e.org}</b><span>{ym(e.start)} – {ym(e.end)}</span></div>
            <p>{e.points[0]}{e.metrics?.some((m) => m.verified) ? ` (${e.metrics.filter((m) => m.verified).map((m) => `${m.label}: ${m.value}`).join(", ")})` : ""}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        {projects.map((p) => (
          <div key={p.slug} className="cv__item">
            <div className="cv__row"><b>{p.title} — {p.tagline}</b><span>{repoUrl(p) ? <a href={repoUrl(p)}>code</a> : p.year}</span></div>
            <p>{p.summary.split(". ").slice(0, 1).join(". ")}.{p.metrics?.length ? ` ${p.metrics.slice(0, 3).map((m) => `${m.label}: ${m.value}`).join("; ")}.` : ""} <i>{p.stack.slice(0, 6).join(", ")}</i></p>
          </div>
        ))}
      </section>

      <section>
        <h2>Research and recognition</h2>
        <p>7 IEEE conference papers ({papers.map((p) => p.title).join(", ")}); IGI Global chapter; UROP UR2526CI302 on physics-informed networks.</p>
        <p>{awards.filter((a) => a.tier < 3).map((a) => a.title).join(" · ")}.</p>
      </section>

      <section>
        <h2>Skills</h2>
        {Object.entries(skills).slice(0, 7).map(([g, list]) => (
          <p key={g}><b>{g}:</b> {list.map((s, i) => <span key={s}>{hs.has(s.toLowerCase()) ? <mark>{s}</mark> : s}{i < list.length - 1 ? ", " : ""}</span>)}</p>
        ))}
      </section>

      <section>
        <h2>Certifications</h2>
        <p>{certifications.slice(0, 16).map((c) => `${c.name} (${c.issuer})`).join(" · ")} · and {certifications.length - 16} more.</p>
      </section>
    </article>
  );
}
