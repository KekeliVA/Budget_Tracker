const FILES_TO_CACHE = [
  "/",
  "/db.js",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

const FILE_CACHE = "static-cache-original"
const FILE_CACHE_DATA = "new-data-cache"

// install
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(FILE_CACHE).then(cache => {
      console.log("Your fiels were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
    .catch((err) => {
      console.log("not running", err);
    })
  );
  self.skipWaiting();
});

// activation 
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== FILE_CACHE && key !== FILE_CACHE_DATA) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      )
    })
  )
  self.clients.claim();
});

//  fetch
self.addEventListener("fetch", event => {
  // requests that aren't GET are cached and requests to other origins are not cached
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // handle runtime GET requests for the data from /api routes
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(FILE_CACHE_DATA).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }
})