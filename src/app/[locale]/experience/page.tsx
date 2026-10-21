import { getX } from "@/i18n/x/server";
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
  const xl = await getX();
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title={xl("Experience")} lede={xl.f("{n} roles since February 2025, alongside a freelance practice that started in 2024.", { n: experience.length })} />
      <section className="panel" style={{ padding: "clamp(1.25rem, 3vw, 2.5rem)", marginBottom: "3rem" }} data-title={xl("Freelance")}>
        <p className="text-small muted">{xl("2024 – Present · Remote")}</p>
        <h2 className="display" style={{ fontSize: "clamp(2.2rem, 1.4rem + 3vw, 4.4rem)", margin: "0.4rem 0 1rem" }}>{xl("Independent engineer ·")}{" "}{xl(freelance.clients)}{" "}{xl("clients")}</h2>
        <p className="text-lead" style={{ maxWidth: "60ch" }}>{xl(freelance.summary)}</p>
        <ul className="card-grid" style={{ listStyle: "none", padding: 0, marginTop: "1.5rem" }}>
          {freelance.kinds.map((k) => (
            <li key={k.name}><b>{xl(k.name)}</b><br /><span className="muted">{xl(k.detail)}</span></li>
          ))}
        </ul>
        <p className="muted text-small" style={{ marginTop: "1.5rem" }}>{xl(freelance.confidentiality)}</p>
      </section>
      <ol className="timeline">
        {experience.map((e) => (
          <li key={e.id} className="timeline__item" data-reveal>
            <p className="timeline__when tabular">{ym(e.start, xl.locale)} – {ym(e.end, xl.locale)}<br />{xl.f("{n} months", { n: months(e.start, e.end) })} · {xl(e.mode)}{e.place ? ` · ${xl(e.place)}` : ""}</p>
            <h2 className="timeline__role">{xl(e.role)}</h2>
            <p className="text-lead" style={{ fontSize: "1.1rem" }}>{xl(e.org)}</p>
            <p>{xl(e.summary)}</p>
            <ul>{e.points.map((p) => <li key={p}>{xl(p)}</li>)}</ul>
            {e.metrics?.filter((m) => m.verified).length ? (
              <p className="card__meta">{e.metrics.filter((m) => m.verified).map((m) => <span key={m.label}><b className="tabular" style={{ color: "var(--ink)" }}>{xl(m.value)}</b> {xl(m.label)}</span>)}</p>
            ) : null}
            <p className="card__meta">{e.stack.map((s) => <span key={s} className="tag">{xl(s)}</span>)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
