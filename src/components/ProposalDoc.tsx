"use client";

import { useX } from "@/i18n/x/client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { KINDS, SIZE, planFor } from "@/content/scope";
import { profile } from "@/content/profile";
import { links } from "@/content/record";
import { SITE_URL } from "@/lib/site";

/** A printable project proposal built from the scoper's answers. No price: that comes after a call. */
export default function ProposalDoc() {
  const xl = useX();
  const q = useSearchParams();
  const [client, setClient] = useState("");
  const [kinds, setKinds] = useState((q.get("k") ?? "web").split(",").filter((k) => KINDS.some((x) => x.id === k)));
  const [size, setSize] = useState(SIZE.some((s) => s.id === q.get("s")) ? q.get("s")! : "m");
  const [idea, setIdea] = useState(q.get("i") ?? "");
  const deadline = q.get("d") ?? "";
  const plan = planFor(kinds.length ? kinds : ["web"], size)!;
  const today = new Date().toLocaleDateString(xl.locale === "en" ? "en-IN" : xl.locale + "-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <>
      <div className="no-print proposal-form">
        <label className="text-small muted" htmlFor="pc">{xl("Prepared for (your name or company)")}</label>
        <input id="pc" className="demo__input" value={client} onChange={(e) => setClient(e.target.value)} placeholder={xl("Acme Health")} maxLength={80} />
        <label className="text-small muted" htmlFor="pi">{xl("The idea")}</label>
        <textarea id="pi" className="textarea" style={{ minHeight: 90 }} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={1200} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {KINDS.map((k) => <button key={k.id} type="button" className="chip" aria-pressed={kinds.includes(k.id)} onClick={() => setKinds((x) => (x.includes(k.id) ? x.filter((y) => y !== k.id) : [...x, k.id]))}>{xl(k.label)}</button>)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SIZE.map((s) => <button key={s.id} type="button" className="chip" aria-pressed={size === s.id} onClick={() => setSize(s.id)}>{xl(s.label)}</button>)}
        </div>
        <p><button type="button" className="btn" onClick={() => window.print()}>{xl("Save as PDF")}</button> <span className="text-small muted">{xl("Choose “Save as PDF” in the print dialog.")}</span></p>
      </div>

      <article className="proposal cv-sheet">
        <header className="proposal__head">
          <p className="text-small muted">{xl("Project proposal ·")}{" "}{xl(today)}</p>
          <h1>{client ? `For ${client}` : xl("Project proposal")}</h1>
          <p>{xl("Prepared by")}{" "}{xl(profile.name)}, {xl(profile.role)} · {xl(profile.email)} · {SITE_URL.replace(/^https?:\/\//, "")}</p>
        </header>
        <section><h2>{xl("What you want built")}</h2><p>{idea || xl("A short description of the idea goes here.")}</p></section>
        <section>
          <h2>{xl("Scope")}</h2>
          <ul>{plan.ks.map((k) => <li key={k.id}><b>{xl(k.label)}.</b>{" "}{xl("Likely stack:")}{" "}{xl(k.stack)}.</li>)}</ul>
          <p>{xl("Size:")}{" "}{xl(SIZE.find((s) => s.id === size)!.label)}.{deadline ? " " + xl.f("Your deadline: {date}.", { date: new Date(deadline).toLocaleDateString(xl.locale === "en" ? "en-IN" : xl.locale + "-IN", { day: "numeric", month: "long", year: "numeric" }) }) : ""}</p>
        </section>
        <section>
          <h2>{xl("Timeline: about")}{" "}{xl(plan.lo)}–{xl(plan.hi)}{" "}{xl("weeks")}</h2>
          <ol>{plan.milestones.map((m) => <li key={m.t}><b>{xl("Week")}{" "}{xl(m.w)}.</b> {m.kinds?.length ? xl.f(m.t, { kinds: m.kinds.map((k) => xl(k).toLocaleLowerCase(xl.locale)).join(", ") }) : xl(m.t)}</li>)}</ol>
        </section>
        <section>
          <h2>{xl("How I work")}</h2>
          <ul>{profile.principles.map((p) => <li key={p.title}><b>{xl(p.title)}.</b> {xl(p.body)}</li>)}</ul>
        </section>
        <section>
          <h2>{xl("What you get")}</h2>
          <ul>
            <li>{xl("Source code in your repository, with tests and a CI pipeline.")}</li>
            <li>{xl("A preview link from the first working version onward.")}</li>
            <li>{xl("Handover documents and a support window after launch.")}</li>
          </ul>
        </section>
        <section>
          <h2>{xl("Price and next step")}</h2>
          <p>{xl("This is a starting point, not a quote. The timeline above is a rough estimate from the scoping tool. The price is set after a short call, once the scope is written down and agreed.")}</p>
          <p>{links.calendly ? xl.f("Book a call: {link}", { link: links.calendly }) : xl.f("Write to {email} to set up a 20-minute call.", { email: profile.email })}</p>
        </section>
      </article>
    </>
  );
}
