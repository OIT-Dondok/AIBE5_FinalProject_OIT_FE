"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode; // 모달 내부에 들어갈 모든 UI (뼈대 속 내용물)
    className?: string;  // 모달 창의 너비나 패딩을 조정하기 위한 탈출구
}

export const Modal = ({ isOpen, onClose, children, className = "" }: ModalProps) => {

    // 모달이 열렸을 때 뒷 배경 스크롤을 막아주는 리드급 디테일
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        // 📌 전역 고정 레이어 (포털 역할을 수행할 배경)
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">

            {/* 1. 배경 암전 (Dim Layer): 배경 클릭 시 닫기 기능 포함 */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* 2. 모달 뼈대 본체: 내용물에 따라 크기가 결정됨 */}
            <div className={`
        relative z-10 w-full max-w-[360px] 
        bg-card rounded-card shadow-xl 
        animate-in zoom-in-95 duration-200
        ${className}
      `}>
                {children}
            </div>
        </div>
    );
};