'use client';

import { useEffect } from 'react';
import { refreshAccessToken } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export function AuthInitializer() {
  const { setInitialized, clearAuth } = useAuthStore();

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        await refreshAccessToken();
      } catch {
        // Missing or expired refresh cookies should fail silently on app boot.
        clearAuth();
      } finally {
        setInitialized(true);
      }
    };

    void tryRefresh();
  }, [setInitialized, clearAuth]);

  return null;
}
