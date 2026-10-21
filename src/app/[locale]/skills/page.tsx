import PageHead from "@/components/PageHead";
import SkillGalaxyLazy from "@/components/SkillGalaxyLazy";
import { skills } from "@/content/record";
import { projects } from "@/content/projects";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Skills", "Languages, frameworks and tools, each linked to the projects where it was used.", "/skills", locale);
}
export default async function Skills({ params }: LP) {
  await boot(params);
  const used = (s: string) => projects.filter((p) => p.stack.some((x) => x.toLowerCase().includes(s.toLowerCase().split(" ")[0]))).length;
  const total = Object.values(skills).flat().length;
  return (
    <div className="page wrap">
      <PageHead title="Skills" lede={`${total} skills in nine groups. The number beside each is how many projects on this site use it.`} />
      <SkillGalaxyLazy />
      <div className="card-grid">
        {Object.entries(skills).map(([g, list]) => (
          <section key={g} className="card panel" data-title={g} data-reveal>
            <h2 className="card__title">{g}</h2>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {list.map((s) => {
                const n = used(s);
                return <li key={s} className="tag">{s}{n ? <span className="muted tabular"> · {n}</span> : null}</li>;
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
