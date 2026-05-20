// Indic Reader — Service Worker
// Caches the app shell and all CDN libraries on first visit so the app
// works fully offline thereafter.

const CACHE_NAME = 'indic-reader-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// CDN resources that the app loads at runtime
const CDN_PATTERNS = [
  /cdn\.jsdelivr\.net\/npm\/pdfjs-dist/,
  /cdn\.jsdelivr\.net\/npm\/tesseract\.js/,
  /cdn\.jsdelivr\.net\/npm\/mammoth/,
  /tessdata\.projectnaptha\.com/,        // Tesseract language data
  /unpkg\.com\/tesseract\.js/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for app shell + matching CDN; network-first for everything else
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isAppShell = APP_SHELL.some((p) => url.pathname.endsWith(p.replace('./', '/')) || url.pathname.endsWith('/'));
  const isCDN = CDN_PATTERNS.some((re) => re.test(req.url));

  if (isAppShell || isCDN) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // For other requests (e.g., Google Translate API), try network and let it fail naturally offline
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
