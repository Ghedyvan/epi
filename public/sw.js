const CACHE_NAME = "pwa-cache-v1";
const OFFLINE_URLS = ["/", "/login", "/dashboard", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS))
      .catch((error) => console.error("Falha ao pré-carregar cache", error))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        event.waitUntil(
          fetch(request)
            .then((response) =>
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, response.clone()))
            )
            .catch(() => null)
        );
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          if (request.mode === "navigate") {
            const fallback = await caches.match("/");
            return fallback || Response.error();
          }
          return Response.error();
        });
    })
  );
});
