// Rhythm Along — service worker
// Permet à l'appli de fonctionner hors ligne.
// À chaque grosse mise à jour, augmente le numéro de version ci-dessous (v1 → v2…).
const CACHE = 'rhythm-along-v1';

const FICHIERS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

// Installation : on met les fichiers de l'appli en mémoire
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FICHIERS))
  );
  self.skipWaiting();
});

// Activation : on supprime les anciennes versions en mémoire
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Chargement :
// - la page elle-même : d'abord internet (pour avoir la dernière version),
//   sinon la copie en mémoire (hors ligne)
// - le reste (icônes…) : d'abord la mémoire, sinon internet
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copie));
          return rep;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((enCache) => enCache || fetch(req))
  );
});
