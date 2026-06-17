"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. 이미 앱으로 접속된 상태(standalone)이면 설치 프롬프트를 띄우지 않습니다.
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. iOS 디바이스 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Android / Chrome 'beforeinstallprompt' 이벤트 리스너 등록
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS 기기이면서 독립형 앱이 아니면 우선 배너 노출 테스트 (세션 단위나 로컬스토리지로 닫기 기록 관리 가능)
    const isDismissed = localStorage.getItem("pwa-install-prompt-dismissed");
    if (isIOSDevice && !isDismissed) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 px-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-[#E7E1D3] bg-card p-4 shadow-xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full p-1 text-text-secondary/70 hover:bg-neutral-100 transition"
          aria-label="닫기"
        >
          <X size={16} />
        </button>

        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5E9B73]/10 text-[#5E9B73]">
            <Download size={22} strokeWidth={2.3} />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-[13px] font-extrabold text-text-primary tracking-tight">
              돈독(Dondok) 앱 설치하기
            </h3>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-text-secondary">
              {isIOS ? (
                <span className="flex flex-wrap items-center gap-1">
                  아래 공유 버튼 <Share size={12} className="text-primary-blue inline" /> 을 누르고
                  <strong className="text-text-primary">"홈 화면에 추가"</strong>를 탭하세요.
                </span>
              ) : (
                "앱으로 설치하여 오프라인에서도 습관을 인증해보세요!"
              )}
            </p>
          </div>
        </div>

        {!isIOS && deferredPrompt && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-neutral-100 transition"
            >
              나중에
            </button>
            <button
              type="button"
              onClick={handleInstallClick}
              className="rounded-lg bg-[#5E9B73] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#4d825f] transition active:scale-95"
            >
              설치하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
