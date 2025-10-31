const CACHE = 'coin-app-cache-v3';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put('/', fresh.clone());
        cache.put('/index.html', fresh.clone());
        return fresh;
      } catch (err) {
        const cache = await caches.open(CACHE);
        return (await cache.match('/index.html')) || (await cache.match('/'));
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  })());
});
