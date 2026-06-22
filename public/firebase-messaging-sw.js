importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js');

let messaging = null;
let handlerRegistered = false;

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';

  event.waitUntil(
    (async () => {
      const targetUrl = new URL(url, self.location.origin).href;
      const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      const matchingClient = windowClients.find((client) => client.url === targetUrl);

      if (matchingClient) {
        return matchingClient.focus();
      }

      return clients.openWindow(targetUrl);
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG') {
    if (!firebase.apps.length) {
      firebase.initializeApp(event.data.config);
    }
    if (!messaging) {
      messaging = firebase.messaging();
    }
    if (!handlerRegistered) {
      handlerRegistered = true;
      messaging.onBackgroundMessage((payload) => {
        const n = payload.notification ?? {};
        const dt = payload.data ?? {};
        const title = dt.title ?? n.title ?? '돈독';
        const body = dt.body ?? n.body ?? '';
        const icon = dt.icon ?? n.icon ?? '/icon-192x192.png';
        const url = dt.url ?? '/';
        self.registration.showNotification(title, {
          body,
          icon,
          data: { url },
        });
      });
    }
  }
});
