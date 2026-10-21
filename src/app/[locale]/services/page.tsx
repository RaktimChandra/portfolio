import { getX } from "@/i18n/x/server";
import BookCall from "@/components/BookCall";
import { Link } from "@/i18n/navigation";
import PageHead from "@/components/PageHead";
import { freelance } from "@/content/experience";
import { process, services } from "@/content/record";
import { profile } from "@/content/profile";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Services", "Hire Raktim Chandra for AI agents, RAG assistants, machine-learning models, full-stack products, dashboards and QA automation.", "/services", locale);
}

export default async function Services({ params }: LP) {
  const xl = await getX();
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title={xl("Services")} lede={xl.f("I've built for {n} clients since 2024: enterprises, startups and founders. One engineer from the first call to production.", { n: freelance.clients })}>
        <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/scope" className="btn">{xl("Scope your project")}</Link>
          <BookCall context="a project" quiet />
          <a href={`mailto:${profile.email}?subject=Project%20enquiry`} className="btn btn-quiet">{xl("Email me")}</a>
        </p>
      </PageHead>
      <div className="card-grid">
        {services.map((s, i) => (
          <section key={s.name} className="card panel" data-title={s.name} data-reveal style={{ ["--i" as string]: i }}>
            <p className="card__meta"><span className="tabular">{String(i + 1).padStart(2, "0")}</span><span>{xl("Typical")}{" "}{xl(s.timeline)}</span></p>
            <h2 className="card__title" style={{ fontSize: "1.6rem" }}>{xl(s.name)}</h2>
            <p>{xl(s.line)}</p>
            <ul style={{ paddingLeft: "1.1rem", display: "grid", gap: 4 }}>{s.includes.map((x) => <li key={x}>{xl(x)}</li>)}</ul>
          </section>
        ))}
      </div>
      <section className="section">
        <h2 className="sec-title display" style={{ marginBottom: "2rem" }}>{xl("How a project runs")}</h2>
        <ol className="poster" style={{ listStyle: "none" }}>
          {process.map((p, i) => (
            <li key={p.step} className="poster__line" data-reveal>
              <span className="poster__n tabular muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="poster__name display">{xl(p.step)}</span>
              <span className="poster__desc">{xl(p.body)}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="prose">
        <h2>{xl("Clients and confidentiality")}</h2>
        <p>{xl(freelance.confidentiality)}{" "}{xl("Client types:")}{" "}{freelance.clientTypes.join(", ").toLowerCase()}.</p>
        <h2>{xl("Working hours")}</h2>
        <p>{xl("Based in Chennai (IST, UTC+5:30). Remote work with clients anywhere; calls scheduled to suit your time zone.")}</p>
      </section>
    </div>
  );
}
