"use client";

import { ChevronLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
    title?: string; // 중앙 타이틀
    showLogo?: boolean; // 로고 표시 여부
    showBackButton?: boolean; // 뒤로가기 버튼 여부
    rightElement?: React.ReactNode; // 우측 커스텀 버튼 (알림, 닫기 등)
}

export const Header = ({
                           title,
                           showLogo = false,
                           showBackButton = false,
                           rightElement,
                       }: HeaderProps) => {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-40 w-full flex justify-center bg-background/80 backdrop-blur-md">
            {/* 📌 h-16(64px) 규격을 유지하여 상단 바의 안정감을 확보 */}
            <div className="w-full max-w-[430px] h-16 px-5 flex items-center justify-between border-b border-text-secondary/5">

                {/* 1. 좌측 구역: 로고 혹은 뒤로가기 */}
                <div className="flex-[1.5] flex items-center">
                    {showBackButton ? (
                        <button onClick={() => router.back()} className="p-1 -ml-1 hover:opacity-75 active:scale-95 transition-all">
                            <ChevronLeft size={24} className="text-text-primary" />
                        </button>
                    ) : showLogo ? (
                        <div className="flex items-center">
                            {/* 📌 버그 수정: h-20에서 h-16 래퍼 내부에 쏙 들어가는 h-10(40px)으로 밸런싱 튜닝 */}
                            <img
                                src="/images/text_logo.png"
                                alt="Dondok Logo"
                                className="h-20 w-auto object-contain select-none"
                            />
                        </div>
                    ) : null}
                </div>

                {/* 2. 중앙 구역: 페이지 타이틀 */}
                <div className="flex-[2] flex justify-center">
                    {title && (
                        /* 헤더 높이가 커진 만큼 텍스트도 밀착 */
                        <h1 className="text-base font-bold text-text-primary tracking-tight truncate">
                            {title}
                        </h1>
                    )}
                </div>

                {/* 3. 우측 구역: 알림, 닫기 혹은 빈 공간 */}
                <div className="flex-1 flex justify-end items-center">
                    {rightElement ? (
                        rightElement
                    ) : (
                        /* 로고 체급에 맞춰 알림 종 크기도 size 20에서 24로 밸런스 튜닝 */
                        <button className="p-1 -mr-1 hover:opacity-75 active:scale-95 transition-all">
                            <Bell size={24} className="text-text-primary" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};