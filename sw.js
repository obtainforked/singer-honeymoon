const CACHE = 'honeymoon-2026-07-v25';
const PRECACHE = ["index.html", "study.html", "timeline.html", "passport.html", "prep.html", "taipei.html", "chengdu.html", "chongqing.html", "sanya.html", "guangzhou.html", "shenzhen.html", "hong-kong.html", "macau.html", "manifest.webmanifest", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/icon-maskable-512.png", "assets/icons/apple-touch-icon.png"];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(
    PRECACHE.map(u => c.add(new Request(u, {cache:'reload'}))))));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Navigations: network-first, fall back to cache (then offline shell).
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        const c = await caches.open(CACHE); c.put(req, net.clone()); return net;
      } catch (err) {
        const cached = await caches.match(req);
        return cached || caches.match('index.html');
      }
    })());
    return;
  }
  // Everything else (assets, tiles, fonts): cache-first, then network.
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const net = await fetch(req);
      if (net && net.status === 200 && (url.origin === location.origin || net.type === 'opaque')) {
        const c = await caches.open(CACHE); c.put(req, net.clone());
      }
      return net;
    } catch (err) { return cached || Response.error(); }
  })());
});
