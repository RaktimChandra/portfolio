"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useUI } from "@/lib/store";
import { getReality, REALITIES } from "@/reality/realities";
import { MORE, NAV } from "@/lib/site";
import { blip } from "@/lib/sound";

const LOCALES = [
  { id: "en", label: "EN" },
  { id: "hi", label: "हि" },
  { id: "bn", label: "বা" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("chrome");
  const tp = useTranslations("pages");
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const { reality, theme, toggleTheme, open } = useUI();
  const r = getReality(reality);
  const idx = REALITIES.findIndex((x) => x.id === r.id) + 1;
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className={`site-header no-print ${scrolled ? "is-scrolled" : ""}`}>
      <div className="wrap site-header__row">
        <Link href="/" className="site-header__name" aria-label={`Raktim Chandra, ${t("home")}`}>
          <span className="site-header__mark" aria-hidden="true">RC</span>
          <span className="site-header__full">Raktim Chandra</span>
        </Link>

        <nav aria-label="Primary" className="site-header__nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="site-header__link" aria-current={active(n.href) ? "page" : undefined}>
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="site-header__tools">
          <button
            type="button"
            className="chip chip--reality"
            onClick={() => (blip("open"), open("dial"))}
            title={tc("realityHint")}
            aria-label={`${tc("reality")}: ${r.name}. ${tc("realityHint")}`}
          >
            <span className="swatch" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${r.swatch[0]} 0 50%, ${r.swatch[2]} 50%)` }} />
            <span className="chip__label">{r.name}</span>
            <span className="chip__count tabular" aria-hidden="true">{String(idx).padStart(2, "0")}/21</span>
          </button>
          <button
            type="button"
            className="chip chip--icon"
            onClick={() => (blip(), toggleTheme())}
            disabled={r.scheme !== "both"}
            aria-label={`${tc("theme")}: ${theme === "dark" ? tc("dark") : tc("light")}`}
            title={r.scheme !== "both" ? `${r.name} has one scheme` : tc("theme")}
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor" /><g stroke="currentColor" strokeWidth="2" strokeLinecap="round">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />)}</g></svg>
            )}
          </button>
          <div className="lang" role="group" aria-label={tc("language")}>
            {LOCALES.map((l) => (
              <button
                key={l.id}
                type="button"
                lang={l.id}
                aria-pressed={locale === l.id}
                className="lang__btn"
                onClick={() => router.replace(pathname, { locale: l.id })}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button type="button" className="chip chip--kbd" onClick={() => open("palette")} aria-label={tc("palette")}>
            <kbd>⌘K</kbd>
          </button>
          <button type="button" className="chip site-header__menu" aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((m) => !m)}>
            {menu ? t("close") : t("menu")}
          </button>
        </div>
      </div>

      {menu && (
        <div id="mobile-menu" className="mobile-menu panel" data-title="Menu">
          <nav aria-label="Mobile" className="mobile-menu__grid">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="mobile-menu__big display">{t(n.key)}</Link>
            ))}
            <div className="lang" role="group" aria-label={tc("language")}>
              {LOCALES.map((l) => (
                <button key={l.id} type="button" lang={l.id} aria-pressed={locale === l.id} className="lang__btn" onClick={() => router.replace(pathname, { locale: l.id })}>{l.label}</button>
              ))}
            </div>
            <div className="mobile-menu__more">
              {MORE.map((n) => (
                <Link key={n.href} href={n.href} className="link-u">{tp(n.key)}</Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
