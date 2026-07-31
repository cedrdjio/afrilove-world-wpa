/*
 * AfroLove World — Service Worker (compatible Turbopack, sans dépendance).
 *
 * Stratégies :
 *  - Précache de l'app shell minimal (accueil + repli offline + icônes).
 *  - Navigations (documents)   : network-first → cache → /offline.
 *  - Statique Next (_next/…)   : stale-while-revalidate (immuable, hashé).
 *  - Images                    : cache-first (plafonné).
 * Nettoyage automatique des anciens caches à l'activation.
 *
 * ⚠️ Incrémentez CACHE_VERSION à chaque changement de stratégie de cache.
 */
const CACHE_VERSION = "v1";
const PRECACHE = `alw-precache-${CACHE_VERSION}`;
const RUNTIME = `alw-runtime-${CACHE_VERSION}`;
const IMAGES = `alw-images-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/apple-touch-icon.png",
];

const IMAGE_CACHE_LIMIT = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([PRECACHE, RUNTIME, IMAGES]);
  event.waitUntil(
    (async () => {
      // Accélère les navigations en préchargeant la réponse réseau.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Limite la taille d'un cache (FIFO). */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxEntries);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 1) Navigations — network-first avec repli offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) return preload;
          const network = await fetch(request);
          const cache = await caches.open(RUNTIME);
          cache.put(request, network.clone());
          return network;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL));
        }
      })(),
    );
    return;
  }

  // 2) Statique Next immuable — stale-while-revalidate.
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetching = fetch(request).then((network) => {
          cache.put(request, network.clone());
          return network;
        });
        return cached || fetching;
      }),
    );
    return;
  }

  // 3) Images — cache-first plafonné.
  if (
    request.destination === "image" ||
    url.pathname.startsWith("/_next/image")
  ) {
    event.respondWith(
      caches.open(IMAGES).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const network = await fetch(request);
          cache.put(request, network.clone());
          trimCache(IMAGES, IMAGE_CACHE_LIMIT);
          return network;
        } catch {
          return cached || Response.error();
        }
      }),
    );
  }
});

// Permet à l'app de forcer l'activation d'une nouvelle version.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
