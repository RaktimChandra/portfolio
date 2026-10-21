// Offline support: static assets cache-first, pages network-first with a cached fallback.
const V = "rc-v1";
const CORE = ["/", "/work", "/resume", "/contact", "/icon.svg", "/manifest.webmanifest"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(CORE).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/_vercel")) return;
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/") || /\.(woff2|svg|png|jpg|webp|avif|pdf)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(V).then((c) => c.put(req, copy)); return res; })));
    return;
  }
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(V).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/")))
    );
  }
});
