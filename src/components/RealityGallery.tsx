"use client";
import { useX } from "@/i18n/x/client";
import { useUI } from "@/lib/store";
import { REALITIES } from "@/reality/realities";
import { blip } from "@/lib/sound";

export default function RealityGallery() {
  const xl = useX();
  const { reality, setReality } = useUI();
  return (
    <ul className="card-grid" style={{ listStyle: "none", padding: 0 }}>
      {REALITIES.map((r, i) => (
        <li key={r.id}>
          <button
            type="button"
            className="card panel"
            data-title={r.name}
            aria-pressed={reality === r.id}
            onClick={() => (blip("shift"), setReality(r.id), window.scrollTo({ top: 0, behavior: "smooth" }))}
            style={{ width: "100%", textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", outline: reality === r.id ? "2px solid var(--accent)" : undefined }}
          >
            <span aria-hidden="true" style={{ display: "block", height: 96, borderRadius: 8, background: `linear-gradient(120deg, ${r.swatch[0]} 0 55%, ${r.swatch[2]} 55% 70%, ${r.swatch[1]} 70%)` }} />
            <span className="card__meta"><span className="tabular">{String(i + 1).padStart(2, "0")}</span><span>{r.scheme === "both" ? xl("Light and dark") : r.scheme === "dark" ? xl("Dark") : xl("Light")}</span></span>
            <span className="card__title">{xl(r.name)}</span>
            <span className="muted">{xl(r.note)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
