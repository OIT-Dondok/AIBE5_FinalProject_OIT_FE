"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function InitialPage() {

    return (
        <div className="flex-1 flex flex-col items-center justify-between px-5 py-8 w-full">

            {/* 모바일 퍼스트 레이아웃 래퍼 (최대 폭 430px) */}
            <div className="w-full max-w-[430px] flex-1 flex flex-col justify-between items-center my-auto">

                <div className="h-4" />

                {/* 중앙 앱 아이콘 */}
                <div className="flex flex-col items-center gap-6 text-center select-none">
                    <div className="relative w-48 h-48">
                        <Image
                            src="/images/app_icon/dondok_app.png"
                            alt="Dondok App Icon"
                            fill
                            priority
                            sizes="48px"
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* 하단 로그인 버튼 및 샌드박스 네비게이션 */}
                <div className="w-full flex flex-col gap-3 mt-12">

                    {/* 구글 소셜 로그인 버튼 */}
                    <Button
                        variant="primary-blue"
                        fullWidth
                        onClick={() => alert("현재 백엔드 인증 인프라 설계 중입니다. 잠시만 기다려주세요!")}
                    >
                        Continue with Google
                    </Button>

                    {/* 이메일 로그인 버튼 */}
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => alert("현재 백엔드 인증 인프라 설계 중입니다. 잠시만 기다려주세요!")}
                    >
                        Continue with E-mail
                    </Button>

                    {/* UI 컴포넌트 샌드박스 이동 버튼 (임시) */}
                    <div className="pt-4 mt-2 border-t border-text-secondary/5 w-full">
                        <Link
                            href="/sandbox"
                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary-green text-white text-sm font-semibold"
                        >
                            <ShieldCheck size={16} />
                            UI 컴포넌트 샌드박스 보러가기
                            <ArrowRight size={14} className="ml-1" />
                        </Link>
                        <p className="text-[10px] text-text-secondary text-center mt-1.5 italic">
                            * 본 버튼은 백엔드 인프라 연동 전 공통 컴포넌트 검수용 관문입니다.
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}