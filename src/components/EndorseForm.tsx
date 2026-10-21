"use client";

import { useState } from "react";
import { profile } from "@/content/profile";
import { track } from "@/lib/analytics";

export default function EndorseForm() {
  const [f, setF] = useState({ name: "", role: "", org: "", relation: "manager", linkedin: "", quote: "", publish: false });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });
  const ok = f.name.trim() && f.quote.trim().length > 20;
  const body = `Endorsement for Raktim Chandra\n\nName: ${f.name}\nRole: ${f.role}\nOrganisation: ${f.org}\nRelationship: ${f.relation}\nLinkedIn: ${f.linkedin || "-"}\nMay be published on his site: ${f.publish ? "YES" : "NO, private only"}\n\nEndorsement:\n${f.quote}`;
  return (
    <form
      className="form-grid endorse"
      onSubmit={(e) => {
        e.preventDefault();
        track("endorsement_composed", { relation: f.relation, publish: f.publish });
        location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Endorsement from ${f.name}`)}&body=${encodeURIComponent(body)}`;
      }}
    >
      <div className="endorse__row">
        <label>Your name<input className="input" required value={f.name} onChange={set("name")} autoComplete="name" /></label>
        <label>Your role<input className="input" value={f.role} onChange={set("role")} placeholder="e.g. Engineering Manager" /></label>
      </div>
      <div className="endorse__row">
        <label>Company or context<input className="input" value={f.org} onChange={set("org")} placeholder="e.g. Bluestock Fintech, or a freelance project" /></label>
        <label>How you worked together
          <select className="select" value={f.relation} onChange={set("relation")}>
            <option value="manager">I managed him</option>
            <option value="team lead">I was his team lead</option>
            <option value="client">I was his client</option>
            <option value="teammate">We were teammates</option>
            <option value="mentor">I mentored him</option>
            <option value="faculty">I taught or supervised him</option>
          </select>
        </label>
      </div>
      <label>LinkedIn profile (optional, lets readers verify)<input className="input" type="url" value={f.linkedin} onChange={set("linkedin")} placeholder="https://www.linkedin.com/in/…" /></label>
      <label>What would you tell someone about working with Raktim?<textarea className="textarea" required value={f.quote} onChange={set("quote")} placeholder="A specific moment, what he built, how he worked…" maxLength={1200} /></label>
      <label className="endorse__check"><input type="checkbox" checked={f.publish} onChange={set("publish")} /> Raktim may publish this on his site with my name.</label>
      <p><button className="btn" disabled={!ok}>Send by email</button></p>
      <p className="text-small muted">This opens your email app with everything filled in, so you can review it before sending. Nothing is stored on this site.</p>
    </form>
  );
}
