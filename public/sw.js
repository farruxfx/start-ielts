/* ============================================================
   StartIELTS Service Worker (Phase 9.2 / 9.5)
   Strategy:
   - App shell + static assets: cache-first (stale-while-revalidate)
   - Pages: network-first with cache fallback
   - API: network-only (never cache user data)
   - Offline fallback: /offline.html
   ============================================================ */

const VERSION = 'v1';
const STATIC_CACHE = `startielts-static-${VERSION}`;
const PAGE_CACHE = `startielts-pages-${VERSION}`;
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = ['/', OFFLINE_URL, '/manifest.json', '/favicon.svg', '/logo.svg'];

// Install — precache the offline fallback and app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate — drop old version caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(
              key =>
                key.startsWith('startielts-') &&
                key !== STATIC_CACHE &&
                key !== PAGE_CACHE
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle same-origin GET requests
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API calls: network only (never cache user data)
  if (url.pathname.startsWith('/api/')) return;

  // Navigations: network-first, fall back to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(PAGE_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return offline || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Static assets & pages: cache-first with background refresh
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches
              .open(request.destination === 'style' || request.destination === 'script' ? STATIC_CACHE : PAGE_CACHE)
              .then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
