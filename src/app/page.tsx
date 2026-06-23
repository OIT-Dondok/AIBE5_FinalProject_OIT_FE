"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";

// 루트 진입 시 인증 상태에 따라 분기 (AuthInitializer의 init 완료 후 판단).
// - 미로그인 → /login
// - 로그인   → /crews
// 토큰은 메모리 보관이라 새로고침/PWA 재실행 시 AuthInitializer가 refresh 쿠키로 복원하며,
// 그 결과(user)가 확정된 뒤에만 분기한다.
export default function RootPage() {
  const router = useRouter();
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isInitialized) return;
    router.replace(user ? "/crews" : "/login");
  }, [isInitialized, user, router]);

  return null;
}
