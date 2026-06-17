"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { Toast } from "@/components/common/Toast";

export function InstallPrompt() {
  const { isInstallable, isIOS, install } = usePwaInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("pwa-install-prompt-dismissed");
    if (isInstallable && !isDismissed) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [isInstallable]);

  const handleInstallClick = async () => {
    const result = await install();
    if (result.outcome === "accepted") {
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-prompt-dismissed", "true");
    setIsToastOpen(true);
  };

  return (
    <>
      {showPrompt && (
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

            {!isIOS && (
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
      )}

      <Toast
        message="설정(우측 상단 톱니바퀴) 메뉴에서 언제든지 앱을 다시 설치할 수 있습니다!"
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
        type="warning"
        duration={3500}
      />
    </>
  );
}


