// 서비스 워커: 한 번 본 그림·코드는 휴대폰에 저장해 두고(다시 열 때 빠르게, 인터넷이 약해도 열리게),
// 새 버전을 올리면 VERSION이 바뀌어 옛 저장본을 지운다. VERSION은 빌드 때 자동으로 바뀐다.
const VERSION = '20261001092246';
const CACHE = `dys-${VERSION}`;
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('dys-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // 화면(html)은 새것 먼저(업데이트 바로 보이게), 그림은 저장본 먼저(빠르게)
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); }
    return r;
  })));
});
