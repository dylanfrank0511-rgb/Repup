const CACHE = 'repup-v19';
/* CSS is intentionally excluded — always fetched from network via ?v= param */
const ASSETS = ['./', './index.html', './repup.html', './progress.html', './vault.html', './exercises.html', './guide.html', './muscle.html', './planner.html', './overload.html', './icon.svg', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  /* Never cache CSS — always fetch from network so style updates are instant */
  if (e.request.url.includes('.css')) return;
  e.respondWith(cacheFirst(e.request));
});

function cacheFirst(request) {
  return caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(request, clone));
      return res;
    });
  });
}
