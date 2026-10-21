// End-to-end smoke test of the interactive features. usage: node scripts/smoke.mjs http://localhost:3100
import chromium from "@sparticuz/chromium";
import { chromium as pw } from "playwright-core";
const base = process.argv[2] || "http://localhost:3100";
const out = process.argv[3] || ".";
const browser = await pw.launch({ executablePath: await chromium.executablePath(), args: [...chromium.args, "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "dark" });
const errs = [];
page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
page.on("console", (m) => m.type() === "error" && !/TUNNEL|avatars|_vercel/.test(m.text()) && errs.push(m.text()));
let ok = 0, bad = 0;
const check = async (name, fn) => {
  try { await fn(); ok++; console.log("PASS", name); }
  catch (e) { bad++; console.log("FAIL", name, "-", e.message.split("\n")[0]); await page.screenshot({ path: `${out}/fail-${name.replace(/\W+/g, "_")}.png` }); }
};
await page.goto(base, { waitUntil: "networkidle" });

await check("command palette opens with Ctrl+K and navigates", async () => {
  await page.keyboard.press("Control+k");
  await page.getByPlaceholder(/Type a page/).fill("Bulwark");
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/work\/bulwark/);
});
await check("reality dial switches reality and URL", async () => {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.keyboard.press("r");
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => document.documentElement.dataset.reality);
  if (r !== "web1") throw new Error("reality is " + r);
  if (!page.url().includes("reality=web1")) throw new Error("url " + page.url());
  await page.keyboard.press("Escape");
});
await check("reality persists across navigation", async () => {
  await page.goto(base + "/work", { waitUntil: "networkidle" });
  const r = await page.evaluate(() => document.documentElement.dataset.reality);
  if (r !== "web1") throw new Error("reality is " + r);
  await page.evaluate(() => localStorage.setItem("rc.reality", "glass"));
});
await check("theme toggle flips data-theme", async () => {
  await page.goto(base, { waitUntil: "networkidle" });
  const a = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.getByRole("button", { name: /^Theme/ }).click();
  const b = await page.evaluate(() => document.documentElement.dataset.theme);
  if (a === b) throw new Error("unchanged " + a);
  await page.getByRole("button", { name: /^Theme/ }).click();
});
await check("AI twin answers with sources", async () => {
  await page.getByRole("button", { name: "Which projects use Kafka?" }).click();
  await page.locator(".twin__src").first().waitFor({ timeout: 10000 });
  const t = await page.locator(".twin__a").first().innerText();
  if (!/PortSync/.test(t)) throw new Error(t.slice(0, 120));
});
await check("persona router shows guidance", async () => {
  await page.getByRole("button", { name: "Hiring" }).click();
  await page.locator(".persona__note").waitFor();
});
await check("terminal runs whoami", async () => {
  await page.locator("body").click({ position: { x: 5, y: 400 } });
  await page.keyboard.press("`");
  await page.locator("#term-input").fill("whoami");
  await page.keyboard.press("Enter");
  await page.getByText(/AI, ML and full-stack engineer · Chennai/).waitFor();
  await page.keyboard.press("Escape");
});
await check("work filters and 3D constellation", async () => {
  await page.goto(base + "/work", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Testing and QA/ }).click();
  const n = await page.locator(".card").count();
  if (n < 2 || n > 6) throw new Error("cards " + n);
  await page.getByRole("button", { name: /Constellation/ }).click();
  await page.locator(".constellation canvas").waitFor({ timeout: 15000 });
});
await check("job matcher scores a sample", async () => {
  await page.goto(base + "/match", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Try a sample" }).click();
  await page.getByText("Skill coverage").first().waitFor();
  await page.locator(".cv").waitFor();
});
await check("scoper produces a plan", async () => {
  await page.goto(base + "/scope", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "AI agent or assistant" }).click();
  await page.getByText(/weeks$/).first().waitFor();
});
await check("language switch to Bengali", async () => {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "বা" }).click();
  await page.waitForURL(/\/bn/);
  await page.getByText("কাজ দেখুন").waitFor();
});
await check("404 penalty game", async () => {
  await page.goto(base + "/does-not-exist", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Shoot top left" }).click();
  await page.getByText(/Goals 1|Goals 0/).waitFor();
});
await check("status page lists demos", async () => {
  await page.goto(base + "/status", { waitUntil: "networkidle" });
  await page.getByText(/demos responding/).waitFor({ timeout: 30000 });
});
await check("interview mode reveals a STAR answer", async () => {
  await page.goto(base + "/interview", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /What's the hardest technical problem/ }).click();
  await page.getByRole("button", { name: "Hear Raktim's answer" }).click();
  await page.locator(".iv__star li.is-on").first().waitFor();
});
await check("blog post renders with a table", async () => {
  await page.goto(base + "/blog", { waitUntil: "networkidle" });
  await page.getByText("How we reached 0.9628 F0.5").click();
  await page.locator(".post__table table").waitFor();
});
await check("Hindi case study is translated", async () => {
  await page.goto(base + "/hi/work/bulwark", { waitUntil: "networkidle" });
  await page.getByText("पाँच फ़्रॉड एजेंट").first().waitFor();
});
await check("3D project tiles render", async () => {
  await page.goto(base + "/work", { waitUntil: "networkidle" });
  await page.locator(".tiles3d__canvas canvas, canvas.tiles3d__canvas, .tiles3d canvas").first().waitFor({ timeout: 15000 });
});
await check("contact card QR and vCard", async () => {
  const r = await page.request.get(base + "/raktim.vcf");
  if (!(await r.text()).includes("BEGIN:VCARD")) throw new Error("no vcard");
  await page.goto(base + "/contact", { waitUntil: "networkidle" });
  await page.locator(".contact-card__qr svg").waitFor();
});
await check("twin answers an interview question", async () => {
  const r = await page.request.post(base + "/api/ask", { data: { q: "Why should we hire him?" } });
  const j = await r.json();
  if (j.intent !== "interview") throw new Error(JSON.stringify(j).slice(0, 120));
});
await check("mobile menu opens", async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Menu" }).click();
  await page.locator("#mobile-menu").waitFor();
});
console.log(`\n${ok} passed, ${bad} failed`);
console.log(errs.length ? "console errors:\n" + [...new Set(errs)].join("\n") : "no console errors");
await browser.close();
