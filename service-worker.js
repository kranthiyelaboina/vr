/**
 * VYOMA VR THERAPY PLATFORM
 * Service Worker for PWA functionality
 * Handles caching, offline support, and background sync
 */

const CACHE_NAME = 'vyoma-v1.0.0';
const RUNTIME_CACHE = 'vyoma-runtime-v1';

// Assets to cache immediately
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/manifest.json',
    '/config.json',
    
    // External dependencies
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/aos@2.3.1/dist/aos.css',
    'https://unpkg.com/aos@2.3.1/dist/aos.js',
    
    // Google Fonts
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;900&family=Rajdhani:wght@300;400;600;700&family=Space+Grotesk:wght@300;400;600;700&display=swap',
    
    // YouTube thumbnails (cached for offline viewing)
    'https://img.youtube.com/vi/eKumVFvGHFA/maxresdefault.jpg',
    'https://img.youtube.com/vi/7AkbUfZjS5k/maxresdefault.jpg',
    'https://img.youtube.com/vi/jqq_ZdD5Zwg/maxresdefault.jpg'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS.map(url => {
                    return new Request(url, { mode: 'cors' });
                }));
            })
            .then(() => {
                console.log('[Service Worker] Static assets cached');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('[Service Worker] Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => {
                        return cacheName.startsWith('vyoma-') && cacheName !== CACHE_NAME;
                    })
                    .map(cacheName => {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            console.log('[Service Worker] Activated');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip YouTube iframe API and video streams (require online)
    if (url.hostname === 'www.youtube.com' || 
        url.hostname === 'youtube.com' ||
        url.hostname === 'www.youtube-nocookie.com') {
        event.respondWith(
            fetch(request).catch(() => {
                // Return offline message for YouTube content
                return new Response(
                    'YouTube content requires an internet connection.',
                    {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    }
                );
            })
        );
        return;
    }
    
    // Cache-first strategy for static assets
    if (isStaticAsset(url)) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        console.log('[Service Worker] Serving from cache:', request.url);
                        return response;
                    }
                    
                    return fetchAndCache(request, CACHE_NAME);
                })
                .catch(error => {
                    console.error('[Service Worker] Fetch failed:', error);
                    return offlineFallback(request);
                })
        );
        return;
    }
    
    // Network-first strategy for dynamic content
    event.respondWith(
        fetch(request)
            .then(response => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseToCache = response.clone();
                    
                    caches.open(RUNTIME_CACHE)
                        .then(cache => {
                            cache.put(request, responseToCache);
                        });
                }
                
                return response;
            })
            .catch(() => {
                // Try to serve from cache as fallback
                return caches.match(request)
                    .then(response => {
                        if (response) {
                            console.log('[Service Worker] Offline - serving from cache:', request.url);
                            return response;
                        }
                        
                        return offlineFallback(request);
                    });
            })
    );
});

// Helper function to determine if URL is a static asset
function isStaticAsset(url) {
    const staticExtensions = [
        '.html', '.css', '.js', '.json',
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
        '.woff', '.woff2', '.ttf', '.eot'
    ];
    
    return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Helper function to fetch and cache
function fetchAndCache(request, cacheName) {
    return fetch(request)
        .then(response => {
            if (!response || response.status !== 200 || response.type === 'opaque') {
                return response;
            }
            
            const responseToCache = response.clone();
            
            caches.open(cacheName)
                .then(cache => {
                    cache.put(request, responseToCache);
                });
            
            return response;
        });
}

// Offline fallback response
function offlineFallback(request) {
    const url = new URL(request.url);
    
    // Return offline HTML page for navigation requests
    if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
        return caches.match('/index.html')
            .then(response => {
                if (response) {
                    return response;
                }
                
                return new Response(
                    generateOfflineHTML(),
                    {
                        headers: {
                            'Content-Type': 'text/html'
                        }
                    }
                );
            });
    }
    
    // Return offline message for other requests
    return new Response(
        'Offline - Content not available',
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        }
    );
}

// Generate offline HTML
function generateOfflineHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vyoma - Offline</title>
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
            padding: 20px;
        }
        .offline-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            max-width: 500px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
        }
        .icon {
            font-size: 5rem;
            margin-bottom: 30px;
        }
        p {
            font-size: 1.2rem;
            line-height: 1.6;
            opacity: 0.9;
        }
        button {
            background: white;
            color: #667eea;
            border: none;
            padding: 15px 30px;
            font-size: 1rem;
            border-radius: 50px;
            margin-top: 30px;
            cursor: pointer;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: transform 0.3s;
        }
        button:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="icon">🌐</div>
        <h1>You're Offline</h1>
        <p>
            Vyoma therapy sessions require an internet connection to stream 360° video content.
            Please check your connection and try again.
        </p>
        <button onclick="location.reload()">Retry Connection</button>
    </div>
</body>
</html>
    `;
}

// Background sync for future updates
self.addEventListener('sync', event => {
    console.log('[Service Worker] Background sync triggered');
    
    if (event.tag === 'update-cache') {
        event.waitUntil(updateCache());
    }
});

// Update cache in background
async function updateCache() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        
        const updatePromises = requests.map(request => {
            return fetch(request).then(response => {
                if (response && response.status === 200) {
                    return cache.put(request, response);
                }
            }).catch(error => {
                console.error('[Service Worker] Failed to update cache for:', request.url);
            });
        });
        
        await Promise.all(updatePromises);
        console.log('[Service Worker] Cache updated successfully');
        
    } catch (error) {
        console.error('[Service Worker] Cache update failed:', error);
    }
}

// Message handling
self.addEventListener('message', event => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                console.log('[Service Worker] All caches cleared');
            })
        );
    }
});

console.log('[Service Worker] Loaded');