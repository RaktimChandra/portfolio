/**
 * Measures how wide the current display font is (average character width / font size)
 * and stores it as --dwf on <html>. Every big headline sizes itself with it, so each of
 * the 21 styles fits, whether its display face is condensed Archivo, Times or a pixel font.
 */
export function measureDisplayWidth() {
  if (typeof document === "undefined") return;
  const probe = document.createElement("span");
  probe.className = "display";
  probe.textContent = "RAKTIMCHANDRA";
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:absolute;left:-9999px;top:0;font-size:100px;white-space:nowrap;visibility:hidden;letter-spacing:var(--display-tracking)";
  document.body.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  const dwf = Math.min(1.1, Math.max(0.38, w / 1300));
  document.documentElement.style.setProperty("--dwf", dwf.toFixed(3));
}
