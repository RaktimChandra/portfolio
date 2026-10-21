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
  const locale = await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Blog" lede="Short write-ups on how things were built and measured. Every number links back to the code." />
      {locale !== "en" && <p className="muted text-small" style={{ marginBottom: "2rem" }}>Posts are written in English.</p>}
      <ol className="posts">
        {posts.map((p) => (
          <li key={p.slug} data-reveal>
            <Link href={`/blog/${p.slug}`} className="posts__item">
              <span className="posts__meta muted text-small tabular">{p.minutes} min read · {p.tags.join(", ")}</span>
              <span className="posts__title display">{p.title}</span>
              <span className="posts__dek">{p.dek}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-small muted" style={{ marginTop: "2rem" }}><a className="link-u" href="/rss.xml">RSS feed</a></p>
    </div>
  );
}
