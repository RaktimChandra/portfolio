import PageHead from "@/components/PageHead";
import Scoper from "@/components/Scoper";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Project scoper", "Describe a project in two lines and get a rough timeline, milestones and stack from Raktim Chandra.", "/scope", locale);
}
export default async function Scope({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title="Project scoper" lede="Describe the idea, pick what kind of work it is, and get a rough timeline and milestones. Send it to me and I'll reply with a real plan." />
      <Scoper />
    </div>
  );
}
