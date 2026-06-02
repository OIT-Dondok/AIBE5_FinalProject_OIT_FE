// src/store/authStore.ts
// 로그인 유저 정보 전역 상태
// 문창현 담당 (JWT 인터셉터 최종 완성)
// 김한비 초안
//
// [명세 근거] auth.md
//   - Refresh Token은 HttpOnly 쿠키로만 관리 → JS 접근 불가 → store에 저장 안 함
//   - Access Token은 src/lib/axios.ts 모듈 클로저에서 관리 — store·localStorage 저장 안 함

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccessToken, clearAccessToken } from '@/lib/axios';
import type { Member } from '@/types/domain';

interface AuthState {
  user: Member | null;

  setAuth: (user: Member, accessToken: string) => void;
  clearAuth: () => void;
  setUser: (user: Member) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setAuth: (user, accessToken) => {
        set({ user });
        setAccessToken(accessToken);
      },

      clearAuth: () => {
        set({ user: null });
        clearAccessToken();
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'dondok-auth',
      // 전체 Member shape 저장 — 리하이드레이션 후 UI가 완전한 프로필 표시 가능
      // accessToken은 저장하지 않음 — 리로드 후 첫 401에서 refresh 인터셉터가 재발급
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
