"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/common/BottomNav";

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

    const showNav = !HIDE_NAV_PATTERNS.some((pattern) => {
        if (pattern === "/") return pathname === "/";
        return pathname === pattern || pathname.startsWith(`${pattern}/`);
    }) && !pathname.endsWith("/host-console");

    return (
        <>
            <main className={`flex-1 flex flex-col ${showNav ? "pb-20" : ""}`}>
                {children}
            </main>
            {showNav && <BottomNav />}
        </>
    );
};
