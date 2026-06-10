'use client';

import { useEffect } from 'react';
import { refreshAccessToken } from '@/lib/axios';

export function AuthInitializer() {
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        await refreshAccessToken();
      } catch {
        // Missing or expired refresh cookies are ignored here.
      }
    };

    void tryRefresh();
  }, []);

  return null;
}
