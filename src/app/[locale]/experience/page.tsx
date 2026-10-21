import PageHead from "@/components/PageHead";
import { experience, freelance } from "@/content/experience";
import { boot, localeParams, meta, type LP } from "@/lib/page";
import { months, ym } from "@/lib/format";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Experience", "Internships at Shristi Infrastructure, Bluestock Fintech, HCDS Techh, Codtech, TechnoHacks, Brightforge Labs and TechCorp, programs with Google, Microsoft and IBM, and a freelance practice with 17+ clients.", "/experience", locale);
}

export default async function Experience({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Experience" lede={`${experience.length} roles since February 2025, alongside a freelance practice that started in 2024.`} />
      <section className="panel" style={{ padding: "clamp(1.25rem, 3vw, 2.5rem)", marginBottom: "3rem" }} data-title="Freelance">
        <p className="text-small muted">2024 – Present · Remote</p>
        <h2 className="display" style={{ fontSize: "clamp(2.2rem, 1.4rem + 3vw, 4.4rem)", margin: "0.4rem 0 1rem" }}>Independent engineer · {freelance.clients} clients</h2>
        <p className="text-lead" style={{ maxWidth: "60ch" }}>{freelance.summary}</p>
        <ul className="card-grid" style={{ listStyle: "none", padding: 0, marginTop: "1.5rem" }}>
          {freelance.kinds.map((k) => (
            <li key={k.name}><b>{k.name}</b><br /><span className="muted">{k.detail}</span></li>
          ))}
        </ul>
        <p className="muted text-small" style={{ marginTop: "1.5rem" }}>{freelance.confidentiality}</p>
      </section>
      <ol className="timeline">
        {experience.map((e) => (
          <li key={e.id} className="timeline__item" data-reveal>
            <p className="timeline__when tabular">{ym(e.start)} – {ym(e.end)}<br />{months(e.start, e.end)} months · {e.mode}{e.place ? ` · ${e.place}` : ""}</p>
            <h2 className="timeline__role">{e.role}</h2>
            <p className="text-lead" style={{ fontSize: "1.1rem" }}>{e.org}</p>
            <p>{e.summary}</p>
            <ul>{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
            {e.metrics?.filter((m) => m.verified).length ? (
              <p className="card__meta">{e.metrics.filter((m) => m.verified).map((m) => <span key={m.label}><b className="tabular" style={{ color: "var(--ink)" }}>{m.value}</b> {m.label}</span>)}</p>
            ) : null}
            <p className="card__meta">{e.stack.map((s) => <span key={s} className="tag">{s}</span>)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
