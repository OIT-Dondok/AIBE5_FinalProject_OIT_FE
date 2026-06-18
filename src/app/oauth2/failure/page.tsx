"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { getOAuthFailureMessage, getOAuthLoginErrorHref } from "@/lib/oauth";
import { useAuthStore } from "@/store/authStore";

function OAuthFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const reason = searchParams.get("reason");
  const message = getOAuthFailureMessage(reason);
  const loginHref = getOAuthLoginErrorHref(reason);

  useEffect(() => {
    clearAuth();

    const timer = window.setTimeout(() => {
      router.replace(loginHref);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [clearAuth, loginHref, router]);

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertCircle size={30} strokeWidth={2.4} />
      </div>
      <h1 className="mt-5 text-xl font-black text-text-primary">Google 로그인 실패</h1>
      <p className="mt-2 max-w-[320px] text-sm leading-6 text-text-secondary">{message}</p>
      <Link href={loginHref} className="mt-7 w-full max-w-[320px]">
        <Button type="button" variant="primary-green" size="lg" fullWidth>
          로그인으로 돌아가기
        </Button>
      </Link>
    </div>
  );
}

export default function OAuthFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-1 items-center justify-center px-5 text-center">
          <p className="text-sm text-text-secondary">로그인 상태를 확인하고 있어요.</p>
        </div>
      }
    >
      <OAuthFailureContent />
    </Suspense>
  );
}
