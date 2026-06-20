'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { getUnreadCount } from '@/api/notification';

export function NotificationBadgeInitializer() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (!isInitialized || !user) return;

    void getUnreadCount()
      .then(({ data }) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[NotificationBadge] unread_count:', data.unread_count, '| path:', pathname);
        }
        setUnreadCount(data.unread_count);
      })
      .catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[NotificationBadge] fetch failed:', err);
        }
      });
  }, [isInitialized, user, setUnreadCount, pathname]);

  return null;
}
