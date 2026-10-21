import { NextResponse } from "next/server";

/**
 * Visitor countries for the globe, from PostHog (EU), last 90 days.
 * Needs POSTHOG_PERSONAL_API_KEY (scope: query:read). Without it the globe shows places only.
 */
export const revalidate = 3600;

export async function GET() {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  if (!key) return NextResponse.json({ countries: [], live: false });
  try {
    const r = await fetch("https://eu.posthog.com/api/projects/315035/query/", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query: "SELECT properties.$geoip_country_code AS cc, count(DISTINCT person_id) AS v FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 90 DAY AND cc IS NOT NULL GROUP BY cc ORDER BY v DESC LIMIT 80",
        },
      }),
      next: { revalidate: 3600 },
    });
    if (!r.ok) return NextResponse.json({ countries: [], live: false });
    const j = (await r.json()) as { results?: [string, number][] };
    return NextResponse.json({ countries: (j.results ?? []).map(([cc, v]) => ({ cc, v })), live: true }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
  } catch {
    return NextResponse.json({ countries: [], live: false });
  }
}
