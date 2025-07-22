// Service Worker for AST Lesson Builder PWA

const CACHE_NAME = 'ast-builder-cache-v2';
const SOUND_CACHE_NAME = 'ast-builder-sounds-v1';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/register-sw.js',
  '/placeholder-logo.png'
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
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Check if this is a sound file request
          if (event.request.url.includes('/sounds/')) {
            // Clone the response because it can only be used once
            const responseToCache = response.clone();

            // Cache the sound file for future use
            caches.open(SOUND_CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('Cached sound file:', event.request.url);
              });
          }

          return response;
        }).catch(error => {
          console.error('Error fetching:', error);
          return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, SOUND_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
