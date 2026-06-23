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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#121212] transition-all duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-[1.08] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <style>{`
        @keyframes splash-scale {
          0% { transform: scale(0.6); opacity: 0; filter: blur(4px); }
          15% { transform: scale(0.85); opacity: 0.5; filter: blur(2px); }
          100% { transform: scale(1.05); opacity: 1; filter: blur(0); }
        }
        @keyframes splash-fade {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="flex flex-col items-center gap-4">
        {/* 로고 애니메이션: 퍼블릭 폴더의 고해상도 PWA 아이콘 사용 */}
        <div className="relative animate-[splash-scale_1.4s_cubic-bezier(0.16,1,0.3,1)_forwards] drop-shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <img
            src="/icon-512x512.png"
            alt="Dondok Splash Logo"
            className="w-24 h-24 object-contain rounded-2xl"
          />
        </div>
        
        {/* 서비스 타이틀 & 슬로건 페이드인 */}
        <div className="text-center mt-2 animate-[splash-fade_1s_ease-out_0.3s_forwards] opacity-0 translate-y-2">
          <h1 className="text-white text-xl font-black tracking-widest">돈독</h1>
          <p className="text-white/70 text-[10px] font-bold tracking-wider mt-1">Build habits, share the win</p>
        </div>
      </div>
    </div>
  );
}
