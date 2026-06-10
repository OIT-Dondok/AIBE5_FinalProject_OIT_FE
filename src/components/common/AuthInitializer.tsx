'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { setAccessToken } from '@/lib/axios';

export function AuthInitializer() {
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const { data } = await axios.post<{ access_token: string }>(
          '/api/auth/refresh',
          undefined,
          { withCredentials: true, timeout: 10_000 },
        );
        setAccessToken(data.access_token);
      } catch {
        // refreshToken 쿠키 없거나 만료된 경우 조용히 실패
        // 로그인 강제 이동 없음 — 이후 인증 필요 API 호출 시 인터셉터가 처리
      }
    };
    void tryRefresh();
  }, []);

  return null;
}
