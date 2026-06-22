"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/common/Button";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = "/";
    } else {
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col pb-8 bg-background shadow-card">
        <Header title="돈독 (Dondok)" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <WifiOff size={40} strokeWidth={2} />
          </div>
          <h1 className="text-xl font-extrabold text-text-primary tracking-tight">
            네트워크 연결이 끊어졌습니다
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary">
            오프라인 상태입니다. <br />
            Wi-Fi 또는 모바일 데이터를 확인하고 <br />
            다시 시도해 주세요.
          </p>
          <div className="mt-8 w-full max-w-[200px]">
            <Button
              type="button"
              variant="primary-green"
              size="lg"
              fullWidth
              onClick={handleRetry}
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
