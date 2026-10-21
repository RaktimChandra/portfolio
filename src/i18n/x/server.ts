import { getLocale } from "next-intl/server";
import hi from "./hi.json";
import bn from "./bn.json";
import clientKeys from "./client-keys.json";
import { norm } from "./norm";

/**
 * Translations of everything not covered by messages/*.json: page copy and content data.
 * Keys are the English text; anything missing falls back to English. Server-only: the full
 * dictionaries never reach the browser, only the client subset passed to <XProvider>.
 */
const DICTS: Record<string, Record<string, string>> = { hi, bn };

// Translation harvest (scripts/i18n-harvest.mjs): with I18N_COLLECT=1, every miss is written to a file.
type Miss = { server: Set<string>; client: Set<string> };
const G = globalThis as unknown as { __i18nMiss?: Miss };
if (process.env.I18N_COLLECT && !G.__i18nMiss) {
  G.__i18nMiss = { server: new Set(), client: new Set() };
  import("node:fs").then((fs) => {
    const flush = () => {
      const m = G.__i18nMiss!;
      fs.writeFileSync(`${process.env.I18N_COLLECT}.${process.pid}.json`, JSON.stringify({ server: [...m.server], client: [...m.client] }));
    };
    setInterval(flush, 2000).unref();
    process.on("exit", flush);
  });
}

export function tx(locale: string, s: string): string {
  if (locale === "en" || typeof s !== "string") return s;
  const d = DICTS[locale];
  if (!d) return s;
  const hit = d[s] ?? d[norm(s)];
  if (hit === undefined) {
    G.__i18nMiss?.server.add(norm(s));
    return s;
  }
  // Keep the original's outer whitespace (JSX text often has it).
  const lead = s.match(/^\s*/)![0], trail = s.match(/\s*$/)![0];
  return lead + hit + trail;
}

/** Translate every string inside a value (objects, arrays), leaving keys and non-strings alone. */
export function txDeep<T>(locale: string, v: T): T {
  if (locale === "en") return v;
  if (typeof v === "string") return tx(locale, v) as T;
  if (Array.isArray(v)) return v.map((x) => txDeep(locale, x)) as T;
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) o[k] = txDeep(locale, x);
    return o as T;
  }
  return v;
}

export type X = (<T>(s: T) => T) & { deep: <T>(v: T) => T; f: (template: string, vars: Record<string, string | number>) => string; locale: string };

export const fill = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

export function makeX(locale: string): X {
  const f = (<T,>(s: T) => (typeof s === "string" ? (tx(locale, s) as T) : s)) as X;
  f.deep = (v) => txDeep(locale, v);
  f.f = (t, vars) => fill(tx(locale, t), vars);
  f.locale = locale;
  return f;
}

/** For server components: `const x = await getX();` */
export async function getX(): Promise<X> {
  return makeX(await getLocale());
}

/** The part of the dictionary that client components need, for <XProvider>. */
export function clientDict(locale: string): Record<string, string> {
  const d = DICTS[locale];
  if (!d) return {};
  const out: Record<string, string> = {};
  for (const k of clientKeys as string[]) if (d[k] !== undefined) out[k] = d[k];
  return out;
}
