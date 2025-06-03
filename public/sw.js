// Service Worker for Rick and Morty Dating Simulator
const CACHE_NAME = 'rick-morty-dating-sim-v1';
const urlsToCache = [
  '/',
  '/api/characters',
  '/attached_assets/rick.jpg',
  '/attached_assets/morty.jpg',
  '/attached_assets/evil-morty.png',
  '/attached_assets/RICKPRIME.webp',
  '/attached_assets/200w.gif'
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
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});