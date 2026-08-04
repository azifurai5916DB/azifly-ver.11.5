// Service Worker - あじfly オフラインキャッシュ対応
const CACHE_NAME = 'azifly-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './main.js',
  './save.js',
  './state.js',
  './ui.js',
  './audio.js',
  './input.js',
  './level.js',
  './shop.js',
  './achievements.js',
  './challenge.js',
  './modes.js',
  './physics.js',
  './render.js',
  './gamestate.js',
  './version.js',
  './style.css',
  './manifest.json',
  './storage.js',
  './datatransfer.js'
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを開いています:', CACHE_NAME);
        return cache.addAll(URLS_TO_CACHE.filter(url => url.includes('.js') || url.includes('.css') || url === './' || url === './index.html'))
          .catch(err => {
            console.log('キャッシュ追加時にエラーが発生しました。一部ファイルがスキップされました:', err);
            return Promise.resolve();
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Service Worker アクティベート
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除しています:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチ イベント - キャッシュフースト戦略
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
      .catch(() => {
        return new Response('オフライン状態です。インターネット接続を確認してください。', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});
