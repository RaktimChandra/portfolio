import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import PenaltyGame from "@/components/PenaltyGame";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="page wrap">
      <header className="page-head">
        <p className="crumbs tabular">404</p>
        <h1 className="page-title display">{t("title")}</h1>
        <p className="page-lede">{t("body")}</p>
      </header>
      <PenaltyGame />
      <p style={{ marginTop: "2rem" }}><Link href="/" className="btn">{t("home")}</Link></p>
    </div>
  );
}
