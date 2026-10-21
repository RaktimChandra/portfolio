"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUI } from "@/lib/store";

type QA = { q: string; a?: string; sources?: { title: string; href: string }[]; err?: boolean };

const SUGGEST = ["What has he built with agents?", "Which projects use Kafka?", "Tell me about the Amazon ML Challenge", "How do I hire him for a project?", "What papers has he published?"];

/** The AI twin. `variant="headline"` is the large type input on the home page. */
export default function TwinBox({ variant = "panel", initial = "" }: { variant?: "panel" | "headline"; initial?: string }) {
  const t = useTranslations("home");
  const [value, setValue] = useState("");
  const [items, setItems] = useState<QA[]>([]);
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const sent = useRef(false);

  const ask = async (q: string) => {
    q = q.trim();
    if (!q || busy) return;
    setBusy(true);
    setValue("");
    setItems((x) => [...x, { q }]);
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q }) });
      const j = await r.json();
      setItems((x) => x.map((it, i) => (i === x.length - 1 ? { ...it, a: j.answer ?? j.error, sources: j.sources, err: !r.ok } : it)));
    } catch {
      setItems((x) => x.map((it, i) => (i === x.length - 1 ? { ...it, a: "The connection dropped. Try again.", err: true } : it)));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (initial && !sent.current) {
      sent.current = true;
      ask(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [items]);

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
          placeholder={t("twinPlaceholder")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          enterKeyHint="send"
          maxLength={500}
          autoFocus={variant === "panel"}
        />
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
                  {it.a.split("\n\n").map((p, j) => <p key={j}>{p}</p>)}
                  {!!it.sources?.length && (
                    <p className="twin__src text-small">
                      Sources:{" "}
                      {it.sources.map((s, k) => (
                        <span key={s.href + k}>
                          <Link href={s.href} className="link-u" onClick={() => useUI.getState().close()}>{s.title}</Link>
                          {k < it.sources!.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              ) : (
                <p className="twin__a twin__thinking" aria-label="Thinking"><span /><span /><span /></p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
