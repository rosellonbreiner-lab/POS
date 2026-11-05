// Service Worker Oficial de la PWA — Sistema de Gestión Comercial & POS
const CACHE_NAME = "pos-cache-v2";
const STATIC_ASSETS = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
  "/apple-touch-icon.png",
];

// 1. Instalación del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Advertencia al precachear recursos:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activación y limpieza de cachés antiguos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Estrategia de Fetch
self.addEventListener("fetch", (event) => {
  // Solo procesar peticiones GET
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // A. Peticiones de API: siempre directas a la red (sin caché)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // B. Archivos estáticos y navegación: Network First con fallback a caché
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        // Cachear recursos estáticos del mismo origen
        if (url.origin === self.location.origin) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          const fallback = await caches.match("/");
          if (fallback) return fallback;
        }
        return new Response("Sin conexión a la red", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
  );
});
