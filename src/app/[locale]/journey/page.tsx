import PageHead from "@/components/PageHead";
import Journey from "@/components/Journey";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Journey", "Fly through Raktim Chandra's timeline in 3D: from starting at SRM in 2023 to internships, papers, hackathons and the systems he builds now.", "/journey", locale);
}
export default async function JourneyPage({ params }: LP) {
  await boot(params);
  return (
    <div className="page">
      <div className="wrap">
        <PageHead title="Journey" lede="2023 to 2027 as a flight path. Scroll, and the camera follows the line through every role, paper, win and build." />
      </div>
      <Journey />
    </div>
  );
}
