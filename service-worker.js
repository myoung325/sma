const CACHE_NAME = 'stop-motion-cache-v1';

const urlsToCache = [
  './',
  './index.html',
  './animator.css',
  './manifest.json',
  './js/main.js', // Adjust if your main JS file has a different name
  './images/stop-motion-192.png',
  './images/stop-motion-512.png',
  // Add any other static files or images you need cached
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
