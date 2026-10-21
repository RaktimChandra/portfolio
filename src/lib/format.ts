export function ym(v: string | null, locale = "en") {
  if (!v) return "Present";
  const [y, m] = v.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString(locale === "en" ? "en-GB" : locale, { month: "short", year: "numeric", timeZone: "UTC" });
}
export function months(a: string, b: string | null) {
  const [y1, m1] = a.split("-").map(Number);
  const end = b ?? "2026-10";
  const [y2, m2] = end.split("-").map(Number);
  return Math.max(1, (y2 - y1) * 12 + (m2 - m1) + 1);
}
