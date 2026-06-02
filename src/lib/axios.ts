// src/lib/api/instance.ts
// JWT Access Token 자동 갱신 인터셉터
// 문창현 담당 (JWT 인터셉터 최종 완성)
// 김한비 초안
//
// [명세 근거] overview.md §인증
//   - Access Token: Authorization: Bearer {accessToken} 헤더
//   - Refresh Token: HttpOnly 쿠키로만 전달 (request body X)
//   - 재발급: POST /api/auth/refresh → body 없음, 쿠키 자동 전송
//   - 재발급 응답: { access_token } 만 반환 (refresh token은 Set-Cookie로만)

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const REFRESH_ENDPOINT = '/api/auth/refresh';

// ─── Access Token 관리 ────────────────────────────────────────────────────────
// Refresh Token은 HttpOnly 쿠키로 관리 → JS에서 접근 불가, 서버가 쿠키로 읽음
// Access Token은 이 모듈의 클로저에서 관리 — Zustand 외부, localStorage 저장 안 함

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}
export function setAccessToken(token: string): void {
  _accessToken = token;
}
export function clearAccessToken(): void {
  _accessToken = null;
}

// ─── Axios 인스턴스 ───────────────────────────────────────────────────────────

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  // [명세 근거] Refresh Token 쿠키 자동 전송을 위해 credentials 포함
  withCredentials: true,
});

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

// ─── 응답 인터셉터: 401 → 토큰 갱신 재시도 ──────────────────────────────────
// [명세 근거] overview.md §Access Token 재발급
//   - POST /api/auth/refresh: body 없음, refreshToken 쿠키 자동 전송
//   - 응답: { access_token: string } 만 반환
//   - refresh token rotate 시 Set-Cookie로 자동 갱신 (JS 접근 불가)
//   - 실패 시 클라이언트가 로그인 화면으로 유도

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

    // SSR 환경에서는 module-level 상태가 모든 유저 요청에 공유됨 → 큐 패턴 사용 금지
    if (typeof window === 'undefined') return Promise.reject(error);

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
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
      // body 없음 - refreshToken 쿠키가 withCredentials로 자동 전송됨
      const { data } = await axios.post<{ access_token: string }>(
        `${BASE_URL}${REFRESH_ENDPOINT}`,
        undefined,
        { withCredentials: true, timeout: 10_000 },
      );

      const { access_token } = data;
      isRefreshing = false;
      setAccessToken(access_token);
      processQueue(null, access_token);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, null);
      clearAccessToken();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  },
);

export default api;
