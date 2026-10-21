import { getX } from "@/i18n/x/server";
import PageHead from "@/components/PageHead";
import { profile } from "@/content/profile";
import { projects, repoUrl } from "@/content/projects";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Open source", "Raktim Chandra's open-source contributions and public repositories.", "/open-source", locale);
}
export default async function OpenSource({ params }: LP) {
  const xl = await getX();
  await boot(params);
  const pub = projects.filter((p) => p.repo);
  return (
    <div className="page wrap">
      <PageHead title={xl("Open source")} lede={xl.f("{n} public repositories with tests and CI, and contributions to other projects.", { n: pub.length })} />
      <section className="prose" style={{ marginBottom: "3rem" }}>
        <h2>{xl("Contributions")}</h2>
        <ul>
          <li><b>{xl("Hushh")}</b>{" "}{xl("— consent-scoped multi-provider LLM adapter for the Kai agent, merged as PR #784. 1344 of 1344 tests and all nine CI checks green.")}</li>
          <li>{xl("Fixes, documentation and small features across other open-source projects; the full list is on my")}{" "}<a className="link-u" href={profile.github} target="_blank" rel="noopener">{xl("GitHub profile")}</a>.</li>
        </ul>
      </section>
      <h2 className="sec-title display" style={{ marginBottom: "1.5rem" }}>{xl("Public repositories")}</h2>
      <table className="proof">
        <tbody>
          {pub.map((p) => (
            <tr key={p.slug}>
              <th scope="row"><a className="link-u" href={repoUrl(p)} target="_blank" rel="noopener">{xl(p.repo)} ↗</a></th>
              <td className="muted">{xl(p.tagline)}</td>
              <td className="tabular muted">{xl(p.year)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
