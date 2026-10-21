import { getX } from "@/i18n/x/server";
import PageHead from "@/components/PageHead";
import Resume from "@/components/Resume";
import PrintButton from "@/components/PrintButton";
import { Link } from "@/i18n/navigation";
import { boot, localeParams, meta, type LP } from "@/lib/page";
import { roleCVs } from "@/content/roles";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Résumé", "Raktim Chandra's résumé: AI, ML and full-stack engineer, B.Tech CSE at SRM (2027), 11 internships, 7 IEEE papers.", "/resume", locale);
}

export default async function ResumePage({ params }: LP) {
  const xl = await getX();
  await boot(params);
  return (
    <div className="page wrap">
      <div className="no-print">
        <PageHead title={xl("Résumé")} lede={xl("Download the PDF, print it, or paste a job description into the matcher for a tailored version.")}>
          <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href="/resume.pdf" className="btn" download="Raktim-Chandra-Resume.pdf">{xl("Download PDF")}</a>
            <PrintButton />
            <Link href="/match" className="btn btn-quiet">{xl("Tailor to a job")}</Link>
          </p>
          <nav className="role-tabs" aria-label={xl("Role versions")}>
            <span className="text-small muted">{xl("By role:")}</span>
            {roleCVs.map((r) => <Link key={r.slug} href={`/resume/${r.slug}`} className="chip">{xl(r.title)}</Link>)}
          </nav>
        </PageHead>
      </div>
      <div className="cv-sheet">
        <Resume />
      </div>
    </div>
  );
}
