import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// manifest 파일과 연결되도록 수정
export const metadata: Metadata = {
  title: "돈독 (Dondok)",
  description: "습관 형성 및 정산 플랫폼, 돈독",
  manifest: "/manifest.json", // 이 부분이 한 줄이 추가되어 브라우저가 PWA 설정을 읽음
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col">{children}</body>
      </html>
  );
}