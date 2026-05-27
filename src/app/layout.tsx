import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/common/LayoutWrapper";

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
        <LayoutWrapper>
            {children}
        </LayoutWrapper>
        </body>
        </html>
    );
}