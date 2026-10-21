import { Link } from "@/i18n/navigation";

export default function PageHead({ title, lede, crumb, children }: { title: string; lede?: React.ReactNode; crumb?: { href: string; label: string }; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      {crumb && (
        <p className="crumbs">
          <Link href={crumb.href} className="link-u">← {crumb.label}</Link>
        </p>
      )}
      <h1 className="page-title display" data-reveal>{title}</h1>
      {lede && <div className="page-lede" data-reveal style={{ ["--i" as string]: 1 }}>{lede}</div>}
      {children}
    </header>
  );
}
