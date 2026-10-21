import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

/**
 * Guest book on Supabase (project portfolio-guestbook). The publishable key is safe to ship:
 * row-level security allows reading visible notes and inserting new ones only, the IP hash column
 * is never readable, links are refused by a constraint, and a trigger rate-limits in the database.
 * Hide a note by setting hidden = true in the Supabase table editor.
 */
const URL_ = process.env.SUPABASE_URL ?? "https://hizirkceoqtyflydqyqk.supabase.co";
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_5vSGcWmaUQhjSClrnNSV0A_86sHc7e3";
const H = { apikey: KEY, "Content-Type": "application/json" };

export async function GET() {
  try {
    const r = await fetch(`${URL_}/rest/v1/guestbook?select=id,name,note,place,created_at&order=created_at.desc&limit=80`, { headers: H, next: { revalidate: 30 } });
    if (!r.ok) return NextResponse.json({ notes: [], ok: false });
    return NextResponse.json({ notes: await r.json(), ok: true }, { headers: { "Cache-Control": "public, s-maxage=30" } });
  } catch {
    return NextResponse.json({ notes: [], ok: false });
  }
}

export async function POST(req: Request) {
  let b: { name?: string; note?: string; place?: string; website?: string } = {};
  try { b = await req.json(); } catch {}
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: bots fill every field
  const name = String(b.name ?? "").trim().slice(0, 40);
  const note = String(b.note ?? "").trim().slice(0, 280);
  const place = String(b.place ?? "").trim().slice(0, 40) || null;
  if (!name || note.length < 2) return NextResponse.json({ ok: false, error: "Add a name and a note." }, { status: 400 });
  if (/(https?:\/\/|www\.)/i.test(note + name)) return NextResponse.json({ ok: false, error: "Links aren't allowed in the guest book." }, { status: 400 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const day = new Date().toISOString().slice(0, 10);
  const ip_hash = createHash("sha256").update(`${ip}|${day}|rc-guestbook`).digest("hex").slice(0, 32);
  const r = await fetch(`${URL_}/rest/v1/guestbook`, { method: "POST", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify({ name, note, place, ip_hash }) });
  if (r.ok) return NextResponse.json({ ok: true });
  const t = await r.text();
  const error = /slow down/.test(t) ? "You've signed a few times already. Try again in a few minutes." : /busy/.test(t) ? "The book is busy right now. Try again later." : /no_links/.test(t) ? "Links aren't allowed in the guest book." : "Couldn't save that. Try again.";
  return NextResponse.json({ ok: false, error }, { status: r.status === 400 ? 400 : 429 });
}
