// Service Worker Oficial de la PWA — Sistema de Gestión Comercial & POS
const CACHE_NAME = "pos-cache-v1";
const STATIC_ASSETS = [
  "/",
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
  const url = new URL(event.request.url);

  // A. Peticiones de API: SIEMPRE directas a red (Network First) para asegurar datos frescos
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: "Sin conexión a internet. Verifique su red." }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // B. Archivos estáticos y navegación: Network First con fallback a caché
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        // Clonar respuesta y guardar en caché
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si es navegación y no hay red, servir la raíz en caché
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
  );
});
