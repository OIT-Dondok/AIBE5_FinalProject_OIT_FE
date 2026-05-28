// src/store/authStore.ts
// 로그인 유저 정보 + Access Token 전역 상태
// 문창현 담당 (JWT 인터셉터 최종 완성)
// 김한비 초안
//
// [명세 근거] auth.md
//   - Refresh Token은 HttpOnly 쿠키로만 관리 → JS 접근 불가 → store에 저장 안 함
//   - Access Token만 메모리(store)에서 관리

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { configureTokenManager } from '@/lib/api/instance';
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
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        // refreshToken은 쿠키로만 관리 → 여기 저장 안 함
      }),
    },
  ),
);
