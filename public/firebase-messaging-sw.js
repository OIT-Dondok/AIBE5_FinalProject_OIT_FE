// Firebase SDK 없이 raw push 이벤트 직접 처리.
// notification+data 페이로드에서 onBackgroundMessage는 호출되지 않으므로(Chrome 정책)
// Firebase 메시징 레이어를 우회해 모든 케이스를 일관되게 처리한다.
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

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  // data-only:           payload.data.{title,body,icon}
  // notification+data:   payload.data 우선, 없으면 payload.notification 폴백
  const n = payload.notification ?? {};
  const dt = payload.data ?? {};
  const title = dt.title ?? n.title ?? '돈독';
  const body = dt.body ?? n.body ?? '';
  const icon = dt.icon ?? n.icon ?? '/icon-192x192.png';
  const url = dt.url ?? '/';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      data: { url },
    }),
  );
});
