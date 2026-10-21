import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { match } from "./matcher";

/**
 * Reads a company's public homepage and maps what they say they do onto Raktim's record.
 * Guarded: http(s) only, public addresses only (no localhost, private or link-local ranges),
 * 6 s timeout, first 400 KB, at most 3 redirects, each re-checked.
 */
export type Company = { name: string; domain: string; about: string; matched: string[]; projects: string[]; fetched: boolean };

const PRIVATE = [/^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^0\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^::1$/, /^f[cd]/i, /^fe80/i, /^::ffff:(10|127|192\.168|169\.254)\./i];

async function safe(u: URL) {
  if (!/^https?:$/.test(u.protocol) || u.username || u.password) return false;
  if (u.port && !["80", "443"].includes(u.port)) return false;
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
  const addrs = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address);
  return addrs.length > 0 && addrs.every((a) => !PRIVATE.some((r) => r.test(a)));
}

export function normalise(input: string) {
  const raw = input.trim().replace(/\s+/g, "");
  if (!raw) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!u.hostname.includes(".")) return null;
    return u;
  } catch {
    return null;
  }
}

const strip = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>|<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const metaOf = (html: string, key: string) =>
  html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]*content=["']([^"']{3,400})["']`, "i"))?.[1] ??
  html.match(new RegExp(`<meta[^>]+content=["']([^"']{3,400})["'][^>]*(?:name|property)=["']${key}["']`, "i"))?.[1];

export function nameFromDomain(domain: string) {
  const core = domain.replace(/^www\./, "").split(".")[0];
  return core.charAt(0).toUpperCase() + core.slice(1);
}

/** At most 20 outbound homepage reads a minute per server instance, so the page can't be used as a crawler. */
const recent: number[] = [];
function allowFetch() {
  const now = Date.now();
  while (recent.length && now - recent[0] > 60_000) recent.shift();
  if (recent.length >= 20) return false;
  recent.push(now);
  return true;
}

export async function readCompany(input: string): Promise<Company | null> {
  let u = normalise(input);
  if (!u) return null;
  const allowed = allowFetch();
  const domain = u.hostname.replace(/^www\./, "");
  let html = "";
  try {
    for (let hop = 0; allowed && hop < 4; hop++) {
      if (!(await safe(u))) break;
      const r: Response = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(6000), headers: { "User-Agent": "raktimchandra.vercel.app tailoring (reads public homepage once)", Accept: "text/html" }, next: { revalidate: 86400 } });
      if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
        u = new URL(r.headers.get("location")!, u);
        continue;
      }
      if (!r.ok || !(r.headers.get("content-type") ?? "").includes("html") || !r.body) break;
      const reader = r.body.getReader();
      const chunks: Uint8Array[] = [];
      let n = 0;
      while (n < 400_000) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        chunks.push(value);
        n += value.length;
      }
      reader.cancel().catch(() => {});
      html = new TextDecoder().decode(Buffer.concat(chunks));
      break;
    }
  } catch {}
  const title = html.match(/<title[^>]*>([^<]{2,200})<\/title>/i)?.[1]?.trim() ?? "";
  const site = metaOf(html, "og:site_name");
  const desc = metaOf(html, "description") ?? metaOf(html, "og:description") ?? "";
  const text = `${title} ${desc} ${strip(html).slice(0, 20000)}`;
  const m = match(text);
  return {
    name: (site || title.split(/[|\-–—:·]/)[0] || nameFromDomain(domain)).trim().slice(0, 60) || nameFromDomain(domain),
    domain,
    about: strip(desc).slice(0, 280),
    matched: m.matched.slice(0, 14),
    projects: m.projects.map((p) => p.slug).slice(0, 4),
    fetched: html.length > 0,
  };
}
