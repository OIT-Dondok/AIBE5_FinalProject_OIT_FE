"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { getOAuthFailureMessage } from "@/lib/oauth";
import { getGoogleOAuthUrl, login } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginNotice, setLoginNotice] = useState("");
  const [slogan1Visible, setSlogan1Visible] = useState(false);
  const [slogan2Visible, setSlogan2Visible] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const t1 = setTimeout(() => setSlogan1Visible(true), 300);
    const t2 = setTimeout(() => setSlogan2Visible(true), 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("oauthError");

    if (!reason) return;

    setLoginNotice(getOAuthFailureMessage(reason));
    window.history.replaceState(null, "", "/login");
  }, []);

  const validate = () => {
    let valid = true;

    if (!email) {
      setEmailError("이메일을 입력해주세요");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("비밀번호를 입력해주세요");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await login(email, password);
      setAuth(res.data.member, res.data.access_token);
      router.push("/crews");
    } catch (err) {
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;

      if (code === "INVALID_CREDENTIALS") {
        setPasswordError("이메일 또는 비밀번호가 올바르지 않습니다");
      } else if (code === "MEMBER_DEACTIVATED") {
        setEmailError("비활성화된 계정입니다");
      } else if (code === "INVALID_INPUT") {
        setEmailError("입력값을 확인해주세요");
      } else {
        setPasswordError("로그인 중 오류가 발생했습니다");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleOAuthUrl();
  };

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-10 w-full min-h-screen">
      <div className="w-full max-w-[430px] flex-1 flex flex-col">
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

          <div className="flex flex-col items-center gap-1 text-center">
            <p
              className={`text-xl font-bold text-text-primary transition-all duration-700 ${
                slogan1Visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              사이좋게 돈독하게
            </p>
            <p
              className={`text-xl font-bold text-primary-green transition-all duration-700 ${
                slogan2Visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              지갑은 두둑하게
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3 mt-10" noValidate>
          {loginNotice && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {loginNotice}
            </div>
          )}

          <Input
            label="이메일"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            errorMessage={emailError}
            required
            autoComplete="email"
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            errorMessage={passwordError}
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

        <p className="text-center text-sm text-text-secondary mt-4">
          처음이신가요?{" "}
          <Link
            href="/signup"
            className="text-primary-green font-semibold underline underline-offset-2"
          >
            회원가입
          </Link>
        </p>

        <div className="flex items-center gap-3 mt-8">
          <div className="flex-1 h-px bg-text-secondary/20" />
          <span className="text-xs text-text-secondary shrink-0">소셜로 시작하기</span>
          <div className="flex-1 h-px bg-text-secondary/20" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-4 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[var(--radius-button)] border border-text-secondary/30 bg-card text-text-primary text-sm font-semibold hover:bg-text-secondary/5 active:scale-[0.99] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/45"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Google로 계속하기
        </button>
      </div>
    </div>
  );
}
