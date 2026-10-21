import { getX } from "@/i18n/x/server";
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
  const xl = await getX();
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
        <p className="crumbs tabular">{xl("For")}{" "}{xl(domain)}</p>
        <h1 className="page-title display">{xl("Hello,")}{" "}{xl(name)}.</h1>
        <p className="page-lede">{xl.f("I'm {name}, an {role} from SRM, Chennai, graduating 2027. Here is what I've built that lines up with what you do.", { name: profile.name, role: xl(profile.role) })}</p>
      </header>

      {c?.about && (
        <section className="for-about panel" data-title={xl("What you say you do")}>
          <p className="text-small muted">{xl("From")}{" "}{xl(domain)}</p>
          <blockquote>{xl(c.about)}</blockquote>
        </section>
      )}
      {!c?.fetched && <p className="text-small muted">{xl.f("I couldn't read {domain} just now, so this page shows my strongest work instead.", { domain })}</p>}

      {!!c?.matched.length && (
        <section className="for-sec">
          <h2>{xl("Where we overlap")}</h2>
          <p className="for-tags">{c.matched.map((m) => <span key={m} className="tag">{xl(m)}</span>)}</p>
          <p className="text-small muted">{xl("Matched automatically from your homepage against my skills list.")}</p>
        </section>
      )}

      <section className="for-sec">
        <h2>{xl("Start with these")}</h2>
        <div className="for-grid">
          {projects.map((p) => (
            <Link key={p!.slug} href={`/work/${p!.slug}`} className="card panel" data-title={p!.title}>
              <b className="card__title">{xl(p!.title)}</b>
              <span>{xl(p!.tagline)}</span>
              {p!.metrics?.[0] && <span className="tabular text-small"><b>{xl(p!.metrics[0].value)}</b> {xl(p!.metrics[0].label)}</span>}
            </Link>
          ))}
        </div>
      </section>

      <section className="for-sec for-cta">
        <h2>{xl("Next step")}</h2>
        <p>{xl(profile.availability)}</p>
        <p className="demo__row">
          <BookCall context={`${name}`} />
          <Link href={`/resume/${cv.slug}`} className="btn btn-quiet">{xl("Résumé (")}{xl(cv.title)})</Link>
          <a className="btn btn-quiet" href={`mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${name}`)}`}>{xl("Email me")}</a>
        </p>
      </section>
    </div>
  );
}
