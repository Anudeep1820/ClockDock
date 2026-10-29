// ClockDock Service Worker — Offline PWA Support (v4)
const CACHE_NAME = 'clockdock-v4-cache';

// Core assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon.svg',
];

// Install event: cache core shell assets and discover bundle assets from /index.html
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        // 1. Precache known shell assets
        await cache.addAll(PRECACHE_ASSETS);

        // 2. Dynamically parse /index.html to extract and precache generated JS/CSS bundles
        try {
          const res = await fetch('/index.html');
          if (res && res.status === 200) {
            const html = await res.text();
            const bundleRegex = /(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g;
            const discoveredAssets = new Set();
            let match;
            while ((match = bundleRegex.exec(html)) !== null) {
              discoveredAssets.add(match[1]);
            }
            if (discoveredAssets.size > 0) {
              await cache.addAll(Array.from(discoveredAssets));
            }
          }
        } catch {
          // If fetching index.html fails during install (e.g. offline re-install), proceed with precached assets
        }
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event: Network-first for HTML, Stale-while-revalidate / Cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests or browser extension URLs
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle navigation requests (e.g. reloading the page offline)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // If offline, return cached page or fallback to /index.html
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          return (
            fallback ||
            new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
          );
        })
    );
    return;
  }

  // Handle static assets (JS, CSS, fonts, SVG) with Cache-First or Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Background fetch failed silently (offline)
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If an asset fails offline and has no cache, return 408
          return new Response('', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
    })
  );
});
