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

// 