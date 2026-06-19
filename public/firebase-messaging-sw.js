importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

let messaging = null;
let handlerRegistered = false;

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
        const { title, body, icon } = payload.notification ?? {};
        self.registration.showNotification(title ?? '돈독', {
          body: body ?? '',
          icon: icon ?? '/icon-192x192.png',
        });
      });
    }
  }
});
