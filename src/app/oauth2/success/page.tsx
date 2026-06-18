"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getOAuthLoginErrorHref } from "@/lib/oauth";
import { exchangeOAuthToken } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const hasExchanged = useRef(false);

  useEffect(() => {
    if (hasExchanged.current) return;
    hasExchanged.current = true;

    const code = searchParams.get("code");

    if (!code) {
      clearAuth();
      router.replace(getOAuthLoginErrorHref(null));
      return;
    }

    const exchangeToken = async () => {
      try {
        const res = await exchangeOAuthToken(code);
        setAuth(res.data.member, res.data.access_token);
        window.history.replaceState(null, "", "/oauth2/success");
        router.replace("/crews");
      } catch {
        clearAuth();
        window.history.replaceState(null, "", "/oauth2/success");
        router.replace(getOAuthLoginErrorHref(null));
      }
    };

    void exchangeToken();
  }, [clearAuth, router, searchParams, setAuth]);

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center px-5 text-center">
      <Loader2 className="h-9 w-9 animate-spin text-primary-green" />
      <p className="mt-4 text-base font-bold text-text-primary">Google 로그인 정보를 확인하고 있어요.</p>
      <p className="mt-2 text-sm text-text-secondary">잠시만 기다려주세요.</p>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-1 flex-col items-center justify-center px-5 text-center">
          <Loader2 className="h-9 w-9 animate-spin text-primary-green" />
        </div>
      }
    >
      <OAuthSuccessContent />
    </Suspense>
  );
}
