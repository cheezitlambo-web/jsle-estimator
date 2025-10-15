// public/sw.js
const SW_VERSION = "v2";
const PRECACHE = `precache-${SW_VERSION}`;
const RUNTIME = `runtime-${SW_VERSION}`;

const PRECACHE_URLS = [
  "/",                        // start page
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k.includes(SW_VERSION) ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Network-first for navigations (HTML), so fresh data when online.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== "GET") return;

  // Navigate requests (page loads)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/"))
    );
    return;
  }

  const url = new URL(req.url);

  // Same-origin static: stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Cross-origin (e.g., fonts/CDNs): cache-first fallback
  event.respondWith(
    caches.open(RUNTIME).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        return cached;
      }
    })
  );
});
