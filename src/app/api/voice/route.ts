import { NextResponse } from "next/server";

/**
 * Speaks a twin answer in Raktim's cloned voice through ElevenLabs.
 * Needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID. Without them it answers 204 and the browser voice is used.
 */
const hits = new Map<string, { n: number; t: number }>();

export async function POST(req: Request) {
  const key = process.env.ELEVENLABS_API_KEY, voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) return new NextResponse(null, { status: 204 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  const now = Date.now(), h = hits.get(ip);
  if (h && now - h.t < 3600_000 && h.n >= 40) return new NextResponse(null, { status: 429 });
  hits.set(ip, h && now - h.t < 3600_000 ? { n: h.n + 1, t: h.t } : { n: 1, t: now });
  let text = "";
  try { text = String(((await req.json()) as { text?: string }).text ?? "").slice(0, 900); } catch {}
  if (!text.trim()) return new NextResponse(null, { status: 400 });
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_flash_v2_5", voice_settings: { stability: 0.5, similarity_boost: 0.8 } }),
  });
  if (!r.ok || !r.body) return new NextResponse(null, { status: 204 });
  return new NextResponse(r.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}
