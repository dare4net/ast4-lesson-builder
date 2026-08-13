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
  '/sounds/finished-lesson.mp3',
  '/sounds/categorize-slot.mp3',
  '/sounds/categorize-bucket-complete.mp3'
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
  const url = new URL(event.request.url);

  // 1. Bypass Service Worker for non-GET requests, API calls, dynamic protocols, and browser extensions
  if (
    event.request.method !== 'GET' ||
    !url.protocol.startsWith('http') ||
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('nocache')
  ) {
    return; // Allow standard browser handling
  }

  // 2. Audio & Sound files: Cache-First (Offline Cloudinary TTS & SFX playback)
  if (url.pathname.includes('/sounds/') || url.pathname.includes('/audio/') || url.hostname.includes('res.cloudinary.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request.clone())
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              const targetCache = url.pathname.includes('/sounds/') ? SOUND_CACHE_NAME : CACHE_NAME;
              caches.open(targetCache).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('Audio asset unavailable offline', { status: 404, statusText: 'Not Found' });
          });
      })
    );
    return;
  }

  // 3. Network-First with Cache Fallback for HTML/JS/CSS assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedMatch = await caches.match(event.request);
        if (cachedMatch) {
          return cachedMatch;
        }
        // Never return undefined to respondWith() - return fallback Response to prevent browser fetch TypeError
        return new Response('Page or resource unavailable offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Listener for self-healing / emergency reset message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    }).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }
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
