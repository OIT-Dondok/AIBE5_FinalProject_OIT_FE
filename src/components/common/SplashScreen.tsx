'use client';

import { useEffect, useState } from 'react';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 브라우저 탭 세션당 1회만 표시되도록 세션 스토리지 체크
    const hasSplashed = sessionStorage.getItem('dondok-splashed');
    if (hasSplashed) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    sessionStorage.setItem('dondok-splashed', 'true');

    // 1.2초 후 서서히 사라지는 페이드아웃 시작
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    // 1.6초 후 DOM에서 컴포넌트 완전히 제거
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (isVisible === false || isVisible === null) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F5F0E6] transition-all duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-[1.08] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <style>{`
        @keyframes splash-dudoong {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.15); opacity: 0.9; }
          75% { transform: scale(0.95); opacity: 0.95; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      
      <div className="flex flex-col items-center justify-center">
        {/* 로고 애니메이션: '두둥' 효과 스케일 바운스 적용 */}
        <div className="relative animate-[splash-dudoong_0.75s_cubic-bezier(0.34,1.56,0.64,1)_forwards] drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
          <img
            src="/icon-512x512.png"
            alt="Dondok Splash Logo"
            className="w-28 h-28 object-contain rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}
