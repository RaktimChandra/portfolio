import { Suspense } from "react";
import PageHead from "@/components/PageHead";
import ProposalDoc from "@/components/ProposalDoc";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return { ...meta("Project proposal", "Turn a scoped idea into a printable proposal.", "/proposal", locale), robots: { index: false } };
}

export default async function Proposal({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <div className="no-print"><PageHead title="Your proposal" lede="Adjust the details, then save it as a PDF to share with your team." /></div>
      <Suspense fallback={null}><ProposalDoc /></Suspense>
    </div>
  );
}
