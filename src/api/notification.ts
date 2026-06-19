import { api } from '@/lib/axios';
import type { NotificationsResponse } from '@/types/domain';

export const getNotifications = (params?: { cursor?: string; limit?: number }) =>
  api.get<NotificationsResponse>('/notifications', { params });

export const getUnreadCount = () =>
  api.get<{ unread_count: number }>('/notifications/unread-count');

export const readAllNotifications = () =>
  api.patch<void>('/notifications/read-all');

export const registerDevice = (token: string, deviceId: string) =>
  api.post<void>('/notifications/devices', {
    platform: 'WEB',
    fcm_token: token,
    device_id: deviceId,
  });

export const readNotification = (notificationId: string) =>
  api.patch<void>(`/notifications/${notificationId}/read`);
