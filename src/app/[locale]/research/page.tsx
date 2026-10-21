import { getX } from "@/i18n/x/server";
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
  const xl = await getX();
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title={xl("Research")} lede={xl("Seven papers at IEEE conferences, three in 2025 and four in 2026, an IGI Global chapter, and undergraduate research on physics-informed networks.")} />
      <table className="proof">
        <tbody>
          {papers.map((p) => {
            const href = links.ieee[p.key];
            return (
              <tr key={p.key} data-reveal>
                <th scope="row"><Link href={`/research/${p.key.toLowerCase()}`} className="link-u">{xl(p.title)}</Link>{href && <> · <a href={href} className="link-u text-small" target="_blank" rel="noopener">{xl("IEEE ↗")}</a></>}</th>
                <td className="muted">{xl(p.venue)} · {xl(p.area)}</td>
                <td className="tabular muted">{xl(p.year)}</td>
              </tr>
            );
          })}
          <tr data-reveal>
            <th scope="row">{links.igiPublication ? <a href={links.igiPublication} className="link-u">{xl(research.igi.title)} ↗</a> : xl(research.igi.title)}</th>
            <td className="muted">{xl(research.igi.publisher)} · {xl(research.igi.note)}</td>
            <td className="tabular muted">2026</td>
          </tr>
          <tr data-reveal>
            <th scope="row">{xl("UROP")}{" "}{xl(research.urop.id)}</th>
            <td className="muted">{xl(research.urop.title)} · {xl(research.urop.dept)}</td>
            <td className="tabular muted">2025–26</td>
          </tr>
        </tbody>
      </table>
      <div className="prose" style={{ marginTop: "3rem" }}>
        <p className="muted">{xl.f("Co-authors include {names}. Full-text links appear here as the proceedings go live on IEEE Xplore.", { names: research.coauthors })}</p>
        <h2>{xl("Related work")}</h2>
        <p>
          {xl("These projects share code with the papers:")}{" "}
          <Link href="/work/neurosentry" className="link-u">NeuroSentry</Link> ({xl("physics-informed EEG forecasting")}),{" "}
          <Link href="/work/medgraph-rag" className="link-u">MedGraph-RAG</Link>,{" "}
          <Link href="/work/fake-news-detection" className="link-u">{xl("fake-news detection")}</Link>,{" "}
          <Link href="/work/crypto-prediction" className="link-u">{xl("cryptocurrency prediction")}</Link>.
        </p>
      </div>
    </div>
  );
}
