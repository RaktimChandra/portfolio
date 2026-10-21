import { getX } from "@/i18n/x/server";
import PageHead from "@/components/PageHead";
import { now } from "@/content/record";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Now", "What Raktim Chandra is working on right now.", "/now", locale);
}
export default async function Now({ params }: LP) {
  const xl = await getX();
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title={xl("Now")} lede={`Updated ${now.updated}.`} />
      <ol className="poster" style={{ listStyle: "none" }}>
        {now.items.map((x, i) => (
          <li key={x} className="poster__line" data-reveal>
            <span className="poster__n tabular muted">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-lead" style={{ gridColumn: "2 / -1" }}>{xl(x)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
