import { getX } from "@/i18n/x/server";
import PageHead from "@/components/PageHead";
import Matcher from "@/components/Matcher";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Job matcher", "Paste a job description and get Raktim Chandra's skill coverage, honest gaps, the most relevant projects and a tailored one-page résumé.", "/match", locale);
}
export default async function MatchPage({ params }: LP) {
  const xl = await getX();
  await boot(params);
  return (
    <div className="page wrap">
      <div className="no-print">
        <PageHead title={xl("Job matcher")} lede={xl("Paste a job post. You get skill coverage, the gaps stated plainly, the five most relevant projects and a résumé tailored to the role. It runs in your browser; nothing is sent anywhere.")} />
      </div>
      <Matcher />
    </div>
  );
}
