"use client";

import { useEffect } from "react";
import { usePwaStore } from "@/store/pwaStore";

// Chrome / Android 등에서 제공하는 PWA 설치 관련 beforeinstallprompt 이벤트 타입 정의
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

// iOS standalone 판단을 위한 Navigator 확장 인터페이스
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

// MSStream 존재 여부 판별을 위한 Window 확장 인터페이스
interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePwaInstall() {
  const {
    deferredPrompt,
    isStandalone,
    isIOS,
    isInstallable,
    setDeferredPrompt,
    setIsStandalone,
    setIsIOS,
    setIsInstallable,
  } = usePwaStore();

  useEffect(() => {
    // 1. standalone 모드 감지 (이미 설치된 앱으로 실행 중인지 확인)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true;
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const isStandaloneMode = checkStandalone();

    // 2. iOS 디바이스 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as WindowWithMSStream).MSStream;
    setIsIOS(isIOSDevice);

    // 3. 이미 window에 저장되어 있던 prompt 이벤트가 있는지 확인
    const checkExistingPrompt = () => {
      if (window.deferredPrompt) {
        setDeferredPrompt(window.deferredPrompt);
        if (!isStandaloneMode) {
          setIsInstallable(true);
        }
      }
    };

    checkExistingPrompt();

    // 4. beforeinstallprompt 이벤트 리스너 등록 (Chrome / Android / Desktop Chrome 대응)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      if (!isStandaloneMode) {
        setIsInstallable(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. iOS 디바이스인 경우 브라우저 레벨에서 beforeinstallprompt가 발생하지 않으므로,
    // standalone 모드가 아니면 항상 홈 화면 추가 가이드가 가능하므로 installable로 간주합니다.
    if (isIOSDevice && !isStandaloneMode) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [setDeferredPrompt, setIsStandalone, setIsIOS, setIsInstallable]);

  const install = async (): Promise<{ outcome: "accepted" | "dismissed" | "ios_guide" | "not_supported" | "error" }> => {
    if (isIOS) {
      return { outcome: "ios_guide" };
    }

    if (!deferredPrompt) {
      return { outcome: "not_supported" };
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        window.deferredPrompt = null;
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
      return { outcome };
    } catch {
      return { outcome: "error" };
    }
  };

  return {
    deferredPrompt,
    isStandalone,
    isIOS,
    isInstallable: isInstallable && !isStandalone,
    install,
  };
}

