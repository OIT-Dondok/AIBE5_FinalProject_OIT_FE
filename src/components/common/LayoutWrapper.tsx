"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/common/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

// 네비바를 숨길 경로 패턴 (수정 시 여기만 손보면 됨)
const HIDE_NAV_PATTERNS = [
    "/",
    "/login",
    "/signup",
    "/onboarding",
] as const;

type LayoutWrapperProps = {
    children: React.ReactNode;
};

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
    const pathname = usePathname();
    const isInitialized = useAuthStore((state) => state.isInitialized);

    const showNav = !HIDE_NAV_PATTERNS.some((pattern) => {
        if (pattern === "/") return pathname === "/";
        return pathname === pattern || pathname.startsWith(`${pattern}/`);
    });

    if (!isInitialized) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background text-text-primary">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-500)]" />
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">인증 정보를 확인 중입니다...</p>
            </div>
        );
    }

    return (
        <>
            <main className={`flex-1 flex flex-col ${showNav ? "pb-20" : ""}`}>
                {children}
            </main>
            {showNav && <BottomNav />}
        </>
    );
};