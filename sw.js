const CACHE_NAME = 'schedule-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// インストール時にファイルをキャッシュ（保存）
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// リクエスト時にキャッシュから応答
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});