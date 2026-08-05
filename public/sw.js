/*
 * AfroLove World — Service Worker (compatible Turbopack, sans dépendance).
 *
 * Stratégies :
 *  - Précache de l'app shell minimal (accueil + repli offline + icônes).
 *  - Navigations (documents)   : network-first (avec TIMEOUT) → cache → /offline.
 *  - Statique Next (_next/…)   : stale-while-revalidate (immuable, hashé).
 *  - Images                    : cache-first (plafonné).
 * Nettoyage automatique des anciens caches à l'activation.
 *
 * ⚠️ Incrémentez CACHE_VERSION à chaque changement de stratégie de cache.
 */
const CACHE_VERSION = "v3";
const PRECACHE = `alw-precache-${CACHE_VERSION}`;
const RUNTIME = `alw-runtime-${CACHE_VERSION}`;
const IMAGES = `alw-images-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

/*
 * Délai au-delà duquel une navigation réseau est considérée perdue. Essentiel
 * sur connexion très lente : sans lui, `fetch()` reste suspendu (ne rejette
 * jamais), le repli hors-ligne ne s'active pas, et le navigateur finit par
 * afficher SON écran d'erreur. Avec le timeout, on sert /offline à la place.
 */
const NAV_TIMEOUT_MS = 8000;

/** Rejette après `ms` — pour départager une réponse réseau trop lente. */
function rejectAfter(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("network-timeout")), ms);
  });
}

/** `fetch` borné dans le temps (annule la requête via AbortController). */
async function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

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
  // Cache tolérant : un échec sur une URL (connexion instable) ne doit pas
  // empêcher l'installation du SW — sinon aucun repli hors-ligne ne sera
  // jamais disponible. On met en cache ce qu'on peut, puis on active.
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
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

  // 1) Navigations — network-first BORNÉ, repli cache puis /offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Réponse préchargée (navigationPreload) si elle arrive à temps,
          // sinon fetch borné : dans tous les cas on abandonne le réseau au
          // bout de NAV_TIMEOUT_MS plutôt que de rester suspendu.
          const preload = await Promise.race([
            event.preloadResponse,
            rejectAfter(NAV_TIMEOUT_MS),
          ]);
          const network =
            preload || (await fetchWithTimeout(request, NAV_TIMEOUT_MS));
          const cache = await caches.open(RUNTIME);
          cache.put(request, network.clone());
          return network;
        } catch {
          const cached = await caches.match(request);
          return (
            cached ||
            (await caches.match(OFFLINE_URL)) ||
            new Response("Hors ligne", {
              status: 504,
              statusText: "Hors ligne",
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
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
