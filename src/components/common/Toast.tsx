"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
    message: string;
    isOpen: boolean;
    onClose: () => void;
    duration?: number; // 토스트가 유지될 시간 (기본 2.5초)
}

export const Toast = ({ message, isOpen, onClose, duration = 2500 }: ToastProps) => {

    useEffect(() => {
        if (!isOpen) return;

        // 지정된 시간이 지나면 자동으로 닫히는 타이머 활성화
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    return (
        /* 📌 바텀 네비게이션(z-50)과 모달(z-100) 사이에서
          유저의 시선을 가장 부드럽게 사로잡을 z-[90] 레이어 배치
        */
        <div className="fixed bottom-24 left-0 right-0 z-[90] flex justify-center px-4 pointer-events-none">
            <div className="
        w-full max-w-[380px]
        bg-neutral-900/90 backdrop-blur-sm
        text-white px-4 py-3 rounded-button
        flex items-center gap-2.5 shadow-lg
        pointer-events-auto
        /* 밑에서 위로 스르륵 튀어 오르는 부드러운 애니메이션 */
        animate-in slide-in-from-bottom-4 fade-in duration-300
      ">
                {/* 미션 성공의 느낌을 살린 초록색 체크 아이콘 */}
                <CheckCircle2 size={18} className="text-primary-green stroke-[2.5]" />
                <span className="text-xs font-semibold tracking-tight">{message}</span>
            </div>
        </div>
    );
};