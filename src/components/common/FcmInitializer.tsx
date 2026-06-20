'use client';

import { useAuthStore } from '@/store/authStore';
import { useFcmToken } from '@/hooks/useFcmToken';

export function FcmInitializer() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useFcmToken(isInitialized && !!user);

  return null;
}
