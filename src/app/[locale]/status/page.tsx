import PageHead from "@/components/PageHead";
import StatusBoard from "@/components/StatusBoard";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Status", "Live health checks for every deployed project.", "/status", locale);
}
export default async function Status({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Status" lede="Every project with a live demo, checked from the server when you open this page. Some run on free tiers that sleep when idle; a slow first answer is the host waking up." />
      <StatusBoard />
    </div>
  );
}
