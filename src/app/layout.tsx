import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/common/BottomNav";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "돈독 (Dondok)",
    description: "습관 형성 및 정산 플랫폼, 돈독",
    manifest: "/manifest.json",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="ko"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col">
        {/*
            1. 콘텐츠 영역:
            네비바 높이(약 80px)만큼 하단 여백(pb-20)을 주어야
            마지막 콘텐츠가 네비바에 가려지지 않습니다.
        */}
        <main className="flex-1 pb-20">
            {children}
        </main>

        {/* 2. 전역 바텀 네비게이션: 항상 최상단 레이어에 고정 */}
        <BottomNav />
        </body>
        </html>
    );
}