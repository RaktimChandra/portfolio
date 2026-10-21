"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUI, type Persona } from "@/lib/store";
import { profile } from "@/content/profile";
import { blip } from "@/lib/sound";
import HeroPortrait from "./HeroPortrait";
import ChennaiClock from "./ChennaiClock";

const PERSONA_LINK: Record<Exclude<Persona, null>, string> = {
  recruiter: "/resume",
  client: "/services",
  investor: "/work",
  researcher: "/research",
};

export default function Hero() {
  const xl = useX();
  const t = useTranslations("hero");
  const tp = useTranslations("persona");
  const { persona, setPersona, open } = useUI();
  const word = useRef<HTMLDivElement>(null);
  const [avatarOk, setAvatarOk] = useState(true);

  // Letters sit at different depths and lean toward the cursor.
  useEffect(() => {
    const el = word.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(step);
    };
    const step = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const personas: Exclude<Persona, null>[] = ["recruiter", "client", "investor", "researcher"];

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap hero__top">
        <div className="hero__id">
          {avatarOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarSmall} alt="" width={56} height={56} className="hero__avatar" onError={() => setAvatarOk(false)} decoding="async" />
          ) : (
            <span className="hero__avatar hero__avatar--fallback" aria-hidden="true">{xl("RC")}</span>
          )}
          <p className="hero__role">
            <span className="hero__name">{xl(profile.name)}</span>
            <span className="muted">{t("role")}</span>
          </p>
        </div>
        <div className="hero__status">
          <p><span className="dot" aria-hidden="true" />{t("status")}</p>
          <ChennaiClock />
        </div>
      </div>

      <div className="wrap hero__grid">
      <div className="hero__body">
        <p className="hero__line">{t("line")}</p>
        <div className="hero__cta">
          <Link href="/work" className="btn">{t("ctaWork")}</Link>
          <button type="button" className="btn btn-quiet" onClick={() => (blip("open"), open("twin"))}>{t("ctaAsk")}</button>
        </div>

        <div className="persona">
          <p className="text-small muted" id="persona-label">{t("who")}</p>
          <div className="persona__row" role="group" aria-labelledby="persona-label">
            {personas.map((p) => (
              <button key={p} type="button" className="chip" aria-pressed={persona === p} onClick={() => (blip(), setPersona(persona === p ? null : p))}>
                {t(p)}
              </button>
            ))}
          </div>
          {persona && (
            <p className="persona__note" aria-live="polite">
              {tp(persona)}{" "}
              <Link href={PERSONA_LINK[persona]} className="link-u accent">{tp("go")} →</Link>
            </p>
          )}
        </div>
      </div>
      <HeroPortrait />
      </div>

      <div className="hero__word" aria-hidden="true">
        <div ref={word} className="hero__word-inner display">
          {profile.wordmark.split("").map((c, i) => (
            <span key={i} style={{ ["--z" as string]: `${(i % 3) * 18 - 18}px` }}>{xl(c)}</span>
          ))}
        </div>
      </div>
      <h1 id="hero-title" className="sr-only">{xl(profile.name)}, {t("role")}</h1>
    </section>
  );
}
