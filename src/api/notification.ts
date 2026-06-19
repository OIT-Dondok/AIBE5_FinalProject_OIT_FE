import { api } from '@/lib/axios';
import type { NotificationsResponse } from '@/mocks/data/notifications';

export const getNotifications = (params?: { cursor?: string; limit?: number }) =>
  api.get<NotificationsResponse>('/notifications', { params });

export const readAllNotifications = () =>
  api.patch<void>('/notifications/read-all');

export const registerDevice = (token: string) =>
  api.post<void>('/notifications/devices', { token });
