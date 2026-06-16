"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, BellRing, LogOut, ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { logout } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

interface SheetItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    titleClassName?: string;
    disabled?: boolean;
    onClick: () => void;
}

function SheetItem({
    icon,
    title,
    subtitle,
    titleClassName = "",
    disabled = false,
    onClick,
}: SheetItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-text-secondary/5 active:bg-text-secondary/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
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
    const router = useRouter();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const close = () => setIsOpen(false);

    const handleNotificationSettings = () => {
        close();
        router.push("/notifications/settings");
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            await logout();
        } catch {
            alert("로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            clearAuth();
            close();
            router.replace("/login");
        }
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
                        title={isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                        titleClassName="!text-red-500"
                        disabled={isLoggingOut}
                        onClick={() => void handleLogout()}
                    />
                </div>
            </BottomSheet>
        </>
    );
}
