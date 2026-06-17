"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export type ToastType = 'success' | 'error' | 'warning';

/**
 * @interface ToastProps
 * @description Toast 컴포넌트의 props를 정의합니다.
 * @property {string} message - 토스트에 표시될 메시지입니다.
 * @property {boolean} isOpen - 토스트의 열림/닫힘 상태를 제어합니다.
 * @property {() => void} onClose - 토스트가 닫힐 때 호출될 함수입니다.
 * @property {number} [duration=2500] - 토스트가 화면에 표시될 시간 (밀리초)입니다. 기본값은 2500ms (2.5초)입니다.
 * @property {ToastType} [type='success'] - 토스트의 유형입니다. ('success', 'error', 'warning')
 */
interface ToastProps {
    message: string;
    isOpen: boolean;
    onClose: () => void;
    duration?: number; // 토스트가 유지될 시간 (기본 2.5초)
    type?: ToastType;
}

/**
 * @component Toast
 * @description 사용자에게 짧고 휘발성 있는 피드백을 제공하는 토스트 메시지 컴포넌트입니다.
 * 일정 시간 후 자동으로 사라지며, 성공 메시지에 주로 사용됩니다.
 * @param {ToastProps} props - Toast 컴포넌트에 전달되는 속성들입니다.
 * @returns {JSX.Element | null} 토스트 UI를 렌더링하는 React 요소 또는 토스트가 닫혀있을 경우 null
 */
export const Toast = ({ message, isOpen, onClose, duration = 2500, type = 'success' }: ToastProps) => {

    // 토스트의 자동 닫힘 기능을 위한 useEffect 훅
    useEffect(() => {
        if (!isOpen) return;

        // 지정된 시간이 지나면 자동으로 닫히는 타이머 활성화
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const getToastStyle = () => {
        switch (type) {
            case 'error':
                return {
                    bg: 'bg-rose-500/90',
                    icon: <XCircle size={18} className="text-white stroke-[2.5]" />
                };
            case 'warning':
                return {
                    bg: 'bg-neutral-900/90',
                    icon: <AlertCircle size={18} className="text-amber-400 stroke-[2.5]" />
                };
            case 'success':
            default:
                return {
                    bg: 'bg-neutral-900/90',
                    icon: <CheckCircle2 size={18} className="text-primary-green stroke-[2.5]" />
                };
        }
    };

    const { bg, icon } = getToastStyle();

    return (
        /* 📌 바텀 네비게이션(z-50)과 모달(z-100) 사이에서
          유저의 시선을 가장 부드럽게 사로잡을 z-[90] 레이어 배치
        */
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-24 left-0 right-0 z-[90] flex justify-center px-4 pointer-events-none"
        >
            <div className={`
                w-full max-w-[380px]
                ${bg} backdrop-blur-sm
                text-white px-4 py-3 rounded-button
                flex items-center gap-2.5 shadow-lg
                pointer-events-auto
                /* 밑에서 위로 스르륵 튀어 오르는 부드러운 애니메이션 */
                animate-in slide-in-from-bottom-4 fade-in duration-300
            `}>
                {icon}
                <span className="text-xs font-semibold tracking-tight">{message}</span>
            </div>
        </div>
    );
};