"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUI } from "@/lib/store";
import { getProject } from "@/content/projects";
import { blip } from "@/lib/sound";
import { track } from "@/lib/analytics";

type QA = { q: string; a?: string; shown?: number; sources?: { title: string; href: string }[]; followups?: string[]; projects?: string[]; err?: boolean; mode?: string };

const SUGGEST = ["Tell me about yourself.", "What's the hardest problem he solved?", "What has he built with agents?", "Which projects use Kafka?", "Tell me about the Amazon ML Challenge", "Is he open to full-time roles?", "How do I hire him for a project?"];

type SR = { start: () => void; stop: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; onerror: () => void; lang: string; interimResults: boolean };

/** The AI twin. `variant="headline"` is the large type input on the home page. */
export default function TwinBox({ variant = "panel", initial = "" }: { variant?: "panel" | "headline"; initial?: string }) {
  const t = useTranslations("home");
  const [value, setValue] = useState("");
  const [items, setItems] = useState<QA[]>([]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);
  const [canVoice, setCanVoice] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const sent = useRef(false);
  const rec = useRef<SR | null>(null);

  useEffect(() => {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    setCanVoice(!!(W.SpeechRecognition || W.webkitSpeechRecognition));
  }, []);

  // Typewriter reveal of the newest answer.
  useEffect(() => {
    const last = items[items.length - 1];
    if (!last?.a || (last.shown ?? 0) >= last.a.length) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(() => {
      setItems((x) => x.map((it, i) => (i === x.length - 1 ? { ...it, shown: reduce ? it.a!.length : Math.min(it.a!.length, (it.shown ?? 0) + 6) } : it)));
    }, 12);
    return () => clearTimeout(id);
  }, [items]);

  const speak = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, "the link on screen"));
      u.lang = "en-IN";
      u.rate = 1.04;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const ask = async (q: string) => {
    q = q.trim();
    if (!q || busy) return;
    blip("open");
    setBusy(true);
    setValue("");
    const history = items.filter((i) => i.a).slice(-3).map((i) => ({ q: i.q, a: i.a }));
    setItems((x) => [...x, { q }]);
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q, history }) });
      const j = await r.json();
      const a: string = j.answer ?? j.error;
      setItems((x) => x.map((it, i) => (i === x.length - 1 ? { ...it, a, shown: 0, sources: j.sources, followups: j.followups, projects: j.projects, err: !r.ok, mode: j.mode } : it)));
      track("twin_question", { q: q.slice(0, 120), intent: j.intent, mode: j.mode, variant });
      if (speakOn && r.ok) speak(a);
    } catch {
      setItems((x) => x.map((it, i) => (i === x.length - 1 ? { ...it, a: "The connection dropped. Try again.", shown: 0, err: true } : it)));
    } finally {
      setBusy(false);
    }
  };

  const listen = () => {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening) {
      rec.current?.stop();
      return;
    }
    const r = new Ctor();
    r.lang = "en-IN";
    r.interimResults = true;
    let finalText = "";
    r.onresult = (e) => {
      finalText = Array.from(e.results).map((x) => x[0].transcript).join(" ");
      setValue(finalText);
    };
    r.onend = () => {
      setListening(false);
      if (finalText.trim()) ask(finalText);
    };
    r.onerror = () => setListening(false);
    rec.current = r;
    setListening(true);
    setSpeakOn(true);
    r.start();
  };

  useEffect(() => {
    if (initial && !sent.current) {
      sent.current = true;
      ask(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    const el = scroller.current;
    if (el && variant === "panel") el.scrollTop = el.scrollHeight;
  }, [items, variant]);

  const last = items[items.length - 1];

  return (
    <div className={`twin twin--${variant}`}>
      <form
        className="twin__form"
        onSubmit={(e) => {
          e.preventDefault();
          ask(value);
        }}
      >
        <label htmlFor={`twin-${variant}`} className="sr-only">{t("twinTitle")}</label>
        <input
          id={`twin-${variant}`}
          className={variant === "headline" ? "twin__input display" : "twin__input"}
          placeholder={listening ? "Listening…" : t("twinPlaceholder")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          enterKeyHint="send"
          maxLength={500}
          autoFocus={variant === "panel"}
        />
        {canVoice && (
          <button type="button" className={`chip chip--icon twin__mic ${listening ? "is-on" : ""}`} onClick={listen} aria-pressed={listening} aria-label={listening ? "Stop listening" : "Ask by voice"} title="Ask by voice">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          </button>
        )}
        <button type="button" className="chip chip--icon" onClick={() => { setSpeakOn((s) => !s); try { window.speechSynthesis.cancel(); } catch {} }} aria-pressed={speakOn} aria-label={speakOn ? "Stop reading answers aloud" : "Read answers aloud"} title="Read answers aloud">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />{speakOn && <path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8.5 8.5 0 0 1 0 13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />}</svg>
        </button>
        <button type="submit" className="btn" disabled={busy || !value.trim()} aria-label="Ask">
          {busy ? "…" : "Ask"}
        </button>
      </form>

      {!items.length && (
        <ul className="twin__suggest" aria-label="Suggested questions">
          {SUGGEST.map((s) => (
            <li key={s}>
              <button type="button" className="chip" onClick={() => ask(s)}>{s}</button>
            </li>
          ))}
        </ul>
      )}

      {!!items.length && (
        <div ref={scroller} className="twin__log" aria-live="polite">
          {items.map((it, i) => (
            <div key={i} className="twin__qa">
              <p className="twin__q">{it.q}</p>
              {it.a ? (
                <div className={`twin__a ${it.err ? "is-err" : ""}`}>
                  {it.a.slice(0, it.shown ?? it.a.length).split("\n\n").map((p, j) => <p key={j}>{p}</p>)}
                  {(it.shown ?? 0) >= it.a.length && !!it.projects?.length && (
                    <div className="twin__cards">
                      {it.projects.slice(0, 3).map((slug) => {
                        const p = getProject(slug);
                        if (!p) return null;
                        return (
                          <Link key={slug} href={`/work/${slug}`} className="twin__card" onClick={() => useUI.getState().close()}>
                            <b>{p.title}</b>
                            <span>{p.tagline}</span>
                            {p.metrics?.[0] && <em className="tabular">{p.metrics[0].value} <small>{p.metrics[0].label}</small></em>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {(it.shown ?? 0) >= it.a.length && !!it.sources?.length && (
                    <p className="twin__src text-small">
                      Sources:{" "}
                      {it.sources.map((s, k) => (
                        <span key={s.href + k}>
                          <Link href={s.href} className="link-u" onClick={() => useUI.getState().close()}>{s.title}</Link>
                          {k < it.sources!.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      {it.mode === "llm" ? " · written by the model from these" : ""}
                    </p>
                  )}
                </div>
              ) : (
                <p className="twin__a twin__thinking" aria-label="Thinking"><span /><span /><span /></p>
              )}
            </div>
          ))}
          {last?.a && (last.shown ?? 0) >= last.a.length && !!last.followups?.length && (
            <ul className="twin__suggest" aria-label="Follow-up questions">
              {last.followups.map((s) => (
                <li key={s}><button type="button" className="chip" onClick={() => ask(s)}>{s}</button></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
