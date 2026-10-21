"use client";

import { useX } from "@/i18n/x/client";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { track } from "@/lib/analytics";

/** Paste a company website; get a version of this portfolio that leads with what matters to them. */
export default function ForForm() {
  const xl = useX();
  const router = useRouter();
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      className="for-form"
      onSubmit={(e) => {
        e.preventDefault();
        let host = "";
        try { host = new URL(/^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`).hostname.replace(/^www\./, ""); } catch {}
        if (!host.includes(".")) return setErr("That doesn't look like a website. Try something like stripe.com.");
        const slug = host.split(".")[0].toLowerCase().replace(/[^a-z0-9-]/g, "");
        track("company_tailored", { domain: host });
        router.push(`/for/${slug}?site=${encodeURIComponent(host)}`);
      }}
    >
      <label htmlFor="co" className="text-small muted">{xl("Your company's website")}</label>
      <div className="demo__row">
        <input id="co" className="demo__input" value={v} onChange={(e) => (setV(e.target.value), setErr(""))} placeholder={xl("stripe.com")} inputMode="url" autoComplete="url" maxLength={200} />
        <button className="btn" type="submit" disabled={!v.trim()}>{xl("Tailor it")}</button>
      </div>
      {err && <p className="text-small" role="alert">{xl(err)}</p>}
    </form>
  );
}
