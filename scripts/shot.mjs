// usage: node scripts-shot.mjs <url> <outprefix> [widths] [fullPage] [evalJS]
import chromium from "@sparticuz/chromium";
import { chromium as pw } from "playwright-core";
const [url, out, widths = "1440,390", full = "0", js = ""] = process.argv.slice(2);
const browser = await pw.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args, "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"], headless: true });
for (const w of widths.split(",").map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: w < 600 ? 844 : 900 }, deviceScaleFactor: 1, colorScheme: process.env.SCHEME || "dark" });
  const logs = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => logs.push("goto: " + e.message));
  await page.waitForTimeout(2500);
  if (js) { await page.evaluate(js).catch((e) => logs.push("eval: " + e.message)); await page.waitForTimeout(1500); }
  await page.screenshot({ path: `${out}-${w}.png`, fullPage: full === "1" });
  console.log(w, logs.length ? logs.join("\n") : "no console errors");
  await page.close();
}
await browser.close();
