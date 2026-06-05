"use client";

import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { BottomNav } from "@/components/common/BottomNav";
import { Header } from "@/components/common/Header";
import { Modal } from "@/components/common/Modal";
import { Toast } from "@/components/common/Toast";
import { Input } from "@/components/common/Input";
import { Chip } from "@/components/common/Chip";
import { StepProgressBar } from "@/components/common/StepProgressBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { ChargeBottomSheet } from "@/components/domain/point/ChargeBottomSheet";
import { DodinShortageModal } from "@/components/domain/point/DodinShortageModal";
import { useChargeBottomSheet } from "@/components/domain/point/useChargeBottomSheet";

import { X } from "lucide-react";

export default function SandboxPage() {
    // 1. 인터랙션 컴포넌트 상태 관리
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [isDodinShortageOpen, setIsDodinShortageOpen] = useState(false);
    const [isToastOpen, setIsToastOpen] = useState(false); // 👈 토스트 스위치 상태 선언
    const [activeChips, setActiveChips] = useState<Set<string>>(new Set(["status-모집 중", "cat-운동"]));
    const [demoStep, setDemoStep] = useState(2);
    const {
        chargeInitialAmount,
        closeChargeBottomSheet,
        isChargeSheetOpen,
        openChargeBottomSheet,
    } = useChargeBottomSheet();
    const shortageRequiredAmount = 50000;
    const shortageCurrentBalance = 32000;
    const shortageAmount = Math.max(shortageRequiredAmount - shortageCurrentBalance, 0);

    const toggleChip = (label: string) =>
        setActiveChips((prev) => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            return next;
        });

    return (
        <main className="min-h-screen bg-transparent flex flex-col items-center justify-start">

            {/* 2. 모바일 퍼스트 코어 래퍼 */}
            <div className="w-full max-w-[430px] flex flex-col relative pb-32">

                {/* 헤더 타입 테스트 영역 */}
                <Header showLogo={true} />

                {/* <Header showBackButton={true} title="크루 상세 정보" /> */}
                {/* <Header title="프로필 수정" rightElement={<X size={20} className="text-text-secondary" />} /> */}

                {/* 실제 컴포넌트 진열 영역 */}
                <div className="flex flex-col gap-8 px-4 pt-6">

                    {/* 페이지 소개 */}
                    <header className="border-b border-text-secondary/10 pb-4">
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            dondok UI Sandbox
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">
                            공통 컴포넌트 실물 가이드 및 복사용 코드 보관소
                        </p>
                    </header>

                    {/* 1. Button Variants */}
                    <section className="bg-card p-6 rounded-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-4">
                        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                            1. Button Variants
                        </h2>

                        <Button variant="primary-blue" fullWidth>
                            Primary Blue (정산/CTA 강조)
                        </Button>

                        <Button variant="primary-green" fullWidth>
                            Primary Green (습관/공동체)
                        </Button>

                        <Button variant="outline" fullWidth>
                            Outline (취소/결정 번복)
                        </Button>
                    </section>

                    {/* 2. Button Sizes */}
                    <section className="bg-card p-6 rounded-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-4">
                        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                            2. Button Sizes
                        </h2>

                        <div className="flex flex-col gap-3 items-start">
                            <Button variant="primary-blue" size="lg" fullWidth>
                                Large 버튼 (py-4)
                            </Button>

                            <Button variant="primary-blue" size="md">
                                Medium 버튼 (기본형)
                            </Button>

                            <Button variant="primary-blue" size="sm">
                                Small 배지형 버튼
                            </Button>
                        </div>
                    </section>

                    {/* 3. Button States */}
                    <section className="bg-card p-6 rounded-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-4">
                        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                            3. States
                        </h2>

                        <Button variant="primary-blue" fullWidth isLoading={true}>
                            제출 데이터 처리 중
                        </Button>

                        <Button variant="primary-green" fullWidth disabled={true}>
                            가입 조건 미충족 비활성
                        </Button>
                    </section>

                    {/* 4. Premium Leader Badge */}
                    <section className="bg-card p-6 rounded-card shadow-sm flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-text-secondary uppercase">
                                4. Premium Leader Badge
                            </h2>

                            <p className="text-[10px] text-text-secondary">
                                방장 전용 아이덴티티 배지
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            <Badge>
                                <span className="mr-1 text-[12px]">👑</span>
                                방장
                            </Badge>

                            <Badge>
                                <span className="mr-1 text-[12px]">👑</span>
                                방장 3회
                            </Badge>
                        </div>
                    </section>

                    {/* 5. Bottom Navigation */}
                    <section className="bg-card p-6 rounded-card shadow-sm flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-text-secondary uppercase">
                                5. Global Bottom Navigation
                            </h2>

                            <p className="text-[10px] text-text-secondary">
                                앱 전체 메인 흐름 제어용 네비게이션
                            </p>
                        </div>

                        <div className="relative h-24 border border-dashed border-text-secondary/20 rounded-lg flex items-center justify-center bg-background/50">
                            <p className="text-xs text-text-secondary italic">
                                실제 화면 하단에 고정 렌더링됩니다.
                            </p>
                        </div>
                    </section>

                    {/* 6. Modal Framework */}
                    <section className="bg-card p-6 rounded-card shadow-sm flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-text-secondary uppercase">
                                6. Modal Framework
                            </h2>

                            <p className="text-[10px] text-text-secondary">
                                다양한 형태로 확장 가능한 공통 모달 구조
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => setIsAlertOpen(true)}
                            >
                                🚨 알림형 모달
                            </Button>

                            <Button
                                variant="primary-blue"
                                fullWidth
                                onClick={() => setIsInputOpen(true)}
                            >
                                ✍️ 입력형 모달
                            </Button>
                        </div>
                    </section>

                    {/* 7. Dodin Shortage Modal */}
                    <section className="bg-card p-6 rounded-card shadow-sm flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-text-secondary uppercase">
                                7. Dodin Shortage Modal
                            </h2>

                            <p className="text-[10px] text-text-secondary">
                                크루 참여 전 사용가능 도딘 부족 상황을 검증하는 목업 모달
                            </p>
                        </div>

                        <Button
                            variant="primary-blue"
                            fullWidth
                            onClick={() => setIsDodinShortageOpen(true)}
                        >
                            💰 도딘 부족 모달 열기
                        </Button>
                    </section>

                    {/*  8. MVP Toast Feedback */}
                    <section className="bg-card p-6 rounded-card shadow-sm flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-text-secondary uppercase">
                                8. MVP Toast Feedback
                            </h2>

                            <p className="text-[10px] text-text-secondary">
                                미션 인증 제출 등 핵심 성공 액션에 대한 휘발성 알림
                            </p>
                        </div>

                        <Button
                            variant="primary-green"
                            fullWidth
                            onClick={() => setIsToastOpen(true)}
                        >
                            🚀 미션 인증 완료 시뮬레이션
                        </Button>
                    </section>

                    {/* 9. Input Component */}
                    <section className="bg-card p-6 rounded-card shadow-sm flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-text-secondary uppercase">
                                9. Input Component
                            </h2>
                            <p className="text-[10px] text-text-secondary">
                                라벨, 에러 핸들링, 비밀번호 토글이 내장된 공통 인풋
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* 기본 인풋 */}
                            <Input
                                label="이메일"
                                type="email"
                                placeholder="example@dondok.com"
                                required
                            />

                            {/* 비밀번호 인풋 (눈 모양 아이콘 확인) */}
                            <Input
                                label="비밀번호"
                                type="password"
                                placeholder="8자 이상 입력해주세요"
                                required
                            />

                            {/* 에러 상태 인풋 */}
                                <Input
                                    label="닉네임"
                                    type="text"
                                    placeholder="사용하실 닉네임을 입력하세요"
                                    errorMessage="이미 사용 중인 닉네임입니다."
                                    required
                                />
                        </div>
                    </section>

                    {/* 10. Chip */}
                    <section className="bg-card rounded-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-5 overflow-hidden">
                        <div className="px-6 pt-6 flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                                10. Chip
                            </h2>
                            <p className="text-[10px] text-text-secondary">
                                클릭하면 active 상태가 토글됩니다
                            </p>
                        </div>

                        {/* status 타입: 상태 필터 탭 느낌 */}
                        <div className="flex flex-col gap-2 px-6">
                            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                                Status — 상태 필터
                            </p>
                            <p className="text-[10px] text-text-secondary">
                                큰 사이즈 · 사각형 라운딩 · Active = 흰 카드 + 그림자
                            </p>
                        </div>
                        <div className="bg-background px-4 py-3 flex flex-wrap gap-1">
                            {["전체", "모집 중", "진행 중", "완료"].map((label) => (
                                <Chip
                                    key={`status-${label}`}
                                    label={label}
                                    chipType="status"
                                    isActive={activeChips.has(`status-${label}`)}
                                    onClick={() => toggleChip(`status-${label}`)}
                                />
                            ))}
                        </div>

                        {/* category 타입: 카테고리 태그 느낌 */}
                        <div className="flex flex-col gap-2 px-6">
                            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                                Category — 카테고리 태그
                            </p>
                            <p className="text-[10px] text-text-secondary">
                                작은 사이즈 · 알약형 · Active = 초록 배경 · Inactive = 테두리 없음
                            </p>
                        </div>
                        <div className="px-6 pb-6 flex flex-wrap gap-2">
                            {["기상", "독서", "운동", "식단", "명상", "러닝"].map((label) => (
                                <Chip
                                    key={`cat-${label}`}
                                    label={label}
                                    chipType="category"
                                    isActive={activeChips.has(`cat-${label}`)}
                                    onClick={() => toggleChip(`cat-${label}`)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* 11. StepProgressBar */}
                    <section className="bg-card p-6 rounded-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                                11. StepProgressBar
                            </h2>
                            <p className="text-[10px] text-text-secondary">
                                현재 {demoStep}/4 단계
                            </p>
                        </div>

                        <StepProgressBar
                            currentStep={demoStep}
                            totalSteps={4}
                            stepLabels={["정보 입력", "크루 설정", "규칙 설정", "완료"]}
                        />

                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDemoStep((s) => Math.max(1, s - 1))}
                                disabled={demoStep === 1}
                            >
                                이전
                            </Button>
                            <Button
                                variant="primary-blue"
                                size="sm"
                                onClick={() => setDemoStep((s) => Math.min(4, s + 1))}
                                disabled={demoStep === 4}
                            >
                                다음
                            </Button>
                        </div>
                    </section>

                    {/* 12. EmptyState */}
                    <section className="bg-card rounded-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-4 overflow-hidden">
                        <div className="px-6 pt-6 flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                                12. EmptyState
                            </h2>
                        </div>

                        <div className="border-b border-text-secondary/10">
                            <EmptyState
                                icon="🔍"
                                title="참여 중인 크루가 없어요"
                                description="아직 크루에 가입하지 않으셨군요. 관심 있는 습관 크루를 찾아보세요!"
                                actionButtonText="크루 탐색하기"
                                onActionClick={() => alert("크루 탐색 페이지로 이동")}
                            />
                        </div>

                        <EmptyState
                            icon="📭"
                            title="알림이 없습니다"
                        />
                    </section>

                    {/* 13. Skeleton */}
                    <section className="bg-card p-6 rounded-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-5">
                        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                            13. Skeleton
                        </h2>

                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] font-semibold text-text-secondary">text</p>
                            <Skeleton variant="text" width="60%" height={14} />
                            <Skeleton variant="text" width="80%" height={14} />
                            <Skeleton variant="text" width="45%" height={14} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] font-semibold text-text-secondary">circle</p>
                            <div className="flex gap-3">
                                <Skeleton variant="circle" width={40} height={40} />
                                <Skeleton variant="circle" width={48} height={48} />
                                <Skeleton variant="circle" width={56} height={56} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] font-semibold text-text-secondary">rect — 카드 스켈레톤 예시</p>
                            <div className="flex gap-3">
                                <Skeleton variant="rect" width="100%" height={100} />
                            </div>
                            <div className="flex gap-3">
                                <Skeleton variant="rect" width={80} height={80} />
                                <div className="flex flex-col gap-2 flex-1 justify-center">
                                    <Skeleton variant="text" width="70%" height={14} />
                                    <Skeleton variant="text" width="50%" height={12} />
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            {/* ========================================================
               📌 [전역 인터랙션 컴포넌트 거치대]
               ======================================================== */}

            {/* Alert Modal */}
            <Modal
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                className="p-7"
            >
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                        <span className="text-xl">⚠️</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-base font-bold text-text-primary">
                            참여 불가 안내
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            보유 포인트가 최소 참여 금액보다 부족합니다.
                            <br />
                            포인트를 충전하시겠습니까?
                        </p>
                    </div>

                    <div className="flex gap-2 w-full mt-2">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => setIsAlertOpen(false)}
                        >
                            취소
                        </Button>
                        <Button variant="primary-blue" fullWidth>
                            충전소 이동
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Input Modal */}
            <Modal
                isOpen={isInputOpen}
                onClose={() => setIsInputOpen(false)}
                className="p-6"
            >
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-center border-b border-text-secondary/5 pb-3">
                        <h3 className="text-sm font-bold text-text-primary">
                            인증 반려 사유
                        </h3>
                        <button onClick={() => setIsInputOpen(false)}>
                            <X size={18} className="text-text-secondary" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-[11px] font-bold text-text-secondary uppercase">
                            사유 선택
                        </label>
                        <select className="w-full p-3 text-xs bg-background border border-text-secondary/20 rounded-button">
                            <option>실물 촬영 가이드 미준수</option>
                            <option>시간 제한 초과</option>
                            <option>기타 직접 입력</option>
                        </select>
                        <textarea
                            className="w-full h-24 p-3 text-xs bg-background border border-text-secondary/20 rounded-button resize-none"
                            placeholder="상세한 반려 사유를 입력해주세요..."
                        />
                    </div>

                    <Button
                        variant="primary-green"
                        fullWidth
                        onClick={() => {
                            alert("전송 완료");
                            setIsInputOpen(false);
                        }}
                    >
                        반려 처리하기
                    </Button>
                </div>
            </Modal>

            <DodinShortageModal
                isOpen={isDodinShortageOpen}
                onClose={() => setIsDodinShortageOpen(false)}
                onCharge={() => {
                    setIsDodinShortageOpen(false);
                    openChargeBottomSheet(shortageAmount);
                }}
                requiredAmount={shortageRequiredAmount}
                currentBalance={shortageCurrentBalance}
            />

            <ChargeBottomSheet
                isOpen={isChargeSheetOpen}
                onClose={closeChargeBottomSheet}
                currentBalance={shortageCurrentBalance}
                initialAmount={chargeInitialAmount}
            />

            {/* 📌 실물 토스트 컴포넌트: 바텀 네비바(bottom-24) 바로 위 공중 */}
            <Toast
                isOpen={isToastOpen}
                onClose={() => setIsToastOpen(false)}
                message="오늘의 인증이 정상적으로 제출되었습니다!"
            />

            {/* 전역 바텀 네비게이션 */}
            <BottomNav />
        </main>
    );
}
