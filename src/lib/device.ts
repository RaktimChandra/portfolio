"use client";

import { useSyncExternalStore } from "react";

/**
 * What this device can comfortably run, read once on the client.
 *  - gl: WebGL2 is available.
 *  - reduced: the visitor asked for reduced motion.
 *  - lite: a low-end phone (touch-first, ≤ 4 GB memory reported, or Data Saver on). Lite skips the
 *    heavy 3D scenes and keeps everything else. Laptops, desktops, tablets and ordinary phones are never lite.
 *    Override for testing with ?lite=1 or ?lite=0 (kept for the tab).
 *  - rich: gl && !reduced && !lite, i.e. show the 3D.
 */
export type Caps = { gl: boolean; reduced: boolean; lite: boolean; rich: boolean };

const SERVER: Caps = { gl: false, reduced: false, lite: false, rich: false };
let snap: Caps | null = null;

function read(): Caps {
  let gl = false;
  try {
    gl = !!document.createElement("canvas").getContext("webgl2");
  } catch {}
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let forced: string | null = null;
  try {
    const q = new URLSearchParams(location.search).get("lite");
    if (q === "1" || q === "0") sessionStorage.setItem("rc.lite", q);
    forced = sessionStorage.getItem("rc.lite");
  } catch {}
  const coarse = matchMedia("(pointer: coarse)").matches;
  const weak = (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) || !!nav.connection?.saveData;
  const lite = forced ? forced === "1" : coarse && weak;
  return { gl, reduced, lite, rich: gl && !reduced && !lite };
}

function subscribe(cb: () => void) {
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const on = () => ((snap = read()), cb());
  mq.addEventListener?.("change", on);
  return () => mq.removeEventListener?.("change", on);
}

export function getCaps(): Caps {
  if (typeof window === "undefined") return SERVER;
  return (snap ??= read());
}

/** Server render and first hydration see `SERVER` (no 3D), then the real values. */
export function useCaps(): Caps {
  return useSyncExternalStore(subscribe, getCaps, () => SERVER);
}
