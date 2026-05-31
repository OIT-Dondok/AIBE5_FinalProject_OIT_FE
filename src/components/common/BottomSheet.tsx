"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    ariaLabel?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, ariaLabel }: BottomSheetProps) {
    const previousOverflow = useRef<string>("");

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

    // createPortal로 document.body에 직접 마운트:
    // Header의 backdrop-filter가 position:fixed 의 containing block이 되는 버그를 방지합니다.
    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
            {/* 배경 딤 — 전체 화면 덮기 */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* 시트 패널 */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel ?? title ?? "바텀 시트"}
                className="relative z-10 w-full max-w-[430px] bg-card rounded-t-3xl shadow-[var(--shadow-card-elevated)] animate-in slide-in-from-bottom duration-300"
            >
                {/* 드래그 핸들 */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-text-secondary/20" />
                </div>

                {/* 헤더 */}
                {title && (
                    <div className="flex items-center justify-between px-5 py-3 border-b border-text-secondary/[0.08]">
                        <h2 className="text-base font-bold text-text-primary">{title}</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="닫기"
                            className="p-1 -mr-1 hover:opacity-70 active:scale-95 transition-all"
                        >
                            <X size={20} className="text-text-secondary" />
                        </button>
                    </div>
                )}

                <div>{children}</div>
            </div>
        </div>,
        document.body
    );
}
