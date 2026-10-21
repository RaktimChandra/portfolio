import Brief from "@/components/Brief";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Thirty-second brief", "Raktim Chandra in five slides and thirty seconds.", "/brief", locale);
}
export default async function BriefPage({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <h1 className="sr-only">Thirty-second brief</h1>
      <Brief />
    </div>
  );
}
