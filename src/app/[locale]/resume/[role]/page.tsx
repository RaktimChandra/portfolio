import { getX } from "@/i18n/x/server";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import PageHead from "@/components/PageHead";
import Resume from "@/components/Resume";
import PrintButton from "@/components/PrintButton";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { meta } from "@/lib/page";
import { getRoleCV, roleCVs, roleProjects } from "@/content/roles";

type P = { params: Promise<{ locale: string; role: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => roleCVs.map((r) => ({ locale, role: r.slug })));
}
export async function generateMetadata({ params }: P) {
  const { locale, role } = await params;
  const r = getRoleCV(role);
  return r ? meta(`Résumé: ${r.title}`, r.summary, `/resume/${role}`, locale) : {};
}

export default async function RoleResume({ params }: P) {
  const xl = await getX();
  const { locale, role } = await params;
  setRequestLocale(locale);
  const r = getRoleCV(role);
  if (!r) notFound();
  return (
    <div className="page wrap">
      <div className="no-print">
        <PageHead title={`Résumé: ${r.title}`} lede={xl("The same record as the main résumé, ordered for this role: the projects that matter most come first and the relevant skills are marked.")}>
          <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href={`/resume-${r.slug}.pdf`} className="btn" download={`Raktim-Chandra-Resume-${r.slug.toUpperCase()}.pdf`}>{xl("Download PDF")}</a>
            <PrintButton />
            <Link href="/resume" className="btn btn-quiet">{xl("Main résumé")}</Link>
          </p>
          <nav className="role-tabs" aria-label={xl("Other versions")}>
            {roleCVs.map((x) => <Link key={x.slug} href={`/resume/${x.slug}`} className="chip" aria-current={x.slug === r.slug ? "page" : undefined}>{xl(x.title)}</Link>)}
          </nav>
        </PageHead>
      </div>
      {xl.locale !== "en" && <p className="no-print muted text-small">{xl("The résumé itself is in English, as recruiters expect.")}</p>}
      <div className="cv-sheet">
        <Resume projects={roleProjects(r)} summary={r.summary} highlightSkills={r.skills} headline={r.title} />
      </div>
    </div>
  );
}
