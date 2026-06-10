// src/lib/axios.ts
// JWT Access Token 자동 갱신 인터셉터
//
// [백엔드 인증 정책]
//   - Access Token: 메모리에만 저장하고 Authorization: Bearer {accessToken} 헤더로 전송
//   - Refresh Token: HttpOnly Cookie로만 관리하며 JS에서 직접 접근/저장 금지
//   - 재발급: POST /api/auth/refresh, body 없음, refreshToken 쿠키 자동 전송
//   - 재발급 응답: { access_token } 만 반환, refreshToken은 Set-Cookie로 rotation

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const API_BASE_URL = typeof window === 'undefined' ? `${BASE_URL}/api` : '/api';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout'];
const REFRESHABLE_ERROR_CODES = [
  'ACCESS_TOKEN_EXPIRED',
  'ACCESS_TOKEN_INVALID',
  'UNAUTHORIZED',
] as const;

type ApiErrorBody = {
  code?: string;
  message?: string;
};

let _accessToken: string | null = null;

// ─── Access Token 관리 ────────────────────────────────────────────────────────
// Refresh Token은 HttpOnly 쿠키로만 관리하므로 프론트에서 저장하지 않는다.
// Access Token은 localStorage/sessionStorage/Zustand에 저장하지 않고 메모리에만 둔다.

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string): void {
  _accessToken = token;
}

export function clearAccessToken(): void {
  _accessToken = null;
}

function isAuthEndpoint(url?: string): boolean {
  return AUTH_ENDPOINTS.some((endpoint) => url?.includes(endpoint));
}

function canRefreshAccessToken(errorCode?: string): boolean {
  return REFRESHABLE_ERROR_CODES.some((code) => code === errorCode);
}

// ─── Axios 인스턴스 ───────────────────────────────────────────────────────────
// 서버사이드(Server Component, SSR): 상대 경로 대신 백엔드 절대 URL 사용
// 브라우저: Next.js rewrite 프록시(/api)를 경유

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// refresh 요청은 응답 인터셉터가 다시 물리지 않도록 별도 인스턴스를 사용한다.
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});

// ─── Access Token 재발급 ──────────────────────────────────────────────────────
// body 없이 호출하며, refreshToken 쿠키는 withCredentials로 자동 전송된다.

export async function refreshAccessToken(): Promise<string> {
  const { data } = await refreshApi.post<{ access_token: string }>(
    '/auth/refresh',
  );

  setAccessToken(data.access_token);
  return data.access_token;
}

// ─── 요청 인터셉터: Access Token 자동 주입 ───────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = _accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── 응답 인터셉터: Access Token 만료 시 재발급 후 원 요청 재시도 ─────────────
// 모든 401에서 refresh를 시도하지 않는다.
// auth endpoint(login/refresh/logout)는 제외하고, 백엔드 error code가 access-token 계열일 때만 재발급한다.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config) return Promise.reject(error);

    // SSR 환경에서는 module-level 토큰 상태가 요청 간 공유될 수 있으므로 재발급 로직을 사용하지 않는다.
    if (typeof window === 'undefined') return Promise.reject(error);

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const errorCode = (error.response?.data as ApiErrorBody | undefined)?.code;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url) ||
      !canRefreshAccessToken(errorCode)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const accessToken = await refreshAccessToken();
      isRefreshing = false;
      processQueue(null, accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, null);
      clearAccessToken();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  },
);

export default api;
