import { posts } from "@/content/blog";
import { ogCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Blog post by Raktim Chandra";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  return ogCard({ kicker: `Notes · ${p?.minutes ?? ""} min read`, title: p?.title ?? "Notes", sub: p?.dek });
}
