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
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Services" lede={`I've built for ${freelance.clients} clients since 2024: enterprises, startups and founders. One engineer from the first call to production.`}>
        <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/scope" className="btn">Scope your project</Link>
          <a href={`mailto:${profile.email}?subject=Project%20enquiry`} className="btn btn-quiet">Email me</a>
        </p>
      </PageHead>
      <div className="card-grid">
        {services.map((s, i) => (
          <section key={s.name} className="card panel" data-title={s.name} data-reveal style={{ ["--i" as string]: i }}>
            <p className="card__meta"><span className="tabular">{String(i + 1).padStart(2, "0")}</span><span>Typical {s.timeline}</span></p>
            <h2 className="card__title" style={{ fontSize: "1.6rem" }}>{s.name}</h2>
            <p>{s.line}</p>
            <ul style={{ paddingLeft: "1.1rem", display: "grid", gap: 4 }}>{s.includes.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
        ))}
      </div>
      <section className="section">
        <h2 className="sec-title display" style={{ marginBottom: "2rem" }}>How a project runs</h2>
        <ol className="poster" style={{ listStyle: "none" }}>
          {process.map((p, i) => (
            <li key={p.step} className="poster__line" data-reveal>
              <span className="poster__n tabular muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="poster__name display">{p.step}</span>
              <span className="poster__desc">{p.body}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="prose">
        <h2>Clients and confidentiality</h2>
        <p>{freelance.confidentiality} Client types: {freelance.clientTypes.join(", ").toLowerCase()}.</p>
        <h2>Working hours</h2>
        <p>Based in Chennai (IST, UTC+5:30). Remote work with clients anywhere; calls scheduled to suit your time zone.</p>
      </section>
    </div>
  );
}
