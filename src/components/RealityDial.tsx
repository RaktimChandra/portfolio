"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Modal from "./Modal";
import { useUI } from "@/lib/store";
import { REALITIES } from "@/reality/realities";
import { blip } from "@/lib/sound";

export default function RealityDial() {
  const xl = useX();
  const t = useTranslations("chrome");
  const { reality, setReality, close } = useUI();
  const listRef = useRef<HTMLDivElement>(null);
  const i = Math.max(0, REALITIES.findIndex((r) => r.id === reality));

  const go = (n: number) => {
    const next = REALITIES[(n + REALITIES.length) % REALITIES.length];
    blip("shift");
    setReality(next.id);
  };

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-id="${reality}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [reality]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), go(i + 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), go(i - 1));
      if (e.key === "Enter") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const cur = REALITIES[i];
  return (
    <Modal label={t("reality")} position="bottom" className="dial">
      <div className="dial__head">
        <div>
          <p className="text-small muted tabular">{String(i + 1).padStart(2, "0")} / {xl(REALITIES.length)}</p>
          <h2 className="dial__name display">{xl(cur.name)}</h2>
          <p className="dial__note">{xl(cur.note)}</p>
        </div>
        <div className="dial__ctrl">
          <button type="button" className="btn btn-quiet" onClick={() => go(i - 1)} aria-label={xl("Previous reality")}>←</button>
          <button type="button" className="btn btn-quiet" onClick={() => go(i + 1)} aria-label={xl("Next reality")}>→</button>
          <button type="button" className="btn btn-quiet" onClick={() => go(Math.floor(Math.random() * REALITIES.length))}>{xl("Surprise me")}</button>
          <button type="button" className="btn" onClick={close}>{xl("Keep this one")}</button>
        </div>
      </div>
      <div ref={listRef} className="dial__list" role="radiogroup" aria-label={t("realityHint")}>
        {REALITIES.map((r, n) => (
          <button
            key={r.id}
            data-id={r.id}
            type="button"
            role="radio"
            aria-checked={r.id === reality}
            className="dial__item"
            onClick={() => go(n)}
          >
            <span className="dial__swatch" aria-hidden="true" style={{ background: r.swatch[0], color: r.swatch[1] }}>
              <span style={{ background: r.swatch[2] }} />
              <b>{xl("Aa")}</b>
            </span>
            <span className="dial__label">{xl(r.name)}</span>
          </button>
        ))}
      </div>
      <p className="text-small muted dial__hint">{xl("Arrow keys turn the dial. The link in your address bar now opens this reality for anyone you share it with.")}</p>
    </Modal>
  );
}
