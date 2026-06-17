import {
    Users,
    Wallet,
    PieChart,
    CircleDollarSign,
    Camera,
    Clock,
    Calculator,
    HelpCircle,
    CheckCircle2,
    ArrowRight,
    Sun,
    Moon,
    Sunset,
    ShieldCheck,
    Hourglass,
    Flag,
    Lock,
} from "lucide-react";
import { Header } from "@/components/common/Header";
import { FaqAccordion } from "@/components/domain/guide/FaqAccordion";

// ─── 섹션 1: 돈독이란 ────────────────────────────────────────────────────────

function WhatIsDondok() {
    return (
        <section className="bg-card rounded-card shadow-card border border-text-secondary/10 overflow-hidden">
            <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🪙</span>
                    <h2 className="text-base font-bold text-text-primary">돈독이란?</h2>
                </div>
                <p className="text-sm font-bold text-primary-green mb-2">
                    &ldquo;사이는 돈독하게, 지갑은 두둑하게&rdquo;
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                    크루를 만들고 보증금을 걸어 함께 습관을 형성하는 <strong className="text-text-primary">지분 기반 습관 형성 플랫폼</strong>입니다.
                    꾸준히 인증할수록 더 많은 환급금을 돌려받는 구조로, 동기부여와 보상이 함께합니다.
                </p>
            </div>
            <div className="bg-success-green/30 border-t border-primary-green/10 px-5 py-3 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-primary-green shrink-0" />
                <p className="text-xs text-primary-green font-semibold">성실할수록 더 많이 돌려받는 공정한 정산</p>
            </div>
        </section>
    );
}

// ─── 섹션 2: 핵심 개념 ────────────────────────────────────────────────────────

interface Concept {
    icon: React.ReactNode;
    term: string;
    description: string;
    bg: string;
}

const CONCEPTS: readonly Concept[] = [
    {
        icon: <Users size={20} className="text-primary-green" />,
        term: "크루",
        description: "같은 목표를 가진 2~15명의 그룹",
        bg: "bg-emerald-50",
    },
    {
        icon: <Wallet size={20} className="text-amber-500" />,
        term: "보증금",
        description: "크루 참여 시 예치하는 금액",
        bg: "bg-amber-50",
    },
    {
        icon: <PieChart size={20} className="text-primary-blue" />,
        term: "지분율",
        description: "내 성공 횟수 ÷ 전체 성공 횟수 합계",
        bg: "bg-blue-50",
    },
    {
        icon: <CircleDollarSign size={20} className="text-violet-500" />,
        term: "도딘",
        description: "돈독 내 포인트 — 환급금이 쌓이는 곳",
        bg: "bg-violet-50",
    },
] as const;

function CoreConcepts() {
    return (
        <section className="bg-card rounded-card shadow-card border border-text-secondary/10 overflow-hidden">
            <div className="px-5 pt-5 pb-2">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">💡</span>
                    <h2 className="text-base font-bold text-text-primary">핵심 개념</h2>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    {CONCEPTS.map((c) => (
                        <div
                            key={c.term}
                            className="rounded-2xl border border-text-secondary/10 p-3.5 flex flex-col gap-2"
                        >
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg}`}>
                                {c.icon}
                            </span>
                            <div>
                                <p className="text-sm font-bold text-text-primary">{c.term}</p>
                                <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{c.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-4" />
        </section>
    );
}

// ─── 섹션 3: 이용 방법 ────────────────────────────────────────────────────────

interface Step {
    number: number;
    title: string;
    description: string;
}

const STEPS: readonly Step[] = [
    { number: 1, title: "크루 탐색", description: "마음에 드는 크루 발견" },
    { number: 2, title: "보증금 예치", description: "방장 승인 후 시작일부터 인증" },
    { number: 3, title: "미션 인증", description: "사진 + 캡션으로 인증" },
    { number: 4, title: "방장 검증", description: "승인 / 거절" },
    { number: 5, title: "정산", description: "지분율 기반 환급" },
] as const;

function HowToUse() {
    return (
        <section className="bg-card rounded-card shadow-card border border-text-secondary/10 px-5 pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🚀</span>
                <h2 className="text-base font-bold text-text-primary">이용 방법</h2>
            </div>
            <div className="flex flex-col gap-0">
                {STEPS.map((step, idx) => (
                    <div key={step.number}>
                        <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-full bg-primary-green flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                                {step.number}
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-text-primary">{step.title}</p>
                                <p className="text-xs text-text-secondary mt-0.5">{step.description}</p>
                            </div>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className="flex items-center gap-3 my-1">
                                <div className="w-7 flex justify-center">
                                    <ArrowRight size={13} className="text-primary-green/40 rotate-90" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── 섹션 4: 인증 방식 ────────────────────────────────────────────────────────

interface AuthType {
    icon: React.ReactNode;
    label: string;
    type: string;
    deadline: string;
    settlement: string;
    bg: string;
    border: string;
}

const AUTH_TYPES: readonly AuthType[] = [
    {
        icon: <Sun size={16} className="text-amber-500" />,
        label: "아침형",
        type: "A",
        deadline: "마감 09:00",
        settlement: "정산 12:00",
        bg: "bg-amber-50",
        border: "border-amber-200/60",
    },
    {
        icon: <Sunset size={16} className="text-orange-400" />,
        label: "표준형",
        type: "B",
        deadline: "마감 21:00",
        settlement: "정산 00:00",
        bg: "bg-orange-50",
        border: "border-orange-200/60",
    },
    {
        icon: <Moon size={16} className="text-violet-400" />,
        label: "올빼미형",
        type: "C",
        deadline: "마감 23:59",
        settlement: "정산 익일 12:00",
        bg: "bg-violet-50",
        border: "border-violet-200/60",
    },
] as const;

function AuthMethod() {
    return (
        <section className="bg-card rounded-card shadow-card border border-text-secondary/10 px-5 pt-5 pb-5">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📸</span>
                <h2 className="text-base font-bold text-text-primary">인증 방식</h2>
            </div>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                실물 촬영 시 Exif 메타데이터로 촬영 시각이 자동 검증됩니다.
            </p>
            <div className="flex gap-2">
                {AUTH_TYPES.map((t) => (
                    <div
                        key={t.type}
                        className={`flex-1 rounded-2xl border ${t.border} ${t.bg} p-3 flex flex-col gap-1.5`}
                    >
                        <div className="flex items-center gap-1.5">
                            {t.icon}
                            <span className="text-[11px] font-bold text-text-primary">{t.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-text-secondary bg-white/70 rounded-md px-1.5 py-0.5 w-fit">
                            타입 {t.type}
                        </span>
                        <p className="text-[10px] text-text-secondary leading-snug">{t.deadline}</p>
                        <p className="text-[10px] text-text-secondary leading-snug">{t.settlement}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── 섹션 5: 정산 방식 ────────────────────────────────────────────────────────

function Settlement() {
    return (
        <section className="bg-card rounded-card shadow-card border border-text-secondary/10 px-5 pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💰</span>
                <h2 className="text-base font-bold text-text-primary">정산 방식</h2>
            </div>

            {/* 수식 카드 */}
            <div className="rounded-2xl bg-primary-blue/5 border border-primary-blue/15 px-4 py-3 mb-4 space-y-2">
                <div className="flex items-center gap-2">
                    <PieChart size={14} className="text-primary-blue shrink-0" />
                    <p className="text-xs text-text-primary">
                        <strong>지분율</strong> = 내 누적 성공 횟수 ÷ 전체 누적 성공 횟수
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Calculator size={14} className="text-primary-blue shrink-0" />
                    <p className="text-xs text-text-primary">
                        <strong>환급금</strong> = 총 예치 보증금 × 지분율
                    </p>
                </div>
            </div>

            <ul className="space-y-2">
                {[
                    "성실할수록 더 많이 돌려받는 구조입니다.",
                    "절사 잔액(1~14원)은 방장에게 귀속됩니다.",
                ].map((text) => (
                    <li key={text} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-primary-green shrink-0 mt-0.5" />
                        <p className="text-xs text-text-secondary leading-relaxed">{text}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}

// ─── 섹션 6: 운영 메커니즘 ────────────────────────────────────────────────────

interface Mechanism {
    icon: React.ReactNode;
    title: string;
    description: string;
    bg: string;
}

const MECHANISMS: readonly Mechanism[] = [
    {
        icon: <ShieldCheck size={18} className="text-primary-green" />,
        title: "방장 검증 타이밍",
        description:
            "방장은 매일 일일 정산 전까지 인증을 검증해요. 정산 전이라면 검증 결과를 다시 수정할 수 있어요.",
        bg: "bg-emerald-50",
    },
    {
        icon: <Hourglass size={18} className="text-primary-blue" />,
        title: "검증 유예 기간",
        description:
            "정산 시각까지 검증되지 않은 인증은 정산 시각부터 3일(72시간)의 유예 기간이 적용돼요. 이 기간 안에 방장이 확정하지 않으면 임시 결과가 그대로 확정돼요.",
        bg: "bg-blue-50",
    },
    {
        icon: <Flag size={18} className="text-violet-500" />,
        title: "최종 정산 시점",
        description:
            "크루의 마지막 일일 정산이 끝난 뒤 24시간이 지나면 최종 정산이 진행돼요.",
        bg: "bg-violet-50",
    },
] as const;

const PARTICIPATION_RULES: readonly string[] = [
    "크루 활동 중에는 중도 탈퇴할 수 없어요.",
    "활동 중 보증금은 중도 환급되지 않아요.",
    "이미 시작한 크루에는 중도 참여하거나 재참여할 수 없어요.",
] as const;

function OperationMechanism() {
    return (
        <section className="bg-card rounded-card shadow-card border border-text-secondary/10 px-5 pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚙️</span>
                <h2 className="text-base font-bold text-text-primary">운영 메커니즘</h2>
            </div>

            <div className="flex flex-col gap-2.5">
                {MECHANISMS.map((m) => (
                    <div
                        key={m.title}
                        className="rounded-2xl border border-text-secondary/10 p-3.5 flex items-start gap-3"
                    >
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.bg}`}>
                            {m.icon}
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-text-primary">{m.title}</p>
                            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{m.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 참여 규칙 */}
            <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200/60 px-4 py-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                    <Lock size={14} className="text-amber-500 shrink-0" />
                    <p className="text-sm font-bold text-text-primary">참여 규칙</p>
                </div>
                <ul className="space-y-2">
                    {PARTICIPATION_RULES.map((text) => (
                        <li key={text} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            <p className="text-xs text-text-secondary leading-relaxed">{text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

// ─── 페이지 루트 ──────────────────────────────────────────────────────────────

export default function GuidePage() {
    return (
        <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
            <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
                <Header showBackButton title="서비스 가이드" />

                <div className="px-5 pt-5 flex flex-col gap-4">
                    <WhatIsDondok />
                    <CoreConcepts />
                    <HowToUse />
                    <AuthMethod />
                    <Settlement />
                    <OperationMechanism />
                    <FaqAccordion />

                    {/* 하단 여백 */}
                    <p className="text-center text-[11px] text-text-secondary/50 pb-2">
                        돈독 v1.0 · 문의: dondok.oit@gmail.com
                    </p>
                </div>
            </div>
        </main>
    );
}
