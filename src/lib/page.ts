import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { tx } from "@/i18n/x/server";

export type LP = { params: Promise<{ locale: string }> };
export const localeParams = () => routing.locales.map((locale) => ({ locale }));

export async function boot(params: LP["params"]) {
  const { locale } = await params;
  setRequestLocale(locale);
  return locale;
}

export function meta(title: string, description: string, path: string, locale = "en"): Metadata {
  title = tx(locale, title);
  description = tx(locale, description);
  const prefix = locale === "en" ? "" : `/${locale}`;
  return {
    title,
    description,
    alternates: { canonical: `${prefix}${path}`, languages: { en: path, hi: `/hi${path}`, bn: `/bn${path}` } },
    openGraph: { title, description, url: `${prefix}${path}` },
  };
}
