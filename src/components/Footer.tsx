import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { profile } from "@/content/profile";
import { MORE, NAV } from "@/lib/site";

export default async function Footer() {
  const t = await getTranslations("nav");
  const tp = await getTranslations("pages");
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p className="site-footer__name display" aria-label={profile.name}>
          <span>Raktim</span> <span>Chandra</span>
        </p>
        <div className="site-footer__grid">
          <div>
            <p className="text-lead">{profile.oneLiner}</p>
            <p className="muted">{profile.availability}</p>
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
            <li><a className="link-u" href={`mailto:${profile.email}`}>{profile.email}</a></li>
            <li><a className="link-u" href={profile.phoneHref}>{profile.phone}</a></li>
            <li><a className="link-u" href={profile.github} rel="me noopener" target="_blank">GitHub</a></li>
            <li><a className="link-u" href={profile.linkedin} rel="me noopener" target="_blank">LinkedIn</a></li>
          </ul>
        </div>
        <p className="site-footer__base text-small muted">
          <span>© {new Date().getFullYear()} {profile.name}. Built by hand with Next.js, WebGL and twenty-one ways of drawing the same page.</span>
          <span>Anonymous visit stats via PostHog; Do Not Track is respected.</span>
          <span>Press <kbd>R</kbd> for realities, <kbd>/</kbd> to search, <kbd>`</kbd> for a terminal.</span>
        </p>
      </div>
    </footer>
  );
}
