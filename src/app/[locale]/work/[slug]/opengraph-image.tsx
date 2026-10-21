import { getProject } from "@/content/projects";
import { ogCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Project case study by Raktim Chandra";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  const m = p?.metrics?.[0];
  return ogCard({ kicker: "Case study", title: p?.title ?? "Project", sub: p?.tagline, foot: m ? `${m.value} · ${m.label}` : p?.stack.slice(0, 4).join(" · ") });
}
