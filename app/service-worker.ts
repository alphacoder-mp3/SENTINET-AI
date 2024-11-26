import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache all assets generated by your build process
precacheAndRoute(self.__WB_MANIFEST);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

// Cache API responses
registerRoute(
  /^https:\/\/api\./,
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Offline fallback
self.addEventListener('install', (event: ExtendableEvent) => {
  const offlineFallbackPage = new Request('/offline.html');
  event.waitUntil(
    fetch(offlineFallbackPage).then(response => {
      return caches.open('offline').then(cache => {
        return cache.put(offlineFallbackPage, response);
      });
    })
  );
});

export {}; // This helps with module augmentation
