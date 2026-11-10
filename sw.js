const CACHE_NAME = 'fatwa-mui-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear all old caches immediately
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always let network fetch freshest files
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/pdf-proxy/') || event.request.headers.has('range')) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
