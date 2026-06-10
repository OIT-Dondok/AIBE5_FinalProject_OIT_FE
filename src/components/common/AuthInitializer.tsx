'use client';

import { useEffect } from 'react';
import { refreshAccessToken } from '@/lib/axios';

export function AuthInitializer() {
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        await refreshAccessToken();
      } catch {
        // Missing or expired refresh cookies should fail silently on app boot.
      }
    };

    void tryRefresh();
  }, []);

  return null;
}
