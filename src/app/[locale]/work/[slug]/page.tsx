import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import PageHead from "@/components/PageHead";
import { DOMAIN_LABEL, factLine, getProject, projects, repoUrl } from "@/content/projects";
import DemoVideo from "@/components/DemoVideo";
import { localize } from "@/content/i18n";
import TrackView from "@/components/TrackView";
import Architecture from "@/components/Architecture";
import CodeWalk from "@/components/CodeWalk";
import LiveDemo from "@/components/demos/LiveDemo";
import { routing } from "@/i18n/routing";
import { meta } from "@/lib/page";

type P = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  const b = getProject(slug);
  if (!b) return {};
  const p = localize(b, locale);
  return meta(p.title, `${p.tagline} ${p.summary}`.slice(0, 300), `/work/${p.slug}`, locale);
}

export default async function CaseStudy({ params }: P) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const base = getProject(slug);
  if (!base) notFound();
  const p = localize(base, locale);
  const t = await getTranslations("work");
  const i = projects.indexOf(base);
  const next = projects[(i + 1) % projects.length];
  const code = repoUrl(p);

  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: p.title,
    description: p.summary,
    codeRepository: code,
    programmingLanguage: p.stack.slice(0, 4),
    author: { "@type": "Person", name: "Raktim Chandra" },
    dateCreated: String(p.year),
  };

  return (
    <article className="page wrap">
      <TrackView event="project_opened" props={{ slug: p.slug, title: p.title, featured: !!p.featured }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead title={p.title} lede={p.tagline} crumb={{ href: "/work", label: t("back") }} />

      {!!p.metrics?.length && (
        <section aria-label={t("results")}>
          <dl className="big-metrics">
            {p.metrics.map((m) => (
              <div key={m.label}>
                <dt className="text-small muted">{m.label}</dt>
                <dd className="tabular">{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {p.video ? (
        <DemoVideo src={p.video} title={p.title} />
      ) : p.featured ? (
        <div className="demo-video demo-video--empty panel" data-title="Demo">
          <p className="text-small muted">30-second demo</p>
          <p>A screen recording of {p.title} running end to end is being cut.{p.demo ? " Meanwhile, the live version is one click away." : ""}</p>
          {p.demo && <a className="btn btn-quiet" href={p.demo} target="_blank" rel="noopener">Open the live demo ↗</a>}
        </div>
      ) : null}

      <Architecture slug={p.slug} title={t("system")} />
      <LiveDemo slug={p.slug} />
      <CodeWalk slug={p.slug} />

      <div className="case">
        <div className="prose">
          <p className="text-lead">{p.summary}</p>
          {p.problem && (
            <>
              <h2>{t("problem")}</h2>
              <p>{p.problem}</p>
            </>
          )}
          {!!p.approach?.length && (
            <>
              <h2>{t("approach")}</h2>
              <ul>{p.approach.map((a) => <li key={a}>{a}</li>)}</ul>
            </>
          )}
          {p.context && (
            <>
              <h2>{t("context")}</h2>
              <p>{p.context}</p>
            </>
          )}
          {p.team && <p className="muted">{p.team}</p>}
        </div>
        <aside className="case__aside panel" style={{ padding: "1.4rem" }} data-title="Details">
          <dl>
            <div><dt className="text-small muted">Year</dt><dd className="tabular">{p.year}</dd></div>
            <div><dt className="text-small muted">Status</dt><dd style={{ textTransform: "capitalize" }}>{p.status}</dd></div>
            <div><dt className="text-small muted">Areas</dt><dd>{p.domains.map((d) => DOMAIN_LABEL[d]).join(", ")}</dd></div>
            {factLine(p) && (
              <div><dt className="text-small muted">From the repository</dt><dd>{factLine(p)}</dd></div>
            )}
            {!!p.stack.length && (
              <div><dt className="text-small muted">{t("stack")}</dt><dd className="card__meta" style={{ marginTop: 6 }}>{p.stack.map((s) => <span className="tag" key={s}>{s}</span>)}</dd></div>
            )}
          </dl>
          <div className="case__links">
            {code ? <a className="btn" href={code} target="_blank" rel="noopener">{t("code")} ↗</a> : <span className="muted text-small">{t("private")}</span>}
            {p.demo ? <a className="btn btn-quiet" href={p.demo} target="_blank" rel="noopener">{t("live")} ↗</a> : <span className="muted text-small">{t("noDemo")}</span>}
          </div>
        </aside>
      </div>

      <nav className="sec-foot" aria-label="More projects" style={{ marginTop: "4rem", borderTop: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)", paddingTop: "2rem" }}>
        <span className="muted">{t("next")}</span>
        <Link href={`/work/${next.slug}`} className="display" style={{ fontSize: "clamp(2rem, 1rem + 4vw, 4.5rem)", textDecoration: "none" }}>{next.title} →</Link>
      </nav>
    </article>
  );
}
