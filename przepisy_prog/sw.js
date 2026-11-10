const CACHE = "pg-v9";
const FILES = ["./", "przewodnik-gotowania.html", "instrukcja.html", "manifest.webmanifest", "icon.svg",
  "pg/style.css", "pg/logic.js", "pg/recipes.js", "pg/recipes-plan.js", "pg/recipes-garden.js", "pg/guide.js", "pg/bioactive.js", "pg/ui-core.js", "pg/ui-recipes.js", "pg/ui-manage.js", "pg/ui-backup.js", "pg/ui-planning.js", "pg/ui-guide.js", "pg/ui-nutri.js", "pg/main.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Tylko zasoby tej aplikacji: sieć najpierw (aktualne pliki), pamięć podręczna jako zapas offline.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("przewodnik-gotowania.html"))));
});
