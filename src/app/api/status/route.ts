import { NextResponse } from "next/server";
import { projects } from "@/content/projects";

export const dynamic = "force-dynamic";

let cache: { at: number; body: unknown } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < 5 * 60_000) return NextResponse.json(cache.body);
  const targets = projects.filter((p) => p.demo).map((p) => ({ slug: p.slug, title: p.title, url: p.demo! }));
  const results = await Promise.all(
    targets.map(async (t) => {
      const start = Date.now();
      try {
        const r = await fetch(t.url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(8000), cache: "no-store" });
        return { ...t, ok: r.status < 500, code: r.status, ms: Date.now() - start };
      } catch {
        return { ...t, ok: false, code: 0, ms: Date.now() - start };
      }
    }),
  );
  const body = { checkedAt: new Date().toISOString(), results };
  cache = { at: Date.now(), body };
  return NextResponse.json(body, { headers: { "cache-control": "s-maxage=300, stale-while-revalidate=600" } });
}
