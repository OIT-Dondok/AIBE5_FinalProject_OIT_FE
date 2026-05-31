"use client";

import { useState } from "react";
import { Settings, BellRing, LogOut, ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";

interface SheetItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    titleClassName?: string;
    onClick: () => void;
}

function SheetItem({ icon, title, subtitle, titleClassName = "", onClick }: SheetItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-text-secondary/5 active:bg-text-secondary/10 transition-colors"
        >
            <span className="shrink-0">{icon}</span>
            <span className="flex-1 text-left">
                <span className={`block text-sm font-semibold text-text-primary ${titleClassName}`}>
                    {title}
                </span>
                {subtitle && (
                    <span className="block text-xs text-text-secondary mt-0.5">{subtitle}</span>
                )}
            </span>
            <ChevronRight size={16} className="text-text-secondary/40 shrink-0" />
        </button>
    );
}

export function ProfileSettingsSheet() {
    const [isOpen, setIsOpen] = useState(false);

    const close = () => setIsOpen(false);

    const handleNotificationSettings = () => {
        close();
        alert("준비 중입니다");
    };

    const handleLogout = () => {
        close();
        alert("로그아웃 준비 중입니다");
        // TODO: 백엔드 연동 시 POST /api/auth/logout 호출
    };

    return (
        <>
            <button
                type="button"
                aria-label="프로필 설정"
                onClick={() => setIsOpen(true)}
                className="p-1 -mr-1 rounded-full text-text-secondary hover:text-text-primary active:scale-95 transition-all"
            >
                <Settings size={22} />
            </button>

            <BottomSheet isOpen={isOpen} onClose={close} title="설정" ariaLabel="프로필 설정 메뉴">
                <div className="py-2 pb-10">
                    <SheetItem
                        icon={<BellRing size={20} className="text-orange-400" />}
                        title="알림 설정"
                        subtitle="수신 · 채널 · 시간대 설정"
                        onClick={handleNotificationSettings}
                    />

                    <div className="mx-5 my-2 border-t border-text-secondary/[0.08]" />

                    <SheetItem
                        icon={<LogOut size={20} className="text-red-400" />}
                        title="로그아웃"
                        titleClassName="!text-red-500"
                        onClick={handleLogout}
                    />
                </div>
            </BottomSheet>
        </>
    );
}
