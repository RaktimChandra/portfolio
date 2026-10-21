"use client";

/**
 * Visitor analytics through PostHog (public project token, safe to ship).
 * Events go through /ingest (rewritten to PostHog) so ad blockers don't drop them.
 * Respects Do Not Track; no session recording; IPs are anonymised in the project.
 */
type PH = { capture: (e: string, p?: Record<string, unknown>) => void; register: (p: Record<string, unknown>) => void };
let ph: PH | null = null;
const queue: [string, Record<string, unknown> | undefined][] = [];

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_nr7HC5KQN6x6bPctTV6hDaGDDURvqbDcmLciWX5bu6oT";

export function initAnalytics() {
  if (typeof window === "undefined" || ph) return;
  if (navigator.doNotTrack === "1" || location.hostname === "localhost" || location.hostname === "127.0.0.1") return;
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init(POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: "history_change",
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true,
      respect_dnt: true,
      persistence: "localStorage+cookie",
    });
    ph = posthog as unknown as PH;
    try {
      const persona = localStorage.getItem("rc.persona");
      ph.register({ reality: document.documentElement.dataset.reality, locale: document.documentElement.lang, ...(persona ? { persona } : {}) });
    } catch {}
    queue.splice(0).forEach(([e, p]) => ph!.capture(e, p));
  });
}

export function track(event: string, props?: Record<string, unknown>) {
  if (ph) ph.capture(event, props);
  else if (queue.length < 50) queue.push([event, props]);
}

export function setSuper(props: Record<string, unknown>) {
  ph?.register(props);
}
