"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { hydrateUI, useUI } from "@/lib/store";
import { initAnalytics, track } from "@/lib/analytics";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Sync store with what the boot script applied; register the service worker.
  useEffect(() => {
    hydrateUI();
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(initAnalytics, { timeout: 4000 });
    else setTimeout(initAnalytics, 2500);
    // Key conversions, captured by delegation.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("mailto:")) track("contact_email_clicked", { where: location.pathname });
      else if (href.startsWith("tel:")) track("contact_phone_clicked", { where: location.pathname });
      else if (href.endsWith(".pdf")) track("resume_downloaded", { where: location.pathname });
      else if (href.endsWith(".vcf")) track("contact_card_saved");
      else if (/github\.com\/RaktimChandra\/[^/]+/.test(href)) track("repo_opened", { repo: href.split("/").pop() });
      else if (a.target === "_blank" && /^https?:/.test(href)) track("demo_opened", { url: href });
    };
    document.addEventListener("click", onClick);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Smooth scrolling (skipped for reduced motion and touch, where native is better).
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let raf = 0;
    let alive = true;
    import("lenis").then(({ default: Lenis }) => {
      if (!alive) return;
      lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, anchors: true });
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  // Entrance reveals, re-scanned on every route.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    els.forEach((e) => io.observe(e));
    // Safety net: never leave content hidden.
    const t = setTimeout(() => els.forEach((e) => e.classList.add("is-in")), 2500);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [pathname]);

  // Cards lean toward the pointer, with a moving glare.
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cur: HTMLElement | null = null;
    const reset = () => {
      if (!cur) return;
      cur.removeAttribute("data-tilting");
      cur.style.removeProperty("--rx");
      cur.style.removeProperty("--ry");
      cur = null;
    };
    const on = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest?.<HTMLElement>(".card, .twin__card, .ledger__preview");
      if (el !== cur) reset();
      if (!el) return;
      cur = el;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const k = el.classList.contains("ledger__preview") ? 4 : 9;
      el.setAttribute("data-tilting", "");
      el.style.setProperty("--ry", `${((x - 0.5) * k).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${((0.5 - y) * k).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    };
    window.addEventListener("pointermove", on, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => (window.removeEventListener("pointermove", on), document.removeEventListener("pointerleave", reset));
  }, []);

  // Global shortcuts.
  useEffect(() => {
    let seq: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest("input, textarea, [contenteditable=true]");
      const { open, close, overlay } = useUI.getState();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (overlay === "palette") close();
        else open("palette");
        return;
      }
      if (e.key === "Escape" && overlay) {
        close();
        return;
      }
      if (typing) return;
      if (e.key === "`") {
        e.preventDefault();
        if (overlay === "terminal") close();
        else open("terminal");
        return;
      }
      if (e.key === "/" && !overlay) {
        e.preventDefault();
        open("palette");
        return;
      }
      if (e.key.toLowerCase() === "r" && !overlay && !e.metaKey && !e.ctrlKey && !e.altKey) {
        open("dial");
        return;
      }
      seq = [...seq, e.key].slice(-KONAMI.length);
      if (seq.join() === KONAMI.join()) {
        seq = [];
        open("game");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Tiny toast: window.dispatchEvent(new CustomEvent("toast", { detail: "text" }))
  const [toast, setToast] = useState("");
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setToast(String((e as CustomEvent).detail ?? ""));
      clearTimeout(t);
      t = setTimeout(() => setToast(""), 2200);
    };
    window.addEventListener("toast", on);
    return () => window.removeEventListener("toast", on);
  }, []);

  // Lock page scroll under overlays.
  const overlay = useUI((s) => s.overlay);
  useEffect(() => {
    document.documentElement.style.overflow = overlay ? "hidden" : "";
  }, [overlay]);

  return (
    <>
      {children}
      <div className="toast" role="status" aria-live="polite" data-on={toast ? "1" : undefined}>{toast}</div>
    </>
  );
}
