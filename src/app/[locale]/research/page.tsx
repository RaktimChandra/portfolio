import PageHead from "@/components/PageHead";
import { links, papers, research } from "@/content/record";
import { Link } from "@/i18n/navigation";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Research", "Seven IEEE conference papers (2025–26), an IGI Global chapter and UROP research on physics-informed neural networks.", "/research", locale);
}

export default async function Research({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Research" lede="Seven papers at IEEE conferences, three in 2025 and four in 2026, an IGI Global chapter, and undergraduate research on physics-informed networks." />
      <table className="proof">
        <tbody>
          {papers.map((p) => {
            const href = links.ieee[p.key];
            return (
              <tr key={p.key} data-reveal>
                <th scope="row"><Link href={`/research/${p.key.toLowerCase()}`} className="link-u">{p.title}</Link>{href && <> · <a href={href} className="link-u text-small" target="_blank" rel="noopener">IEEE ↗</a></>}</th>
                <td className="muted">{p.venue} · {p.area}</td>
                <td className="tabular muted">{p.year}</td>
              </tr>
            );
          })}
          <tr data-reveal>
            <th scope="row">{links.igiPublication ? <a href={links.igiPublication} className="link-u">{research.igi.title} ↗</a> : research.igi.title}</th>
            <td className="muted">{research.igi.publisher} · {research.igi.note}</td>
            <td className="tabular muted">2026</td>
          </tr>
          <tr data-reveal>
            <th scope="row">UROP {research.urop.id}</th>
            <td className="muted">{research.urop.title} · {research.urop.dept}</td>
            <td className="tabular muted">2025–26</td>
          </tr>
        </tbody>
      </table>
      <div className="prose" style={{ marginTop: "3rem" }}>
        <p className="muted">Co-authors include {research.coauthors}. Full-text links appear here as the proceedings go live on IEEE Xplore.</p>
        <h2>Related work</h2>
        <p>
          <Link href="/work/neurosentry" className="link-u">NeuroSentry</Link> (physics-informed EEG forecasting),{" "}
          <Link href="/work/medgraph-rag" className="link-u">MedGraph-RAG</Link>,{" "}
          <Link href="/work/fake-news-detection" className="link-u">fake-news detection</Link> and{" "}
          <Link href="/work/crypto-prediction" className="link-u">cryptocurrency prediction</Link> share code with the papers.
        </p>
      </div>
    </div>
  );
}
