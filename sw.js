// Indic Reader — Service Worker
// Caches the app shell and all CDN libraries on first visit so the app
// works fully offline thereafter.

// BUMP THIS VERSION whenever index.html changes. The new version invalidates
// the old cache automatically — users will receive the update on next reload
// without needing to manually clear site data.
const CACHE_NAME = 'indic-reader-v2';

const APP_SHELL = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// CDN resources that the app loads at runtime
const CDN_PATTERNS = [
  /cdn\.jsdelivr\.net\/npm\/pdfjs-dist/,
  /cdn\.jsdelivr\.net\/npm\/tesseract\.js/,
  /cdn\.jsdelivr\.net\/npm\/mammoth/,
  /cdn\.jsdelivr\.net\/npm\/dompurify/,
  /tessdata\.projectnaptha\.com/,
  /unpkg\.com\/tesseract\.js/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  // Activate the new SW immediately, replacing the old one
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      // Take control of all open tabs immediately, so the user sees the new
      // version on the next navigation without needing to close/reopen the app
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // index.html and the root path get NETWORK-FIRST so updates appear immediately.
  // Fall back to cache only if offline. This is the key fix for stale-app-version.
  const isAppPage = url.pathname.endsWith('/') ||
                    url.pathname.endsWith('/index.html');
  if (isAppPage && url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Other app-shell resources (icons, manifest) — cache-first for speed
  const isAppShell = APP_SHELL.some((p) => url.pathname.endsWith(p.replace('./', '/')));
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

  // Everything else: network with cache fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
