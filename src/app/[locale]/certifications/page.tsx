import PageHead from "@/components/PageHead";
import CertWall from "@/components/CertWall";
import { certifications, links } from "@/content/record";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Certifications", "AWS, Azure, Oracle OCI, IBM, Google, Databricks, SAP, Cisco, Fortinet and more.", "/certifications", locale);
}

export default async function Certifications({ params }: LP) {
  await boot(params);
  const groups = [...new Set(certifications.map((c) => c.group))];
  return (
    <div className="page wrap">
      <PageHead title="Certifications" lede={`${certifications.length} completed, across cloud, AI, data, development and security.`} />
      <CertWall />
      <h2 className="sec-title display" style={{ marginTop: "3rem" }}>The list</h2>
      {groups.map((g) => (
        <section key={g} className="section" style={{ paddingBlock: "1.5rem" }}>
          <h2 className="text-lead" style={{ fontWeight: 650, marginBottom: "1rem" }}>{g}</h2>
          <ul className="card-grid" style={{ listStyle: "none", padding: 0 }}>
            {certifications.filter((c) => c.group === g).map((c) => {
              const href = links.cert[c.name];
              return (
                <li key={c.name} className="card panel" data-title={c.issuer} data-reveal>
                  <p className="card__meta">{c.issuer}</p>
                  <p className="card__title" style={{ fontSize: "1.1rem" }}>{c.name}</p>
                  {href ? <a className="link-u text-small" href={href} target="_blank" rel="noopener">Verify ↗</a> : <span className="text-small muted">Verification link on request</span>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
