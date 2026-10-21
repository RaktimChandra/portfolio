"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DOMAIN_LABEL, repoUrl, type Project } from "@/content/projects";

export default function WorkLedger({ items }: { items: Project[] }) {
  const t = useTranslations("work");
  const [cur, setCur] = useState(0);
  const p = items[cur];

  return (
    <div className="ledger">
      <ol className="ledger__list">
        {items.map((it, i) => (
          <li key={it.slug} data-reveal style={{ ["--i" as string]: i % 6 }}>
            <Link
              href={`/work/${it.slug}`}
              className="ledger__row"
              aria-current={i === cur ? "true" : undefined}
              onMouseEnter={() => setCur(i)}
              onFocus={() => setCur(i)}
            >
              <span className="ledger__n tabular muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="ledger__title">{it.title}</span>
              <span className="ledger__tag muted">{it.tagline}</span>
              <span className="ledger__year tabular muted">{it.year}</span>
            </Link>
          </li>
        ))}
      </ol>
      <aside className="ledger__preview panel" aria-live="polite" data-title={p.title}>
        <p className="text-small muted">{p.domains.map((d) => DOMAIN_LABEL[d]).join(" · ")}</p>
        <h3 className="ledger__ptitle display">{p.title}</h3>
        <p>{p.summary}</p>
        {!!p.metrics?.length && (
          <dl className="metrics">
            {p.metrics.slice(0, 4).map((m) => (
              <div key={m.label}>
                <dt className="text-small muted">{m.label}</dt>
                <dd className="tabular">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="text-small muted">{p.stack.slice(0, 6).join(" · ")}</p>
        <p className="ledger__links">
          <Link href={`/work/${p.slug}`} className="link-u">Case study →</Link>
          {repoUrl(p) ? <a className="link-u" href={repoUrl(p)} target="_blank" rel="noopener">{t("code")} ↗</a> : <span className="muted text-small">{t("private")}</span>}
          {p.demo && <a className="link-u" href={p.demo} target="_blank" rel="noopener">{t("live")} ↗</a>}
        </p>
      </aside>
    </div>
  );
}
