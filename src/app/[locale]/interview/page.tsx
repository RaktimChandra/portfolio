import PageHead from "@/components/PageHead";
import InterviewMode from "@/components/InterviewMode";
import { interview, starText } from "@/content/interview";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Interview mode", "The questions recruiters ask, answered by Raktim Chandra in STAR form with evidence from his real projects.", "/interview", locale);
}
export default async function InterviewPage({ params }: LP) {
  await boot(params);
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: interview.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: starText(x) } })),
  };
  return (
    <div className="page wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <PageHead title="Interview mode" lede="Skip the first round. The twelve questions recruiters ask most, answered the way Raktim would: situation, task, action, result, with a link to the evidence for every claim." />
      <InterviewMode />
    </div>
  );
}
