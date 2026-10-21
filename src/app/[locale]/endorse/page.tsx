import PageHead from "@/components/PageHead";
import EndorseForm from "@/components/EndorseForm";
import Endorsements from "@/components/Endorsements";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return { ...meta("Endorse Raktim", "Worked with Raktim Chandra? Leave an endorsement.", "/endorse", locale), robots: { index: false } };
}
export default async function Endorse({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Worked with Raktim?" lede="If you managed him, led his team, hired him as a freelancer or built something alongside him, a few honest sentences help more than you'd think. Two minutes, and you decide whether it's public." />
      <EndorseForm />
      <Endorsements />
    </div>
  );
}
