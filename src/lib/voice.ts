/** Speak text: the cloned voice when the server has one, otherwise the best local voice. Resolves when speech ends. */
let current: HTMLAudioElement | null = null;

export function stopSpeaking() {
  try { current?.pause(); current = null; window.speechSynthesis.cancel(); } catch {}
}

function pickVoice() {
  const vs = window.speechSynthesis.getVoices();
  return (
    vs.find((v) => v.lang === "en-IN" && /male|ravi|prabhat|rishi/i.test(v.name)) ||
    vs.find((v) => v.lang === "en-IN") ||
    vs.find((v) => /^en-(GB|US)/.test(v.lang) && /natural|neural|google/i.test(v.name)) ||
    vs.find((v) => v.lang.startsWith("en"))
  );
}

export type Speaker = "cloned" | "browser";

export async function speak(text: string, onLevel?: (v: number) => void): Promise<Speaker> {
  stopSpeaking();
  const clean = text.replace(/https?:\/\/\S+/g, "the link on screen").replace(/[*_#`]/g, "");
  try {
    const r = await fetch("/api/voice", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: clean }) });
    if (r.status === 200) {
      const url = URL.createObjectURL(await r.blob());
      const a = new Audio(url);
      current = a;
      let raf = 0;
      if (onLevel) {
        try {
          const ctx = new AudioContext();
          const src = ctx.createMediaElementSource(a);
          const an = ctx.createAnalyser();
          an.fftSize = 256;
          src.connect(an); an.connect(ctx.destination);
          const buf = new Uint8Array(an.frequencyBinCount);
          const tick = () => { an.getByteFrequencyData(buf); onLevel(buf.reduce((s, x) => s + x, 0) / buf.length / 128); raf = requestAnimationFrame(tick); };
          tick();
        } catch {}
      }
      await new Promise<void>((res) => { a.onended = a.onerror = () => res(); a.play().catch(() => res()); });
      cancelAnimationFrame(raf); onLevel?.(0); URL.revokeObjectURL(url);
      return "cloned";
    }
  } catch {}
  await new Promise<void>((res) => {
    try {
      const u = new SpeechSynthesisUtterance(clean);
      const v = pickVoice();
      if (v) u.voice = v;
      u.lang = v?.lang ?? "en-IN";
      u.rate = 1.03;
      u.onboundary = () => { onLevel?.(0.9); setTimeout(() => onLevel?.(0.3), 120); };
      u.onend = u.onerror = () => (onLevel?.(0), res());
      window.speechSynthesis.speak(u);
    } catch { res(); }
  });
  return "browser";
}
