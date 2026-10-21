"use client";

import { useX } from "@/i18n/x/client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { localize } from "@/content/i18n";
import { Link } from "@/i18n/navigation";
import { DOMAIN_LABEL, factLine, projects, repoUrl, type Domain } from "@/content/projects";

const Constellation = dynamic(() => import("./Constellation"), { ssr: false, loading: () => <div className="constellation panel" /> });

export default function WorkIndex() {
  const xl = useX();
  const t = useTranslations("work");
  const [f, setF] = useState<Domain | "all" | "featured">("all");
  const [view, setView] = useState<"list" | "space">("list");
  const domains = useMemo(() => {
    const c = new Map<Domain, number>();
    projects.forEach((p) => p.domains.forEach((d) => c.set(d, (c.get(d) ?? 0) + 1)));
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, []);
  const locale = useLocale();
  const list = projects.map((p) => localize(p, locale)).filter((p) => (f === "all" ? true : f === "featured" ? !!p.featured : p.domains.includes(f)));

  return (
    <>
      <div className="filters" role="toolbar" aria-label={xl("Filter projects")}>
        <button className="chip" aria-pressed={f === "all"} onClick={() => setF("all")}>{t("all")} · {xl(projects.length)}</button>
        <button className="chip" aria-pressed={f === "featured"} onClick={() => setF("featured")}>{t("featured")}</button>
        {domains.map(([d, n]) => (
          <button key={d} className="chip" aria-pressed={f === d} onClick={() => setF(d)}>{xl(DOMAIN_LABEL[d])} · {xl(n)}</button>
        ))}
        <span style={{ flex: 1 }} />
        <button className="chip" aria-pressed={view === "list"} onClick={() => setView("list")}>{t("list")}</button>
        <button className="chip" aria-pressed={view === "space"} onClick={() => setView("space")}>{t("constellation")} (3D)</button>
      </div>

      {view === "space" && <Constellation items={list} />}

      <p className="muted text-small" aria-live="polite" style={{ marginBottom: "1rem" }}>{t("count", { count: list.length })}</p>
      <div className="card-grid">
        {list.map((p, i) => (
          <article key={p.slug} className="card panel" data-title={p.title} data-reveal style={{ ["--i" as string]: i % 6 }}>
            <div className="card__meta">
              <span className="tabular">{xl(p.year)}</span>
              <span>{p.domains.slice(0, 2).map((d) => xl(DOMAIN_LABEL[d])).join(" · ")}</span>
              <span>{xl(p.status)}</span>
            </div>
            <h2 className="card__title"><Link href={`/work/${p.slug}`} className="link-u">{xl(p.title)}</Link></h2>
            <p>{xl(p.tagline)}</p>
            {!!p.metrics?.length && (
              <p className="text-small"><b className="tabular">{xl(p.metrics[0].value)}</b> <span className="muted">{xl(p.metrics[0].label)}</span></p>
            )}
            {factLine(p, xl) && <p className="text-small muted tabular">{factLine(p, xl)}</p>}
            <p className="card__meta">{p.stack.slice(0, 5).map((s) => <span key={s} className="tag">{xl(s)}</span>)}</p>
            <p className="card__meta" style={{ fontSize: 14 }}>
              {repoUrl(p) ? <a className="link-u" href={repoUrl(p)} target="_blank" rel="noopener">{t("code")} ↗</a> : <span>{t("private")}</span>}
              {p.demo && <a className="link-u" href={p.demo} target="_blank" rel="noopener">{t("live")} ↗</a>}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
