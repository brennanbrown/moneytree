const CACHE_NAME = 'moneytree-shell-v2';
const APP_SHELL = [
  '/',
  '/assets/app.js',
  '/assets/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : undefined)))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Same-origin only
  if (url.origin !== self.location.origin) return;

  // App shell: cache-first
  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, copy));
        return resp;
      }))
    );
    return;
  }

  // Assets: stale-while-revalidate
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return resp;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Pages and others: network-first with cache fallback
  event.respondWith(
    fetch(request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then((c) => c.put(request, copy));
      return resp;
    }).catch(() => caches.match(request))
  );
});
