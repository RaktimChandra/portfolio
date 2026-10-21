import { getX } from "@/i18n/x/server";
import PageHead from "@/components/PageHead";
import ForForm from "@/components/ForForm";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Tailored for your company", "Paste your company's website and see the projects and skills that matter to you first.", "/for", locale);
}

export default async function For({ params }: LP) {
  const xl = await getX();
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title={xl("Made for your team")} lede={xl("Paste your company's website. I read your homepage once, match what you do against everything I've built, and give you a page that leads with what matters to you. Nothing is stored.")} />
      <ForForm />
    </div>
  );
}
