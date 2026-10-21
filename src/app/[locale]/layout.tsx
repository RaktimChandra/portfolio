import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { routing } from "@/i18n/routing";
import { fontVars } from "../fonts";
import { BOOT_SCRIPT } from "@/reality/boot";
import RealityCanvas from "@/reality/RealityCanvas";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Overlays from "@/components/Overlays";
import { SITE_URL } from "@/lib/site";
import { profile } from "@/content/profile";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s — ${profile.name}` },
    description: t("description"),
    applicationName: profile.name,
    authors: [{ name: profile.name, url: SITE_URL }],
    creator: profile.name,
    keywords: ["Raktim Chandra", "AI engineer", "ML engineer", "Agentic AI", "GenAI", "Full-stack developer", "SRM", "Chennai", "Freelance developer India", "Portfolio"],
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: { en: "/", hi: "/hi", bn: "/bn", "x-default": "/" },
    },
    openGraph: { type: "website", siteName: profile.name, title: t("title"), description: t("description"), url: SITE_URL, locale },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
    manifest: "/manifest.webmanifest",
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
    appleWebApp: { capable: true, title: "Raktim", statusBarStyle: "black-translucent" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: SITE_URL,
    image: profile.avatar,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "SRM Institute of Science and Technology" },
    sameAs: [profile.github, profile.linkedin],
    knowsAbout: ["Agentic AI", "Machine learning", "Generative AI", "MLOps", "Full-stack development", "Data analytics"],
  };

  return (
    <html lang={locale} data-reality="glass" data-theme="dark" className={fontVars} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#111111" />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      </head>
      <body>
        <a href="#main" className="skip btn">{t("skip")}</a>
        <NextIntlClientProvider>
          <Providers>
            <RealityCanvas />
            <Header />
            <main id="main" tabIndex={-1}>{children}</main>
            <Footer />
            <Overlays />
          </Providers>
        </NextIntlClientProvider>
        {process.env.VERCEL && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
