import { getX } from "@/i18n/x/server";
import PageHead from "@/components/PageHead";
import { uses } from "@/content/record";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Uses", "The tools Raktim Chandra uses every day.", "/uses", locale);
}
export default async function Uses({ params }: LP) {
  const xl = await getX();
  await boot(params);
  return (
    <div className="page wrap">
      <PageHead title={xl("Uses")} lede={xl("The tools on my machine and in my pipelines.")} />
      <div className="card-grid">
        {Object.entries(uses).map(([k, v]) => (
          <section key={k} className="card panel" data-title={k}>
            <h2 className="card__title">{xl(k)}</h2>
            <ul style={{ paddingLeft: "1.1rem", display: "grid", gap: 4 }}>{v.map((x) => <li key={x}>{xl(x)}</li>)}</ul>
          </section>
        ))}
      </div>
    </div>
  );
}
