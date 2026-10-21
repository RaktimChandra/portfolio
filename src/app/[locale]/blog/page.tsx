import { getX } from "@/i18n/x/server";
import { Link } from "@/i18n/navigation";
import PageHead from "@/components/PageHead";
import { posts } from "@/content/blog";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return { ...meta("Blog", "Short write-ups by Raktim Chandra on entity resolution, agentic systems, RAG, testing and honest metrics.", "/blog", locale), alternates: { types: { "application/rss+xml": "/rss.xml" } } };
}
export default async function Blog({ params }: LP) {
  const xl = await getX();
  const locale = await boot(params);
  return (
    <div className="page wrap">
      <PageHead title={xl("Blog")} lede={xl("Short write-ups on how things were built and measured. Every number links back to the code.")} />
      {locale !== "en" && <p className="muted text-small" style={{ marginBottom: "2rem" }}>{xl("Posts are written in English.")}</p>}
      <ol className="posts">
        {posts.map((p) => (
          <li key={p.slug} data-reveal>
            <Link href={`/blog/${p.slug}`} className="posts__item">
              <span className="posts__meta muted text-small tabular">{xl.f("{n} min read", { n: p.minutes })} · {p.tags.join(", ")}</span>
              <span className="posts__title display">{xl(p.title)}</span>
              <span className="posts__dek">{xl(p.dek)}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-small muted" style={{ marginTop: "2rem" }}><a className="link-u" href="/rss.xml">{xl("RSS feed")}</a></p>
    </div>
  );
}
