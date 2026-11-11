/* Pokédex Pros — offline cache. Bump VERSION whenever you change any file so phones pick up the update. */
const VERSION = "pokedex-pros-v1";
const FILES = ["./", "index.html", "style.css", "data.js", "questions.js", "app.js", "manifest.webmanifest",
  "icon-192.png", "icon-512.png", "maskable-512.png", "apple-touch-icon.png", "favicon-32.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Serve from the cache straight away, and refresh the cached copy in the background.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then((cache) => cache.match(e.request).then((hit) => {
    const fresh = fetch(e.request).then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || fresh;
  })));
});
