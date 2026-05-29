"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [slogan1Visible, setSlogan1Visible] = useState(false);
  const [slogan2Visible, setSlogan2Visible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSlogan1Visible(true), 300);
    const t2 = setTimeout(() => setSlogan2Visible(true), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: 백엔드 연동 시 실제 로그인 로직으로 교체
    await new Promise((res) => setTimeout(res, 1000));
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    alert("구글 로그인 준비 중입니다");
    // TODO: 백엔드 연동 시 실제 OAuth 로직으로 교체
  };

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-10 w-full min-h-screen">
      <div className="w-full max-w-[430px] flex-1 flex flex-col">

        {/* 서비스 로고 */}
        <div className="flex flex-col items-center gap-5 mt-12 select-none">
          <div className="relative w-64 h-28">
            <Image
              src="/images/logo/dondok-logo.png"
              alt="Dondok"
              fill
              priority
              sizes="224px"
              className="object-contain"
            />
          </div>

          {/* 슬로건 애니메이션 */}
          <div className="flex flex-col items-center gap-1 text-center">
            <p
              className="text-xl font-bold text-text-primary transition-all duration-700"
              style={{ opacity: slogan1Visible ? 1 : 0, transform: slogan1Visible ? "translateY(0)" : "translateY(8px)" }}
            >
              사이는 돈독하게
            </p>
            <p
              className="text-xl font-bold text-primary-green transition-all duration-700"
              style={{ opacity: slogan2Visible ? 1 : 0, transform: slogan2Visible ? "translateY(0)" : "translateY(8px)" }}
            >
              지갑은 두둑하게
            </p>
          </div>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3 mt-10">
          <Input
            label="이메일"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary-green"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-1"
          >
            로그인
          </Button>
        </form>

        {/* 테스트 로그인 구분선 + 버튼 */}
        {/* TODO: 백엔드 연동 시 제거 */}
        <div className="flex items-center gap-3 mt-5">
          <div className="flex-1 h-px bg-text-secondary/20" />
          <span className="text-xs text-text-secondary shrink-0">개발용</span>
          <div className="flex-1 h-px bg-text-secondary/20" />
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          fullWidth
          className="mt-3"
          onClick={() => router.push("/crews")}
        >
          테스트 로그인 (Mock)
        </Button>
        <p className="text-[11px] text-text-secondary/60 text-center mt-1.5">
          * 백엔드 연동 전 임시 버튼
        </p>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm text-text-secondary mt-4">
          처음이신가요?{" "}
          <Link
            href="/signup"
            className="text-primary-green font-semibold underline underline-offset-2"
          >
            회원가입
          </Link>
        </p>

        {/* 소셜 로그인 구분선 */}
        <div className="flex items-center gap-3 mt-8">
          <div className="flex-1 h-px bg-text-secondary/20" />
          <span className="text-xs text-text-secondary shrink-0">소셜로 시작하기</span>
          <div className="flex-1 h-px bg-text-secondary/20" />
        </div>

        {/* 구글 버튼 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-4 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[var(--radius-button)] border border-text-secondary/30 bg-card text-text-primary text-sm font-semibold hover:bg-text-secondary/5 active:scale-[0.99] transition-all duration-200"
        >
          {/* Google G 아이콘 (SVG inline) */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google로 계속하기
        </button>

      </div>
    </div>
  );
}
