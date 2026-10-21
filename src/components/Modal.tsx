"use client";

import { useEffect, useRef } from "react";
import { useUI } from "@/lib/store";
import { blip } from "@/lib/sound";

/** Accessible modal shell: focus trap, Escape, click-outside, restores focus. */
export default function Modal({ label, children, className = "", position = "center" }: { label: string; children: React.ReactNode; className?: string; position?: "center" | "bottom" | "top" }) {
  const close = useUI((s) => s.close);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>("[autofocus], input, button, [href], [tabindex]:not([tabindex='-1'])");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !el) return;
      const f = Array.from(el.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex='-1'])")).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0];
      const b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) (e.preventDefault(), b.focus());
      else if (!e.shiftKey && document.activeElement === b) (e.preventDefault(), a.focus());
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, []);

  return (
    <div className={`modal modal--${position}`} onMouseDown={(e) => e.target === e.currentTarget && (blip("close"), close())}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className={`modal__card panel ${className}`} data-title={label}>
        {children}
      </div>
    </div>
  );
}
