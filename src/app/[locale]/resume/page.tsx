import PageHead from "@/components/PageHead";
import Resume from "@/components/Resume";
import PrintButton from "@/components/PrintButton";
import { Link } from "@/i18n/navigation";
import { boot, localeParams, meta, type LP } from "@/lib/page";

export const generateStaticParams = localeParams;
export async function generateMetadata({ params }: LP) {
  const { locale } = await params;
  return meta("Résumé", "Raktim Chandra's résumé: AI, ML and full-stack engineer, B.Tech CSE at SRM (2027), 11 internships, 7 IEEE papers.", "/resume", locale);
}

export default async function ResumePage({ params }: LP) {
  await boot(params);
  return (
    <div className="page wrap">
      <div className="no-print">
        <PageHead title="Résumé" lede="Download the PDF, print it, or paste a job description into the matcher for a tailored version.">
          <p style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href="/resume.pdf" className="btn" download="Raktim-Chandra-Resume.pdf">Download PDF</a>
            <PrintButton />
            <Link href="/match" className="btn btn-quiet">Tailor to a job</Link>
          </p>
        </PageHead>
      </div>
      <div className="cv-sheet">
        <Resume />
      </div>
    </div>
  );
}
