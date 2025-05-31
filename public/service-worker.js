
// Nombre del cache
const CACHE_NAME = 'taskhub1-cache-v1';

// Archivos a cachear
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-144x144.png',
];

// Instalación del service worker
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => {
//         return cache.addAll(urlsToCache);
//       })
//   );
// });

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activa el nuevo Service Worker inmediatamente
});

// Estrategia de cache: Network falling back to cache
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     fetch(event.request)
//       .catch(() => {
//         return caches.match(event.request);
//       })
//   );
// });



// Activar el nuevo service worker
// self.addEventListener('activate', event => {
//   const cacheWhitelist = [CACHE_NAME];
//   event.waitUntil(
//     caches.keys().then(cacheNames => {
//       return Promise.all(
//         cacheNames.map(cacheName => {
//           if (cacheWhitelist.indexOf(cacheName) === -1) {
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Elimina cachés obsoletos
          }
        })
      );
    })
  );
});

// Estrategia de caché
// self.addEventListener('fetch', (event) => {
//   if (event.request.url.includes('/auth')) {
//     // No almacenar en caché las solicitudes de autenticación
//     return fetch(event.request);
//   }

//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });

// self.addEventListener('fetch', (event) => {
//   const url = new URL(event.request.url);

//   if (event.request.headers.get('purpose') === 'prefetch') {
//     return;
//   }

//   // Excluir solicitudes relacionadas con autenticación o datos dinámicos
//   if (
//     url.pathname.startsWith('/') || // Rutas de autenticación
//     url.pathname.startsWith('/dashboard') || 
//     url.pathname.startsWith('/register') ||
//     url.pathname.startsWith('/login') || // Rutas de autenticación
//     url.pathname.startsWith('/tasks') || // Rutas de tareas
//     url.pathname.startsWith('/subjects') || 
//     url.pathname.startsWith('/professors') ||
//     url.pathname.startsWith('/profile') || // Rutas de perfil
//     url.origin.includes('supabase.co') 
//   ) {
//     // Realizar la solicitud directamente a la red
//     return (fetch(event.request));
    
//   }

//   // Estrategia de caché para otros recursos
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar las solicitudes de prefetch
  if (event.request.headers.get('purpose') === 'prefetch') {
    return;
  }

  // Para solicitudes a Supabase o endpoints dinámicos, siempre ir a la red
  if (url.origin.includes('supabase.co') || url.pathname.includes('/rest/')) {
    event.respondWith(
      fetch(event.request).catch(error => {
        console.error('Error fetching from network:', error);
        return new Response(JSON.stringify({ error: 'Network error' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  
  // Excluir solicitudes relacionadas con autenticación o datos dinámicos
  if (
    url.pathname.startsWith('/') || 
    url.pathname.startsWith('/dashboard') || 
    url.pathname.startsWith('/register') ||
    url.pathname.startsWith('/login') || 
    url.pathname.startsWith('/tasks') || 
    url.pathname.startsWith('/subjects') || 
    url.pathname.startsWith('/professors') ||
    url.pathname.startsWith('/profile')
  ) {
    // Estrategia network-first para estas rutas
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Estrategia cache-first para recursos estáticos
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});



// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     fetch(event.request).catch(() => caches.match(event.request))
//   );
// });

self.addEventListener('push', (event) => {
  console.log('Notificación push recibida', event);
  
  let notificationData = {};
  try {
    notificationData = event.data ? event.data.json() : {};
  } catch (e) {
    notificationData = { title: 'Notificación', body: 'Nueva notificación' };
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'Notificación', {
      body: notificationData.body || 'Tienes una notificación',
      icon: '/icon-192x192.png'
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Cierra la notificación al hacer clic
  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window'}).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus(); // Si ya hay una ventana abierta con la URL, la enfoca
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen); // Si no, abre una nueva ventana
        }
      })
    );
  }
);