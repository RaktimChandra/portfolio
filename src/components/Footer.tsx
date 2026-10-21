import { getX } from "@/i18n/x/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { profile } from "@/content/profile";
import { MORE, NAV } from "@/lib/site";

export default async function Footer() {
  const xl = await getX();
  const t = await getTranslations("nav");
  const tp = await getTranslations("pages");
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p className="site-footer__name display" aria-label={profile.name}>
          <span>{xl("Raktim")}</span> <span>{xl("Chandra")}</span>
        </p>
        <div className="site-footer__grid">
          <div>
            <p className="text-lead">{xl(profile.oneLiner)}</p>
            <p className="muted">{xl(profile.availability)}</p>
          </div>
          <ul className="site-footer__list">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href} className="link-u">{t(n.key)}</Link></li>
            ))}
          </ul>
          <ul className="site-footer__list">
            {MORE.map((n) => (
              <li key={n.href}><Link href={n.href} className="link-u">{tp(n.key)}</Link></li>
            ))}
          </ul>
          <ul className="site-footer__list">
            <li><a className="link-u" href={`mailto:${profile.email}`}>{xl(profile.email)}</a></li>
            <li><a className="link-u" href={profile.phoneHref}>{xl(profile.phone)}</a></li>
            <li><a className="link-u" href={profile.github} rel="me noopener" target="_blank">{xl("GitHub")}</a></li>
            <li><a className="link-u" href={profile.linkedin} rel="me noopener" target="_blank">{xl("LinkedIn")}</a></li>
          </ul>
        </div>
        <p className="site-footer__base text-small muted">
          <span>© {new Date().getFullYear()} {xl(profile.name)}. {xl("Built by hand with Next.js, WebGL and twenty-one ways of drawing the same page.")}</span>
          <span>{xl("Visit stats via PostHog; Do Not Track is respected.")}{" "}<Link href="/privacy" className="link-u">{xl("Privacy")}</Link></span>
          <span className="site-footer__keys"><span><kbd>R</kbd> {xl("realities")}</span> <span><kbd>/</kbd> {xl("search")}</span> <span><kbd>`</kbd> {xl("terminal")}</span></span>
        </p>
      </div>
    </footer>
  );
}
