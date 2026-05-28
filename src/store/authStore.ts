// src/store/authStore.ts
// 로그인 유저 정보 + Access Token 전역 상태
// 문창현 담당 (JWT 인터셉터 최종 완성)
// 김한비 초안
//
// [명세 근거] auth.md
//   - Refresh Token은 HttpOnly 쿠키로만 관리 → JS 접근 불가 → store에 저장 안 함
//   - Access Token만 메모리(store)에서 관리 — localStorage에 저장하지 않음

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { configureTokenManager } from '@/lib/axios';
import type { Member } from '@/types/domain';

interface AuthState {
  user: Member | null;
  accessToken: string | null;

  setAuth: (user: Member, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setUser: (user: Member) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => {
        set({ user, accessToken });
        configureTokenManager({
          getAccessToken: () => get().accessToken,
          setAccessToken: (token) => set({ accessToken: token }),
          clearAccessToken: () => set({ accessToken: null, user: null }),
        });
      },

      setAccessToken: (token) => set({ accessToken: token }),

      clearAuth: () => set({ user: null, accessToken: null }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'dondok-auth',
      // accessToken은 메모리에서만 관리 — localStorage에 저장 시 XSS로 탈취 가능
      // 페이지 리로드 후 accessToken은 null → 첫 API 요청에서 401 → refresh 인터셉터가 쿠키로 재발급
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // persist 복원 후 token manager 재연결 (세션 유지)
        configureTokenManager({
          getAccessToken: () => useAuthStore.getState().accessToken,
          setAccessToken: (token) => useAuthStore.setState({ accessToken: token }),
          clearAccessToken: () => useAuthStore.setState({ accessToken: null, user: null }),
        });
      },
    },
  ),
);
