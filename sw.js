// Indic Reader — Service Worker

// BUMP THIS VERSION whenever index.html changes. The new version invalidates
// the old cache automatically — users will receive the update on next reload
// without needing to manually clear site data.
const CACHE_NAME = 'indic-reader-v51';

const APP_SHELL = [
  './',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// CDN resources that the app loads at runtime (cache-first for offline use)
const CDN_PATTERNS = [
  /cdn\.jsdelivr\.net\/npm\/pdfjs-dist/,
  /cdn\.jsdelivr\.net\/npm\/tesseract\.js/,
  /cdn\.jsdelivr\.net\/npm\/mammoth/,
  /cdn\.jsdelivr\.net\/npm\/dompurify/,
  /tessdata\.projectnaptha\.com/,
  /unpkg\.com\/tesseract\.js/,
];

// Domains the SW should NEVER intercept. These are third-party APIs that need
// the browser's native fetching semantics (CORS, cookies, OAuth popups, etc.).
// Routing them through the SW can subtly break script loading.
const PASSTHROUGH_PATTERNS = [
  /^https:\/\/apis\.google\.com/,
  /^https:\/\/accounts\.google\.com/,
  /^https:\/\/www\.gstatic\.com/,
  /^https:\/\/.*\.googleapis\.com/,
  /^https:\/\/.*\.googleusercontent\.com/,
  /^https:\/\/docs\.google\.com/,
  /^https:\/\/drive\.google\.com/,
  /^https:\/\/translate\.googleapis\.com/,
  /^https:\/\/api\.c-salt\.uni-koeln\.de/,
  /^https:\/\/vision\.googleapis\.com/,
  /^https:\/\/.*\.cognitiveservices\.azure\.com/,
  /^https:\/\/api\.ocr\.space/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // PASSTHROUGH: don't touch Google API / OAuth / Drive requests.
  // Letting the browser handle them natively avoids subtle CORS/credential issues.
  if (PASSTHROUGH_PATTERNS.some((re) => re.test(req.url))) {
    return; // not calling event.respondWith → browser handles it directly
  }

  // App page (index.html / root) — network-first so updates appear immediately.
  const isAppPage = (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) &&
                    url.origin === self.location.origin;
  if (isAppPage) {
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

  // Static app-shell + known CDN libraries — cache-first for speed and offline use
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

  // Everything else: just don't intercept. Let the browser handle it.
});
