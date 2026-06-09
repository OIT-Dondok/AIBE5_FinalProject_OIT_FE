"use client";

import { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode; // 모달 내부에 들어갈 모든 UI (뼈대 속 내용물)
    className?: string;  // 모달 창의 너비나 패딩을 조정하기 위한 탈출구
    backdropClassName?: string; // 배경 딤 스타일 조정
    ariaLabel?: string;  // 📌 스크린 리더용 모달 이름 (웹 접근성 강화)
}

export const Modal = ({
                          isOpen,
                          onClose,
                          children,
                          className = "",
                          backdropClassName = "bg-black/40 backdrop-blur-sm",
                          ariaLabel = "Modal Dialog", // 📌 기본 접근성 네임 제공
                      }: ModalProps) => {
    // 모달이 열리기 전, 기존 body의 overflow 스타일 상태를 기억할 저장소
    const previousOverflow = useRef<string>("");

    // 스크롤 잠금 디테일
    useEffect(() => {
        if (isOpen) {
            previousOverflow.current = document.body.style.overflow;
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = previousOverflow.current;
        }

        return () => {
            document.body.style.overflow = previousOverflow.current;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        // 전역 고정 레이어
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">

            {/* 1. 배경 암전 (Dim Layer): 배경 클릭 시 닫기 기능 포함 */}
            <div
                className={`absolute inset-0 animate-in fade-in duration-200 ${backdropClassName}`}
                onClick={onClose}
            />

            {/* 2. 모달 뼈대 본체: 📌 role, aria 속성을 추가하여 접근성 검문소 통과 */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
                className={`
                    relative z-10 w-full max-w-[360px] 
                    bg-card rounded-card shadow-xl 
                    animate-in zoom-in-95 duration-200
                    ${className}
                `}
            >
                {children}
            </div>
        </div>
    );
};
