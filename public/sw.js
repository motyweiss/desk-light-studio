/**
 * Service Worker for Smart Home Dashboard
 * Implements intelligent caching strategies for optimal performance
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/bg.png',
  '/src/main.tsx',
  '/src/index.css',
];

// Cache duration limits (in milliseconds)
const CACHE_LIMITS = {
  static: 7 * 24 * 60 * 60 * 1000,  // 7 days
  api: 5 * 60 * 1000,                // 5 minutes
  dynamic: 24 * 60 * 60 * 1000,      // 24 hours
};

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('static-') || 
                     name.startsWith('dynamic-') || 
                     name.startsWith('api-');
            })
            .filter((name) => {
              return name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE && 
                     name !== API_CACHE;
            })
            .map((name) => {
              console.log('[SW] Removing old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch Event - Intelligent routing with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different resource types
  if (isStaticAsset(url)) {
    // Cache First for static assets (JS, CSS, fonts, images)
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isHomeAssistantAPI(url)) {
    // Network First with cache fallback for HA API
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, 3000));
  } else if (isImageAsset(url)) {
    // Cache First for images with dynamic cache
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else {
    // Stale While Revalidate for everything else
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

/**
 * Cache First Strategy
 * Try cache first, fallback to network if not found
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First with Timeout Strategy
 * Try network first with timeout, fallback to cache
 */
async function networkFirstWithTimeout(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(request, { 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      // Clone and cache successful responses
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed or timed out - try cache
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[SW] Serving from cache (network failed):', request.url);
      return cached;
    }
    
    console.error('[SW] No cache available for:', request.url);
    return new Response(
      JSON.stringify({ error: 'Offline', cached: false }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  
  return cached || fetchPromise;
}

/**
 * Resource type detection helpers
 */
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/);
}

function isImageAsset(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/);
}

function isHomeAssistantAPI(url) {
  return url.pathname.includes('/api/');
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
