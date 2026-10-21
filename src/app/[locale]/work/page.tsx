import { getTranslations } from "next-intl/server";
import PageHead from "@/components/PageHead";
import WorkIndex from "@/components/WorkIndex";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Work", "More than forty projects by Raktim Chandra across agentic AI, machine learning, full-stack systems, testing and blockchain.", "/work", locale);
}

export default async function Work({ params }: LP) {
  await boot(params);
  const t = await getTranslations("work");
  return (
    <div className="page wrap">
      <PageHead title={t("title")} lede={t("intro")} />
      <WorkIndex />
    </div>
  );
}
