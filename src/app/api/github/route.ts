import { NextResponse } from "next/server";

export const revalidate = 900;

type Ev = { type: string; created_at: string; repo: { name: string }; payload?: { commits?: { message: string }[]; ref_type?: string; action?: string; pull_request?: { title?: string } } };

export async function GET() {
  try {
    const headers: Record<string, string> = { accept: "application/vnd.github+json", "user-agent": "raktimchandra-portfolio" };
    if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const r = await fetch("https://api.github.com/users/RaktimChandra/events/public?per_page=100", { headers, next: { revalidate: 900 } });
    if (!r.ok) return NextResponse.json({ ok: false }, { status: 200 });
    const events = (await r.json()) as Ev[];
    const days: Record<string, number> = {};
    for (const e of events) {
      const d = e.created_at.slice(0, 10);
      days[d] = (days[d] ?? 0) + (e.type === "PushEvent" ? Math.max(1, e.payload?.commits?.length ?? 1) : 1);
    }
    const recent = events.slice(0, 8).map((e) => {
      const repo = e.repo.name.replace(/^RaktimChandra\//, "");
      let what = e.type.replace(/Event$/, "");
      if (e.type === "PushEvent") what = e.payload?.commits?.[0]?.message?.split("\n")[0] ?? "Pushed commits";
      if (e.type === "CreateEvent") what = `Created ${e.payload?.ref_type ?? "branch"}`;
      if (e.type === "PullRequestEvent") what = `${e.payload?.action ?? "Updated"} PR: ${e.payload?.pull_request?.title ?? ""}`;
      if (e.type === "WatchEvent") what = "Starred";
      return { repo, what: what.slice(0, 110), at: e.created_at, type: e.type };
    });
    return NextResponse.json({ ok: true, recent, days }, { headers: { "cache-control": "s-maxage=900, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
