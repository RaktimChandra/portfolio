// Renders public/resume.pdf from the live /resume page and the PNG app icons from icon.svg.
// usage: node scripts/assets.mjs http://localhost:3100
import chromium from "@sparticuz/chromium";
import { chromium as pw } from "playwright-core";
import { readFileSync } from "node:fs";

const base = process.argv[2] || "http://localhost:3100";
const browser = await pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true });

const page = await browser.newPage({ colorScheme: "light" });
await page.goto(`${base}/resume?reality=glass`, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({ path: "public/resume.pdf", format: "A4", printBackground: true, margin: { top: "11mm", bottom: "11mm", left: "12mm", right: "12mm" } });
console.log("wrote public/resume.pdf");

const svg = readFileSync("public/icon.svg", "utf8");
for (const s of [192, 512]) {
  const p = await browser.newPage({ viewport: { width: s, height: s } });
  const inner = s === 512 ? svg.replace('rx="32"', 'rx="0"') : svg;
  await p.setContent(`<html><body style="margin:0;background:#111">${inner.replace("<svg ", `<svg width="${s}" height="${s}" `)}</body></html>`);
  await p.screenshot({ path: `public/icon-${s}.png`, omitBackground: false });
  console.log(`wrote public/icon-${s}.png`);
}
await browser.close();
