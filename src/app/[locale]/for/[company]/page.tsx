import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { readCompany, nameFromDomain } from "@/lib/company";
import { getProject } from "@/content/projects";
import { localize } from "@/content/i18n";
import { profile } from "@/content/profile";
import { roleCVs } from "@/content/roles";
import TrackView from "@/components/TrackView";
import BookCall from "@/components/BookCall";

type P = { params: Promise<{ locale: string; company: string }>; searchParams: Promise<{ site?: string }> };

export const revalidate = 86400;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { company } = await params;
  const name = nameFromDomain(company);
  return { title: `Raktim Chandra, for ${name}`, robots: { index: false, follow: false } };
}

export default async function ForCompany({ params, searchParams }: P) {
  const { locale, company } = await params;
  const { site } = await searchParams;
  setRequestLocale(locale);
  const slug = company.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  const domain = (site ?? `${slug}.com`).toLowerCase().replace(/^https?:\/\//, "").split("/")[0].slice(0, 100);
  const c = await readCompany(domain);
  const name = c?.name || nameFromDomain(domain);
  const projects = (c?.projects ?? ["bulwark", "clindocmicro", "business-entity-resolution", "testharness"]).map(getProject).filter(Boolean).map((p) => localize(p!, locale));
  const role = c && c.matched.some((m) => /agent|rag|llm|pytorch|machine|vision|nlp/i.test(m)) ? "ai-ml" : c && c.matched.some((m) => /playwright|selenium|pytest|testing|junit/i.test(m)) ? "qa" : c && c.matched.some((m) => /sql|pandas|power bi|databricks/i.test(m)) ? "data" : "sde";
  const cv = roleCVs.find((r) => r.slug === role)!;
  return (
    <div className="page wrap for-page">
      <TrackView event="company_link_opened" props={{ company: slug, domain, fetched: !!c?.fetched }} />
      <header className="page-head">
        <p className="crumbs tabular">For {domain}</p>
        <h1 className="page-title display">Hello, {name}.</h1>
        <p className="page-lede">I&apos;m {profile.name}, an {profile.role.replace(" engineer", "")} engineer from SRM, Chennai, graduating 2027. Here is what I&apos;ve built that lines up with what you do.</p>
      </header>

      {c?.about && (
        <section className="for-about panel" data-title="What you say you do">
          <p className="text-small muted">From {domain}</p>
          <blockquote>{c.about}</blockquote>
        </section>
      )}
      {!c?.fetched && <p className="text-small muted">I couldn&apos;t read {domain} just now, so this page shows my strongest work instead.</p>}

      {!!c?.matched.length && (
        <section className="for-sec">
          <h2>Where we overlap</h2>
          <p className="for-tags">{c.matched.map((m) => <span key={m} className="tag">{m}</span>)}</p>
          <p className="text-small muted">Matched automatically from your homepage against my skills list.</p>
        </section>
      )}

      <section className="for-sec">
        <h2>Start with these</h2>
        <div className="for-grid">
          {projects.map((p) => (
            <Link key={p!.slug} href={`/work/${p!.slug}`} className="card panel" data-title={p!.title}>
              <b className="card__title">{p!.title}</b>
              <span>{p!.tagline}</span>
              {p!.metrics?.[0] && <span className="tabular text-small"><b>{p!.metrics[0].value}</b> {p!.metrics[0].label}</span>}
            </Link>
          ))}
        </div>
      </section>

      <section className="for-sec for-cta">
        <h2>Next step</h2>
        <p>{profile.availability}</p>
        <p className="demo__row">
          <BookCall context={`${name}`} />
          <Link href={`/resume/${cv.slug}`} className="btn btn-quiet">Résumé ({cv.title})</Link>
          <a className="btn btn-quiet" href={`mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${name}`)}`}>Email me</a>
        </p>
      </section>
    </div>
  );
}
