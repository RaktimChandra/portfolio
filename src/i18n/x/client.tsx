"use client";

import { createContext, useContext, useMemo } from "react";
import { norm } from "./norm";

type XFn = (<T>(s: T) => T) & { deep: <T>(v: T) => T; f: (template: string, vars: Record<string, string | number>) => string; locale: string };
const fill = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
const Ctx = createContext<{ d: Record<string, string>; locale: string }>({ d: {}, locale: "en" });

export function XProvider({ dict, locale, children }: { dict: Record<string, string>; locale: string; children: React.ReactNode }) {
  const value = useMemo(() => ({ d: dict, locale }), [dict, locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function lookup(d: Record<string, string>, s: string) {
  const hit = d[s] ?? d[norm(s)];
  if (hit === undefined) {
    if (typeof window === "undefined") (globalThis as unknown as { __i18nMiss?: { client: Set<string> } }).__i18nMiss?.client.add(norm(s));
    return s;
  }
  return s.match(/^\s*/)![0] + hit + s.match(/\s*$/)![0];
}

function deep(d: Record<string, string>, v: unknown): unknown {
  if (typeof v === "string") return lookup(d, v);
  if (Array.isArray(v)) return v.map((x) => deep(d, x));
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) o[k] = deep(d, x);
    return o;
  }
  return v;
}

function makeFn(d: Record<string, string>, locale: string): XFn {
  const f = (<T,>(s: T) => (typeof s === "string" ? (lookup(d, s) as T) : s)) as XFn;
  f.deep = <T,>(v: T) => deep(d, v) as T;
  f.f = (t, vars) => fill(lookup(d, t), vars);
  f.locale = locale;
  return f;
}

/** In client components: `const x = useX(); x("English text")`, `x.deep(data)`. */
export function useX(): XFn {
  const { d, locale } = useContext(Ctx);
  return useMemo(() => makeFn(d, locale), [d, locale]);
}
