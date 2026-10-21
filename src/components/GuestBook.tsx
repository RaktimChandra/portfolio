"use client";

import { useX } from "@/i18n/x/client";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

type Note = { id: number; name: string; note: string; place: string | null; created_at: string };

/** Sign the book. Notes are from visitors and unverified; they appear as written. */
export default function GuestBook() {
  const xl = useX();
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [f, setF] = useState({ name: "", note: "", place: "", website: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => fetch("/api/guestbook").then((r) => r.json()).then((j) => setNotes(j.notes ?? [])).catch(() => setNotes([]));
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const r = await fetch("/api/guestbook", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(f) }).then((x) => x.json()).catch(() => ({ ok: false, error: "The connection dropped." }));
    setBusy(false);
    if (r.ok) {
      track("guestbook_signed");
      setMsg("Thanks for signing.");
      setNotes((n) => [{ id: Date.now(), name: f.name.trim(), note: f.note.trim(), place: f.place.trim() || null, created_at: new Date().toISOString() }, ...(n ?? [])]);
      setF({ name: "", note: "", place: "", website: "" });
    } else setMsg(r.error ?? "Couldn't save that.");
  };
  return (
    <div className="gb">
      <form className="gb__form panel" onSubmit={submit} data-title={xl("Sign")}>
        <div className="gb__row">
          <label>{xl("Name")}<input className="demo__input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={40} required /></label>
          <label>{xl("Where from (optional)")}<input className="demo__input" value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} maxLength={40} /></label>
        </div>
        <label>{xl("Note")}<textarea className="textarea" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} maxLength={280} required style={{ minHeight: 90 }} /></label>
        <label className="gb__hp" aria-hidden="true">{xl("Website")}<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></label>
        <p className="demo__row"><button className="btn" disabled={busy || !f.name.trim() || f.note.trim().length < 2}>{busy ? xl("Signing…") : xl("Sign the book")}</button><span className="text-small muted tabular">{xl.f("{n} left · no links", { n: 280 - f.note.length })}</span></p>
        {msg && <p className="text-small" role="status">{xl(msg)}</p>}
      </form>
      <ol className="gb__list" aria-label={xl("Notes from visitors")}>
        {notes === null && <li className="muted">{xl("Loading…")}</li>}
        {notes?.length === 0 && <li className="muted">{xl("No notes yet. Be the first.")}</li>}
        {notes?.map((n) => (
          <li key={n.id} className="gb__note">
            <p>{xl(n.note)}</p>
            <p className="text-small muted">{xl(n.name)}{n.place ? `, ${n.place}` : ""} · {new Date(n.created_at).toLocaleDateString(xl.locale === "en" ? "en-IN" : xl.locale + "-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
