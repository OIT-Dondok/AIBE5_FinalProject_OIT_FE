import { api } from '@/lib/axios';

export const login = (email: string, password: string) =>
  api.post<{
    access_token: string;
    token_type: string;
    expires_in: number;
    member: { member_uuid: string; email: string; nickname: string };
  }>('/auth/login', { email, password });

export const logout = () => api.post('/auth/logout');

export const signup = (email: string, password: string, nickname: string) =>
  api.post<{
    member_uuid: string;
    email: string;
    nickname: string;
    status: string;
    created_at: string;
  }>('/member/signup', { email, password, nickname });
