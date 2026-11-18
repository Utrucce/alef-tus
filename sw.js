// ALΣF TUS - Hizmet Çalışanı (Service Worker)
const CACHE_NAME = 'alef-tus-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/ic_launcher.webp',
  './assets/pitrak.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache static JSON and models dynamically
        const url = event.request.url;
        if (url.includes('.json') || url.includes('.glb') || url.includes('.jpg') || url.includes('.png') || url.includes('.js')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        // Fallback if offline
        return caches.match('./index.html');
      });
    })
  );
});
