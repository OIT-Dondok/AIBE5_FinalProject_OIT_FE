import { api } from '@/lib/axios';
import type { LoginResponse, SignupResponse } from '@/types/domain';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

export const login = (email: string, password: string) =>
  api.post<LoginResponse>('/auth/login', { email, password });

export const getGoogleOAuthUrl = () =>
  `${BACKEND_URL}/oauth2/authorization/google`;

export const exchangeOAuthToken = (code: string) =>
  api.post<LoginResponse>(
    '/auth/oauth2/token',
    { code },
    { withCredentials: true },
  );

export const logout = () => api.post<void>('/auth/logout');

export const signup = (email: string, password: string, nickname: string) =>
  api.post<SignupResponse>('/member/signup', { email, password, nickname });
