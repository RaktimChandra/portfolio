import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { projects } from "@/content/projects";

const PAGES = ["", "/work", "/experience", "/services", "/research", "/achievements", "/certifications", "/about", "/resume", "/contact", "/skills", "/open-source", "/match", "/scope", "/brief", "/now", "/uses", "/lab", "/status"];

export default function sitemap(): MetadataRoute.Sitemap {
  const all = [...PAGES, ...projects.map((p) => `/work/${p.slug}`)];
  return all.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/work/") ? 0.6 : 0.8,
    alternates: { languages: { en: `${SITE_URL}${path}`, hi: `${SITE_URL}/hi${path}`, bn: `${SITE_URL}/bn${path}` } },
  }));
}
