// Loads pages in every reality at desktop and phone width and reports anything wider than the screen.
// usage: node scripts/fit-audit.mjs http://localhost:3100 outdir [paths...]
import chromium from "@sparticuz/chromium";
import { chromium as pw } from "playwright-core";
const [base = "http://localhost:3100", out = ".", ...paths] = process.argv.slice(2);
const pages = paths.length ? paths : ["/", "/work", "/work/bulwark", "/resume"];
const ids = ["glass","web1","topographic","psychedelic","watercolour","teletext","origami","thermal","memphis","flowfield","neumorphism","wordart","collage","datamosh","spirograph","aurora","opart","lightpainting","dither1bit","skeuomorphic","retrodesktop"];
const report = [];
for (const w of [1440, 390]) {
  const browser = await pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args });
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const id of ids) {
    for (const p of pages) {
      await page.goto(`${base}${p}${p.includes("?") ? "&" : "?"}reality=${id}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const bad = [];
        for (const el of document.querySelectorAll("body *")) {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed") continue;
          if (el.closest(".hero__word, .sr-only, canvas, .dial__list, .post__table, .tiles3d__canvas, svg, .cw__code, .demo__table-wrap")) continue;
          const b = el.getBoundingClientRect();
          if (b.width && (b.right > vw + 1 || b.left < -1)) {
            // only report the outermost offender
            if (!bad.some((x) => x.el.contains(el))) bad.push({ el, tag: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ").slice(0, 2).join(".") : ""), right: Math.round(b.right), text: (el.textContent || "").trim().slice(0, 40) });
          }
        }
        return { sw: document.documentElement.scrollWidth, vw, bad: bad.slice(0, 6).map(({ el, ...x }) => x) };
      });
      if (r.sw > r.vw + 1 || r.bad.length) report.push({ w, id, p, ...r });
    }
    if (w === 390 || id === "glass") await page.screenshot({ path: `${out}/fit-${id}-${w}.png` }).catch(() => {});
  }
  await browser.close();
}
for (const r of report) console.log(`${r.w} ${r.id.padEnd(13)} ${r.p.padEnd(15)} scrollW=${r.sw}/${r.vw} ${r.bad.map((b) => `${b.tag}→${b.right} "${b.text}"`).join(" | ")}`);
console.log("issues:", report.length);
