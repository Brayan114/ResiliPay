const CACHE_NAME = 'resilipay-cache-v6';
const ASSETS = [
    './',
    './index.html',
    './index.css',
    './qrcode.js',
    './jsqr.js',
    './resilipay-sdk.js',
    './app.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap'
];

// Install Event - Caching Assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching Application Shell...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean old caches and take control immediately
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Network-First strategy (try server, fall back to cache for offline)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((networkResponse) => {
                // Got a fresh response from the server — update the cache with it
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, clone);
                });
                return networkResponse;
            })
            .catch(() => {
                // Network failed (offline) — serve from cache
                return caches.match(e.request).then((cachedResponse) => {
                    return cachedResponse || new Response('Offline and no cached version available.', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});
