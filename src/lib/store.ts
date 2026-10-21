"use client";
import { create } from "zustand";
import { getReality } from "@/reality/realities";

export type Persona = "recruiter" | "client" | "investor" | "researcher" | null;
export type Overlay = null | "palette" | "terminal" | "twin" | "dial" | "match" | "scope" | "game";

type State = {
  reality: string;
  theme: "dark" | "light";
  persona: Persona;
  sound: boolean;
  overlay: Overlay;
  twinPrompt: string;
  setReality: (id: string) => void;
  setTheme: (t: "dark" | "light") => void;
  toggleTheme: () => void;
  setPersona: (p: Persona) => void;
  setSound: (s: boolean) => void;
  open: (o: Overlay, prompt?: string) => void;
  close: () => void;
};

function persist(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

function apply(reality: string, theme: "dark" | "light") {
  const r = getReality(reality);
  const effective = r.scheme === "both" ? theme : r.scheme;
  const el = document.documentElement;
  el.dataset.reality = r.id;
  el.dataset.theme = effective;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", r.swatch[0]);
}

export const useUI = create<State>((set, get) => ({
  reality: "glass",
  theme: "dark",
  persona: null,
  sound: false,
  overlay: null,
  twinPrompt: "",
  setReality: (id) => {
    const r = getReality(id);
    const theme = r.scheme === "both" ? get().theme : r.prefers;
    persist("rc.reality", r.id);
    apply(r.id, theme);
    const url = new URL(window.location.href);
    if (r.id === "glass") url.searchParams.delete("reality");
    else url.searchParams.set("reality", r.id);
    window.history.replaceState(window.history.state, "", url);
    set({ reality: r.id });
    window.dispatchEvent(new CustomEvent("reality:change", { detail: r.id }));
  },
  setTheme: (t) => {
    persist("rc.theme", t);
    apply(get().reality, t);
    set({ theme: t });
    window.dispatchEvent(new CustomEvent("reality:change", { detail: get().reality }));
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
  setPersona: (p) => {
    persist("rc.persona", p);
    set({ persona: p });
  },
  setSound: (s) => {
    persist("rc.sound", s ? "1" : null);
    set({ sound: s });
  },
  open: (o, prompt) => set({ overlay: o, twinPrompt: prompt ?? get().twinPrompt }),
  close: () => set({ overlay: null }),
}));

/** Read what the boot script already applied, so React state matches the DOM. */
export function hydrateUI() {
  const el = document.documentElement;
  let persona: Persona = null;
  let sound = false;
  try {
    persona = (localStorage.getItem("rc.persona") as Persona) || null;
    sound = localStorage.getItem("rc.sound") === "1";
  } catch {}
  let theme: "dark" | "light" = el.dataset.theme === "light" ? "light" : "dark";
  try {
    const t = localStorage.getItem("rc.theme");
    if (t === "dark" || t === "light") theme = t;
  } catch {}
  useUI.setState({ reality: el.dataset.reality || "glass", theme, persona, sound });
}
