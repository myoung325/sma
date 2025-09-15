const CACHE_NAME = 'stop-motion-cache-v13'; // Increment this version when you deploy updates

const urlsToCache = [
  './',
  './index.html',
  './animator.css',
  './manifest.json',
  './js/main.js',
  './js/animator.js',
  './js/assets.js',
  './js/webm.js',
  './images/stop-motion-192.png',
  './images/stop-motion-512.png',
  // Add any other assets as needed
];

// Install: Cache files and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate the new service worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate: Delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Remove outdated caches
          }
        })
      )
    ).then(() => self.clients.claim()) // Claim control of all pages immediately
  );
});

// Fetch: Serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
