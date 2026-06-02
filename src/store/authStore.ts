// src/store/authStore.ts
// 로그인 유저 정보 전역 상태
// 문창현 담당 (JWT 인터셉터 최종 완성)
// 김한비 초안
//
// [명세 근거] auth.md
//   - Refresh Token은 HttpOnly 쿠키로만 관리 → JS 접근 불가 → store에 저장 안 함
//   - Access Token은 src/lib/axios.ts 모듈 클로저에서 관리 — store·localStorage 저장 안 함

import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {setAccessToken, clearAccessToken} from '@/lib/axios';
import type {Member} from '@/types/domain';

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
                set({user});
                setAccessToken(accessToken);
            },

            clearAuth: () => {
                set({user: null});
                clearAccessToken();
            },

            setUser: (user) => set({user}),
        }),
        {
            name: 'dondok-auth',
        // member_uuid, nickname만 저장 — email 등 개인정보 localStorage 노출 방지
        // 전체 프로필 필요 시 /api/me 재조회
            partialize: (state) => ({
                user: state.user ? {
                    member_uuid: state.user.member_uuid,
                    nickname: state.user.nickname,
                } : null,
            }),
        },
    ),
);
