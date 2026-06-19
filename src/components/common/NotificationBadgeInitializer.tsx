'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { getNotifications } from '@/api/notification';

export function NotificationBadgeInitializer() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (!isInitialized || !user) return;

    void getNotifications({ limit: 50 })
      .then(({ data }) => {
        const count = data.items.filter((item) => item.read_at === null).length;
        if (process.env.NODE_ENV === 'development') {
          console.log('[NotificationBadge] unread_count:', count);
        }
        setUnreadCount(count);
      })
      .catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[NotificationBadge] fetch failed:', err);
        }
      });
  }, [isInitialized, user, setUnreadCount]);

  return null;
}
