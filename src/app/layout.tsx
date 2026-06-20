import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/common/LayoutWrapper";
import { AuthInitializer } from "@/components/common/AuthInitializer";
import { FcmInitializer } from "@/components/common/FcmInitializer";
import { NotificationBadgeInitializer } from "@/components/common/NotificationBadgeInitializer";

export const metadata: Metadata = {
    title: "Dondok",
    description: "Build habits, share the win.",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#5E9B73",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full antialiased">
        <body className="min-h-screen bg-background text-text-primary flex flex-col">
        <AuthInitializer />
        <FcmInitializer />
        <NotificationBadgeInitializer />
        <LayoutWrapper>
            {children}
        </LayoutWrapper>
        </body>
        </html>
    );
}