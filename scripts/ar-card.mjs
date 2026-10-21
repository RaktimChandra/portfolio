// Builds public/card.glb and public/card.usdz: an 85 x 50 mm business card for AR (front: contact + QR, back: the poster line).
// usage: node scripts/ar-card.mjs   (serves the repo on :4777 briefly, renders in headless Chromium)
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import chromium from "@sparticuz/chromium";
import { chromium as pw } from "playwright-core";
const root = process.cwd();
const types = { ".html": "text/html", ".js": "text/javascript", ".txt": "text/plain", ".woff2": "font/woff2" };
const srv = createServer(async (q, r) => {
  try { const f = join(root, decodeURIComponent(q.url.split("?")[0])); r.writeHead(200, { "Content-Type": types[extname(f)] || "application/octet-stream" }); r.end(await readFile(f)); }
  catch { r.writeHead(404); r.end(); }
}).listen(4777);
const b = await pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args });
const p = await b.newPage();
p.on("pageerror", (e) => console.error(e.message));
await p.goto("http://localhost:4777/scripts/ar/build.html");
const b64 = await p.waitForFunction(() => window.__glb, null, { timeout: 60000 }).then((h) => h.jsonValue());
await writeFile("public/card.glb", Buffer.from(b64, "base64"));
const usdz = await p.evaluate(() => window.__usdz);
await writeFile("public/card.usdz", Buffer.from(usdz, "base64"));
console.log("public/card.usdz", Math.round(usdz.length * 0.75 / 1024), "KB");
console.log("public/card.glb", Math.round(b64.length * 0.75 / 1024), "KB");
await b.close(); srv.close();
