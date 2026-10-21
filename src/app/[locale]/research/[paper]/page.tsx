import { getX, tx, fill } from "@/i18n/x/server";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { links, papers, research } from "@/content/record";
import { routing } from "@/i18n/routing";
import { meta } from "@/lib/page";
import CopyButton from "@/components/CopyButton";

type P = { params: Promise<{ locale: string; paper: string }> };
const slugOf = (k: string) => k.toLowerCase();
const find = (s: string) => papers.find((p) => slugOf(p.key) === s);
/** Only where the project and the paper share a title. */
const RELATED: Record<string, string> = { FakeNews: "fake-news-detection", CryptoPrediction: "crypto-prediction", JobPortal: "job-portal" };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => papers.map((p) => ({ locale, paper: slugOf(p.key) })));
}
export async function generateMetadata({ params }: P) {
  const { locale, paper } = await params;
  const p = find(paper);
  if (!p) return {};
  const desc = fill(tx(locale, "{title}: a paper by Raktim Chandra on {area}, {venue}, {year}."), { title: p.title, area: tx(locale, p.area), venue: tx(locale, p.venue), year: p.year });
  return meta(`${p.title} (${tx(locale, p.venue)}, ${p.year})`, desc, `/research/${paper}`, locale);
}

export default async function PaperPage({ params }: P) {
  const xl = await getX();
  const { locale, paper } = await params;
  setRequestLocale(locale);
  const p = find(paper);
  if (!p) notFound();
  const href = links.ieee[p.key];
  const abs = links.abstracts[p.key];
  const bib = `@inproceedings{chandra${p.year}${p.key.toLowerCase()},\n  title     = {${p.title}},\n  author    = {Chandra, Raktim and others},\n  booktitle = {${p.venue}},\n  year      = {${p.year}}${href ? `,\n  url       = {${href}}` : ""}\n}`;
  const rel = RELATED[p.key];
  const ld = { "@context": "https://schema.org", "@type": "ScholarlyArticle", headline: p.title, about: p.area, datePublished: String(p.year), author: { "@type": "Person", name: "Raktim Chandra" }, publisher: { "@type": "Organization", name: "IEEE" }, ...(href ? { url: href } : {}), ...(abs ? { abstract: abs } : {}) };
  return (
    <div className="page wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="page-head">
        <p className="crumbs"><Link href="/research" className="link-u">{xl("Research")}</Link> · {xl(p.area)}</p>
        <h1 className="page-title display">{xl(p.title)}</h1>
        <p className="page-lede">{xl(p.venue)}, {xl(p.year)}.</p>
      </header>
      <div className="case">
        <div className="prose">
          {abs ? <><h2>{xl("Abstract")}</h2><p>{xl(abs)}</p></> : <p className="text-lead">{xl.f("{title}: a paper on {area}, presented at an {venue} in {year}.", { title: p.title, area: xl(p.area), venue: xl(p.venue), year: p.year })}</p>}
          {rel && (
            <>
              <h2>{xl("The code")}</h2>
              <p>{xl("The system behind this paper is on the site:")}{" "}<Link href={`/work/${rel}`} className="link-u">{xl("read the case study")}</Link>.</p>
            </>
          )}
          <h2>{xl("Cite")}</h2>
          <pre className="bib"><code>{bib}</code></pre>
          <p><CopyButton text={bib} label={xl("Copy BibTeX")} /></p>
          {!href && <p className="text-small muted">{xl("The full citation (pages, DOI) is added once the paper is indexed.")}</p>}
        </div>
        <aside className="case__aside panel" style={{ padding: "1.4rem" }} data-title={xl("Paper")}>
          <dl className="side-facts">
            <div><dt className="muted text-small">{xl("Venue")}</dt><dd>{xl(p.venue)}</dd></div>
            <div><dt className="muted text-small">{xl("Year")}</dt><dd className="tabular">{xl(p.year)}</dd></div>
            <div><dt className="muted text-small">{xl("Area")}</dt><dd>{xl(p.area)}</dd></div>
            <div><dt className="muted text-small">{xl("Co-authors across the papers")}</dt><dd>{xl(research.coauthors)}</dd></div>
          </dl>
          {href ? <a className="btn" href={href} target="_blank" rel="noopener">{xl("Read on IEEE Xplore ↗")}</a> : null}
        </aside>
      </div>
    </div>
  );
}
