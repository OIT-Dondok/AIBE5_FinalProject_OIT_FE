"use client";

import Link from "next/link";
import { ChevronLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
    title?: string; // 중앙 타이틀
    showLogo?: boolean; // 로고 표시 여부
    showBackButton?: boolean; // 뒤로가기 버튼 여부
    onBackClick?: () => void; // 커스텀 뒤로가기 동작
    rightElement?: React.ReactNode; // 우측 커스텀 버튼 (알림, 닫기 등)
}

export const Header = ({
                           title,
                           showLogo = false,
                           showBackButton = false,
                           onBackClick,
                           rightElement,
                       }: HeaderProps) => {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-40 w-full flex justify-center bg-background/80 backdrop-blur-md">
            {/* h-16(64px) 규격을 유지하여 상단 바의 안정감을 확보합니다. */}
            <div className="w-full max-w-[430px] h-16 px-5 flex items-center justify-between border-b border-text-secondary/5">

                {/* 1. 좌측 구역: 로고 혹은 뒤로가기 */}
                <div className="flex-[1.5] flex items-center">
                    {showBackButton ? (
                        /* 📌 피드백 반영: type="button"과 aria-label 추가로 폼 제출 버그 방어 및 접근성 확보 */
                        <button
                            type="button"
                            aria-label="뒤로가기"
                            onClick={onBackClick ?? (() => router.back())}
                            className="p-1 -ml-1 hover:opacity-75 active:scale-95 transition-all"
                        >
                            <ChevronLeft size={24} className="text-text-primary" />
                        </button>
                    ) : showLogo ? (
                        <Link href="/crews" className="flex items-center">
                            <img
                                src="/images/logo/dondok-logo.png"
                                alt="Dondok Logo"
                                className="h-20 w-auto object-contain select-none"
                            />
                        </Link>
                    ) : null}
                </div>

                {/* 2. 중앙 구역: 페이지 타이틀 */}
                <div className="flex-[2] flex justify-center">
                    {title && (
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
                        /* 📌 피드백 반영: 기본 알림 버튼에도 동일하게 type과 aria-label 확정 주입 */
                        <button
                            type="button"
                            aria-label="알림 열기"
                            className="p-1 -mr-1 hover:opacity-75 active:scale-95 transition-all"
                        >
                            <Bell size={24} className="text-text-primary" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
