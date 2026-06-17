import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

// JWT 인증용 Axios 인스턴스
//
// 백엔드 인증 정책
// - Access Token: 응답 body의 access_token으로 전달됨. 프론트가 메모리에 보관한다.
// - Refresh Token: refreshToken 이름의 HttpOnly Cookie로만 전달됨. JS에서 읽거나 저장하지 않는다.
// - 보호 API: Authorization: Bearer {accessToken} 헤더를 붙여 호출한다.
// - 재발급 API: POST /api/auth/refresh, request body 없음, refreshToken 쿠키 자동 전송.
// - refresh token은 rotation 되므로 refresh 성공 시 Set-Cookie로 새 쿠키가 내려온다.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const apiBaseURL = typeof window === 'undefined' ? `${BASE_URL}/api` : '/api';

type ApiErrorBody = {
  code?: string;
  message?: string;
};

// 로그인/재발급/로그아웃 요청에서 401이 발생해도 refresh 인터셉터를 태우지 않는다.
// 특히 로그인 실패(INVALID_CREDENTIALS)나 refresh 실패(REFRESH_TOKEN_INVALID)를
// 다시 refresh로 복구하려고 하면 불필요한 재시도와 redirect가 발생할 수 있다.
function isAuthEndpoint(url?: string) {
  return (
    url?.includes('/auth/login') ||
    url?.includes('/auth/refresh') ||
    url?.includes('/auth/logout')
  );
}

// 백엔드 에러 코드 기준으로 access token 문제일 때만 refresh를 시도한다.
// UNAUTHORIZED를 허용하면 새로고침으로 메모리 token이 사라진 상황도
// refreshToken 쿠키가 살아 있다면 복구할 수 있다.
function canRefresh(errorCode?: string) {
  return (
    errorCode === 'ACCESS_TOKEN_EXPIRED' ||
    errorCode === 'ACCESS_TOKEN_INVALID' ||
    errorCode === 'UNAUTHORIZED'
  );
}

// Access Token은 localStorage/sessionStorage/cookie에 저장하지 않는다.
// 이 모듈 메모리에만 보관하므로 새로고침 시 사라지고, AuthInitializer가 refresh로 복구한다.
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

// 일반 API 호출용 인스턴스
// - 브라우저: Next rewrite를 거치도록 /api 사용
// - SSR/Server: 상대 URL을 사용할 수 없으므로 백엔드 절대 URL 사용
// - withCredentials: refresh/logout처럼 쿠키가 필요한 요청에서도 refreshToken 쿠키가 포함되도록 설정
export const api: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// refresh 전용 인스턴스
// api 인스턴스로 refresh를 호출하면 response interceptor가 다시 물릴 수 있으므로 분리한다.
const refreshApi = axios.create({
  baseURL: apiBaseURL,
  timeout: 10_000,
  withCredentials: true,
});

// 요청 인터셉터
// 메모리에 access token이 있으면 모든 보호 API 요청에 Authorization 헤더를 자동 주입한다.
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

// Access Token 재발급
// - request body 없음
// - refreshToken은 HttpOnly Cookie이므로 withCredentials 설정으로 자동 전송
// - 응답 body의 access_token만 메모리에 저장
// - AuthInitializer와 401 interceptor가 같은 pending refresh promise를 공유한다.
// - 새 refresh 호출부도 이 singleton을 import해야 rotation race를 피할 수 있다.
let pendingRefresh: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (pendingRefresh) return pendingRefresh;

  pendingRefresh = refreshApi
    .post<{ access_token: string }>('/auth/refresh')
    .then(({ data }) => {
      setAccessToken(data.access_token);
      return data.access_token;
    })
    .finally(() => {
      pendingRefresh = null;
    });

  return pendingRefresh;
}

// 응답 인터셉터
// 401 응답 중 access token 문제로 판단되는 경우에만 refresh 후 원래 요청을 재시도한다.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config) return Promise.reject(error);

    // SSR에서 module-level token 상태를 사용하면 사용자 요청 간 공유 위험이 있다.
    // 이 인스턴스의 자동 refresh 로직은 브라우저 client 전용으로만 동작시킨다.
    if (typeof window === 'undefined') return Promise.reject(error);

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const errorCode = (error.response?.data as ApiErrorBody | undefined)?.code;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url) ||
      !canRefresh(errorCode)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      // refresh 성공 시 새 access token으로 원래 요청을 재시도한다.
      const accessToken = await refreshAccessToken();
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      // refreshToken이 없거나 만료/위조/rotation 이후 재사용이면 복구 불가.
      // access token과 함께 store의 Auth 정보도 모두 비우고 로그인 화면으로 보낸다.
      try {
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().clearAuth();
      } catch {
        clearAccessToken();
      }
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  },
);

export default api;
