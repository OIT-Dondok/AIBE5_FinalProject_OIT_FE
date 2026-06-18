import { api } from '@/lib/axios';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

type AuthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  member: { member_uuid: string; email: string; nickname: string };
};

export const login = (email: string, password: string) =>
  api.post<AuthTokenResponse>('/auth/login', { email, password });

export const getGoogleOAuthUrl = () =>
  `${BACKEND_URL}/oauth2/authorization/google`;

export const exchangeOAuthToken = (code: string) =>
  api.post<AuthTokenResponse>(
    '/auth/oauth2/token',
    { code },
    { withCredentials: true },
  );

export const logout = () => api.post<void>('/auth/logout');

export const signup = (email: string, password: string, nickname: string) =>
  api.post<{
    member_uuid: string;
    email: string;
    nickname: string;
    status: string;
    created_at: string;
  }>('/member/signup', { email, password, nickname });
