"use client";

/**
 * Visitor analytics through PostHog (public project token, safe to ship).
 * Events go through /ingest (rewritten to PostHog) so ad blockers don't drop them.
 * Respects Do Not Track and the opt-out on /privacy; no session recording.
 * Uncaught errors are reported as exceptions so broken pages show up in PostHog.
 */
const OPT_OUT = "rc.optout";
export const isOptedOut = () => { try { return localStorage.getItem(OPT_OUT) === "1"; } catch { return false; } };
export function setOptOut(on: boolean) {
  try { on ? localStorage.setItem(OPT_OUT, "1") : localStorage.removeItem(OPT_OUT); } catch {}
  if (on) ph = null;
}
type PH = { capture: (e: string, p?: Record<string, unknown>) => void; register: (p: Record<string, unknown>) => void; captureException?: (e: unknown, p?: Record<string, unknown>) => void };
let ph: PH | null = null;
const queue: [string, Record<string, unknown> | undefined][] = [];

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_nr7HC5KQN6x6bPctTV6hDaGDDURvqbDcmLciWX5bu6oT";

export function initAnalytics() {
  if (typeof window === "undefined" || ph) return;
  if (isOptedOut() || navigator.doNotTrack === "1" || location.hostname === "localhost" || location.hostname === "127.0.0.1") return;
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
      capture_exceptions: true,
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

/** Report an error caught by an error boundary (uncaught ones are captured automatically). */
export function reportError(error: unknown, where: string) {
  if (ph?.captureException) ph.captureException(error, { where });
  else track("$exception", { where, message: String((error as Error)?.message ?? error).slice(0, 300) });
}
