import { getX } from "@/i18n/x/server";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import PageHead from "@/components/PageHead";
import TrackView from "@/components/TrackView";
import { getPost, posts, type Block } from "@/content/blog";
import { getProject } from "@/content/projects";
import { routing } from "@/i18n/routing";
import { meta } from "@/lib/page";
import { SITE_URL } from "@/lib/site";

type P = { params: Promise<{ locale: string; slug: string }> };
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}
export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  const m = meta(p.title, p.dek, `/blog/${p.slug}`, locale);
  return { ...m, openGraph: { ...m.openGraph, type: "article", publishedTime: p.date, authors: ["Raktim Chandra"] } };
}

async function B({ b }: { b: Block }) {
  const xl = await getX();
  switch (b.t) {
    case "p": return <p>{xl(b.x)}</p>;
    case "h2": return <h2>{xl(b.x)}</h2>;
    case "ul": return <ul>{b.x.map((x) => <li key={x}>{xl(x)}</li>)}</ul>;
    case "quote": return <blockquote className="post__quote display">{xl(b.x)}</blockquote>;
    case "code": return <pre className="post__code"><code>{b.x}</code></pre>;
    case "table":
      return (
        <div className="post__table">
          <table>
            <thead><tr>{b.head.map((h, i) => <th key={i} scope="col">{xl(h)}</th>)}</tr></thead>
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{xl(c)}</th> : <td key={j} className="tabular">{xl(c)}</td>))}</tr>)}</tbody>
          </table>
        </div>
      );
  }
}

export default async function PostPage({ params }: P) {
  const xl = await getX();
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = getPost(slug);
  if (!p) notFound();
  const proj = p.project ? getProject(p.project) : undefined;
  const i = posts.indexOf(p);
  const next = posts[(i + 1) % posts.length];
  const ld = { "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.dek, datePublished: p.date, author: { "@type": "Person", name: "Raktim Chandra", url: SITE_URL }, url: `${SITE_URL}/blog/${p.slug}`, keywords: p.tags.join(", ") };
  return (
    <article className="page wrap post">
      <TrackView event="post_read" props={{ slug: p.slug }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead title={p.title} lede={p.dek} crumb={{ href: "/blog", label: "Blog" }}>
        <p className="muted text-small tabular">{xl.f("{n} min read", { n: p.minutes })} · {p.tags.join(", ")}{proj ? <> · <Link className="link-u" href={`/work/${proj.slug}`}>{xl(proj.title)}{" "}{xl("case study")}</Link></> : null}</p>
      </PageHead>
      <div className="prose post__body">{p.body.map((b, k) => <B key={k} b={b} />)}</div>
      <nav className="sec-foot" style={{ marginTop: "4rem", borderTop: "1px solid color-mix(in oklab, var(--ink) 14%, transparent)", paddingTop: "2rem" }} aria-label={xl("Next post")}>
        <span className="muted">{xl("Next")}</span>
        <Link href={`/blog/${next.slug}`} className="display" style={{ fontSize: "clamp(1.6rem, 1rem + 2.4vw, 3rem)", textDecoration: "none" }}>{xl(next.title)} →</Link>
      </nav>
    </article>
  );
}
