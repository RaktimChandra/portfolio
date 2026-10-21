"use client";

import { useX } from "@/i18n/x/client";
import { useRef, useState } from "react";
import { certifications, links } from "@/content/record";

const HUE: Record<string, number> = {};
const groups = [...new Set(certifications.map((c) => c.group))];
groups.forEach((g, i) => (HUE[g] = Math.round((i * 360) / groups.length + 20)));
const initials = (s: string) => s.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("") || s[0];

/** Every certificate as a frame on a wall. Tilt follows the pointer; a frame opens to its details. */
export default function CertWall() {
  const xl = useX();
  const wall = useRef<HTMLDivElement>(null);
  const [g, setG] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !wall.current) return;
    const r = wall.current.getBoundingClientRect();
    wall.current.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
    wall.current.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`);
  };
  const c = open !== null ? certifications[open] : null;
  return (
    <section className="certwall" aria-label={xl("Certificate wall")}>
      <div className="demo__seg" role="group" aria-label={xl("Filter by area")}>
        <button type="button" className="chip" aria-pressed={g === null} onClick={() => setG(null)}>{xl("All")}{" "}{xl(certifications.length)}</button>
        {groups.map((x) => <button key={x} type="button" className="chip" aria-pressed={g === x} onClick={() => setG(g === x ? null : x)}>{xl(x)}</button>)}
      </div>
      <div className="certwall__stage" onPointerMove={onMove} onPointerLeave={() => wall.current?.style.setProperty("--ry", "0deg")}>
        <div className="certwall__wall" ref={wall}>
          {certifications.map((x, i) => (
            <button
              key={x.name}
              type="button"
              className="frame"
              data-dim={g && x.group !== g ? "" : undefined}
              style={{ ["--h" as string]: HUE[x.group], ["--tilt" as string]: `${((i * 37) % 7) - 3}deg` }}
              onClick={() => setOpen(i)}
              aria-label={`${x.name}, ${x.issuer}`}
            >
              <span className="frame__paper">
                <span className="frame__seal" aria-hidden="true">{initials(x.issuer)}</span>
                <span className="frame__name">{xl(x.name)}</span>
                <span className="frame__iss">{xl(x.issuer)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {c && (
        <div className="certwall__open panel" role="dialog" aria-label={c.name}>
          <p className="text-small muted">{xl(c.group)} · {xl(c.issuer)}</p>
          <p className="card__title">{xl(c.name)}</p>
          {links.cert[c.name] ? <a className="btn" href={links.cert[c.name]} target="_blank" rel="noopener">{xl("Verify ↗")}</a> : null}
          <button type="button" className="chip" onClick={() => setOpen(null)}>{xl("Close")}</button>
        </div>
      )}
    </section>
  );
}
