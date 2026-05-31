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
        question: "방장 승인 전에 취소하면?",
        answer: "보증금이 즉시 환급됩니다.",
    },
    {
        question: "방장 승인 후 취소하면?",
        answer: "취소가 불가하며, 보증금은 Lock 처리됩니다.",
    },
    {
        question: "인증을 못하면?",
        answer: "해당 일 지분율이 낮아집니다. 전액 몰수는 없습니다.",
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
