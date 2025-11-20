// MzeeChakula Service Worker
// Version 1.0.0

const CACHE_VERSION = 'mzeechakula-v1.0.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const API_CACHE = `${CACHE_VERSION}-api`

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_API_CACHE_SIZE = 20

// Helper: Limit cache size
const limitCacheSize = async (cacheName, maxSize) => {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxSize) {
    await cache.delete(keys[0])
    await limitCacheSize(cacheName, maxSize)
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', CACHE_VERSION)

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Installation complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', CACHE_VERSION)

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('mzeechakula-') && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete')
        return self.clients.claim()
      })
  )
})

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests (network first, fallback to cache)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/predict/') || url.pathname.startsWith('/health/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response before caching
          const responseClone = response.clone()

          // Cache successful responses
          if (response.status === 200) {
            caches.open(API_CACHE)
              .then((cache) => {
                cache.put(request, responseClone)
                limitCacheSize(API_CACHE, MAX_API_CACHE_SIZE)
              })
          }

          return response
        })
        .catch(async () => {
          // Fallback to cache if network fails
          const cachedResponse = await caches.match(request)

          if (cachedResponse) {
            console.log('[SW] Serving cached API response:', url.pathname)
            return cachedResponse
          }

          // Return offline message for API requests
          return new Response(
            JSON.stringify({
              error: 'offline',
              message: 'You are currently offline. Please check your connection.'
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          )
        })
    )
    return
  }

  // Handle static assets (cache first, fallback to network)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', url.pathname)
          return cachedResponse
        }

        // Fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response
            }

            // Clone response before caching
            const responseClone = response.clone()

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone)
                limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE)
              })

            return response
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error)

            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index.html')
            }

            // Return error response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            })
          })
      })
  )
})

// Background sync event (for future enhancements)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-predictions') {
    event.waitUntil(
      // Sync predictions when back online
      fetch('/api/sync')
        .then((response) => response.json())
        .then((data) => {
          console.log('[SW] Sync complete:', data)
        })
        .catch((error) => {
          console.error('[SW] Sync failed:', error)
        })
    )
  }
})

// Push notification event (for future enhancements)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')

  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('MzeeChakula', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)

  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)

  if (event.data.action === 'skipWaiting') {
    self.skipWaiting()
  }

  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          )
        })
        .then(() => {
          event.ports[0].postMessage({ success: true })
        })
    )
  }
})

console.log('[SW] Service Worker loaded', CACHE_VERSION)
