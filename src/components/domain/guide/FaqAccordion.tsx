"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
    {
        question: "보증금은 안전한가요?",
        answer: "토스페이먼츠 연동으로 안전하게 관리됩니다.",
    },
    {
        question: "방장이 참여를 승인하기 전에 신청을 취소하면?",
        answer: "예치한 보증금이 즉시 환급됩니다.",
    },
    {
        question: "방장이 참여를 승인한 뒤에는 취소할 수 있나요?",
        answer: "승인 후에는 참여 취소가 불가하며, 보증금은 정산 전까지 Lock 처리됩니다.",
    },
    {
        question: "인증을 못하면?",
        answer: "인증하지 못한 날은 성공으로 집계되지 않습니다. 다른 크루원이 성공하면 그만큼 내 환급 비율이 줄어듭니다.",
    },
    {
        question: "방장이 검증을 깜빡하면?",
        answer: "정산 시각까지 검증되지 않은 인증은 정산 시각부터 3일(72시간)의 유예 기간이 적용됩니다. 이 기간이 지나면 임시 결과가 그대로 확정됩니다.",
    },
    {
        question: "방장이 검증 결과를 바꿀 수 있나요?",
        answer: "해당 일 정산 전까지는 검증 결과를 수정할 수 있습니다. 정산이 끝난 뒤에는 변경되지 않습니다.",
    },
    {
        question: "최종 정산은 언제 되나요?",
        answer: "크루의 마지막 일일 정산이 끝난 뒤 24시간이 지나면 최종 정산이 진행됩니다.",
    },
    {
        question: "크루 중간에 참여하거나 다시 들어갈 수 있나요?",
        answer: "이미 시작한 크루에는 중도 참여나 재참여가 불가능합니다. 또한 활동 중에는 탈퇴와 보증금 중도 환급이 모두 불가합니다.",
    },
] as const;

export function FaqAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (idx: number) => {
        setOpenIndex((prev) => (prev === idx ? null : idx));
    };

    return (
        <section className="bg-card rounded-card shadow-card border border-text-secondary/10 overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                <span className="text-xl">🙋</span>
                <h2 className="text-base font-bold text-text-primary">자주 묻는 질문</h2>
            </div>
            <div className="divide-y divide-text-secondary/[0.08]">
                {FAQ_ITEMS.map((item, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                        <div key={item.question}>
                            <button
                                type="button"
                                onClick={() => toggle(idx)}
                                className="w-full flex items-center justify-between px-5 py-4 hover:bg-text-secondary/5 transition-colors"
                            >
                                <span className="text-sm font-semibold text-text-primary text-left pr-3">
                                    Q. {item.question}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`text-text-secondary/60 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                            {isOpen && (
                                <div className="px-5 pb-4 pt-0">
                                    <p className="text-sm text-text-secondary leading-relaxed border-l-2 border-primary-green/40 pl-3">
                                        {item.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
