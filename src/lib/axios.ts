import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const apiBaseURL = typeof window === 'undefined' ? `${BASE_URL}/api` : '/api';

type ApiErrorBody = {
  code?: string;
  message?: string;
};

function isAuthEndpoint(url?: string) {
  return (
    url?.includes('/auth/login') ||
    url?.includes('/auth/refresh') ||
    url?.includes('/auth/logout')
  );
}

function canRefresh(errorCode?: string) {
  return (
    errorCode === 'ACCESS_TOKEN_EXPIRED' ||
    errorCode === 'ACCESS_TOKEN_INVALID' ||
    errorCode === 'UNAUTHORIZED'
  );
}

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

export const api: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: apiBaseURL,
  timeout: 10_000,
  withCredentials: true,
});

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

export async function refreshAccessToken(): Promise<string> {
  const { data } = await refreshApi.post<{ access_token: string }>(
    '/auth/refresh',
  );

  setAccessToken(data.access_token);
  return data.access_token;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config) return Promise.reject(error);

    // This singleton keeps access token in module memory, so do not refresh on SSR.
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
