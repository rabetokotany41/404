import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Nom du cache
const CACHE_NAME = 'mpanolotsaina-v1';

// Ressources à mettre en cache lors de l'installation
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// URLs d'API à mettre en cache
const API_CACHE_URLS = [
  '/api/check',
  '/api/learning/modules',
  '/api/analytics/user',
  '/api/auth/profile'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Error caching static assets:', error);
      })
  );
  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prendre le contrôle immédiatement
  self.clients.claim();
});

// Stratégies de cache pour différentes ressources

// Cache pour les ressources statiques (CSS, JS, images)
registerRoute(
  ({ request }) => request.destination === 'script' ||
                   request.destination === 'style' ||
                   request.destination === 'image' ||
                   request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 24 * 60 * 60, // 24 heures
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache pour les pages HTML (Network First pour la fraîcheur)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 heure
      }),
    ],
  })
);

// Cache pour les appels API (Stale While Revalidate)
registerRoute(
  ({ url }) => API_CACHE_URLS.some(apiUrl => url.pathname.includes(apiUrl)),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 60, // 30 minutes
      }),
      new BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60 * 60, // 24 heures
      }),
    ],
  })
);

// Cache pour les images externes (particulièrement utile pour Madagascar)
registerRoute(
  ({ url }) => url.origin !== self.location.origin &&
               (url.pathname.endsWith('.jpg') ||
                url.pathname.endsWith('.jpeg') ||
                url.pathname.endsWith('.png') ||
                url.pathname.endsWith('.gif') ||
                url.pathname.endsWith('.webp')),
  new CacheFirst({
    cacheName: 'external-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Gestion des erreurs réseau et mode hors-ligne
self.addEventListener('fetch', (event) => {
  // Pour les requêtes de navigation en mode hors-ligne
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html') || caches.match('/');
        })
    );
  }

  // Pour les requêtes API en mode hors-ligne
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Mettre en cache les réponses réussies
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open('api-cache').then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Retourner une réponse du cache si disponible
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Retourner une réponse d'erreur personnalisée
            return new Response(
              JSON.stringify({
                error: 'offline',
                message: 'Contenu non disponible hors ligne',
                offline: true
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
  }
});

// Synchronisation en arrière-plan
const bgSyncPlugin = new BackgroundSyncPlugin('offline-checks-queue', {
  maxRetentionTime: 24 * 60 * 60, // 24 heures
  onSync: async ({ queue }) => {
    console.log('Synchronisation des vérifications hors-ligne');
    try {
      const entries = await queue.getAll();
      for (const entry of entries) {
        try {
          const response = await fetch(entry.request);
          if (response.ok) {
            // Marquer comme synchronisé dans IndexedDB
            if ('indexedDB' in self) {
              const db = await self.indexedDB.open('mpanolotsaina_offline');
              const tx = db.transaction('offline_checks', 'readwrite');
              const store = tx.objectStore('offline_checks');

              // Trouver et marquer la vérification comme synchronisée
              const checks = await store.getAll();
              const checkToUpdate = checks.find(check =>
                check.content === entry.request.body?.content
              );
              if (checkToUpdate) {
                checkToUpdate.synced = true;
                await store.put(checkToUpdate);
              }
            }
          }
        } catch (error) {
          console.error('Erreur synchronisation vérification:', error);
          throw error; // Relancer pour retry
        }
      }
    } catch (error) {
      console.error('Erreur synchronisation arrière-plan:', error);
    }
  }
});

// Messages du client principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.keys().then((cacheNames) => {
      const cacheInfo = {};
      const promises = cacheNames.map(async (cacheName) => {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[cacheName] = keys.length;
      });

      Promise.all(promises).then(() => {
        event.ports[0].postMessage({
          type: 'CACHE_INFO',
          data: cacheInfo
        });
      });
    });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      ).then(() => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          success: true
        });
      });
    });
  }
});

// Nettoyage périodique du cache
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.open(cacheName).then((cache) => {
              return cache.keys().then((keys) => {
                // Supprimer les entrées trop anciennes
                const deletePromises = keys
                  .filter((request) => {
                    // Logique de nettoyage personnalisée
                    return false; // À implémenter selon les besoins
                  })
                  .map((request) => cache.delete(request));

                return Promise.all(deletePromises);
              });
            });
          })
        );
      })
    );
  }
});

// Gestion des erreurs non capturées
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker Mpanolo-tsaina AI chargé');