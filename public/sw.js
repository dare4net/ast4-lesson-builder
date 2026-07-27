// Service Worker for AST Lesson Builder PWA

const CACHE_NAME = 'ast-builder-cache-v4';
const SOUND_CACHE_NAME = 'ast-builder-sounds-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/register-sw.js',
  '/icons/icon-512x512.png'
];

const soundsToCache = [
  '/sounds/streak.mp3',
  '/sounds/level-up.mp3',
  '/sounds/incorrect.wav',
  '/sounds/flashcard-flip.mp3',
  '/sounds/correct.mp3',
  '/sounds/click.wav',
  '/sounds/complete.mp3',
  '/sounds/ui-click.mp3',
  '/sounds/dng-click.mp3',
  '/sounds/dng-success.mp3',
  '/sounds/quiz-success.mp3',
  '/sounds/finished-lesson.mp3'
];

console.log('Service Worker Initialized');

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force new service worker to activate immediately
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Opened main cache');
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
            });
          })
        );
      }),
      caches.open(SOUND_CACHE_NAME).then((cache) => {
        console.log('Opened sound cache');
        return Promise.all(
          soundsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`Failed to cache sound ${url}:`, err);
            });
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Sound files: Cache-First
  if (event.request.url.includes('/sounds/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;
        return fetch(event.request.clone()).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(SOUND_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-First for HTML and JS/CSS updates (PWA content)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If network returns a valid response, update the cache copy
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails (offline), fall back to cached version
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Take control of all clients immediately
      caches.keys().then((cacheNames) => {
        const cacheWhitelist = [CACHE_NAME, SOUND_CACHE_NAME];
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});
