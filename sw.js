// Bump CACHE when you ship a new version so phones pick up the update.
var CACHE = 'senior-v4';
var ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/fonts.css', 'css/app.css',
  'js/app.js', 'js/card.js', 'js/frames.js', 'js/ai.js', 'js/games.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png',
  'fonts/lalezar-arabic-400-normal.woff2', 'fonts/lalezar-latin-400-normal.woff2',
  'fonts/cairo-arabic-700-normal.woff2', 'fonts/cairo-latin-700-normal.woff2',
  'fonts/cairo-arabic-900-normal.woff2', 'fonts/cairo-latin-900-normal.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Stale-while-revalidate for our own files; the app keeps working offline.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined); });
      return hit || net;
    })
  );
});
