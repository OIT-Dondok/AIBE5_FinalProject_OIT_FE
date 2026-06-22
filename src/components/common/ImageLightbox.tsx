"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  /** 확대해서 보여줄 이미지 URL */
  imageUrl: string;
  /** 이미지 대체 텍스트 */
  alt: string;
  /** 닫기 콜백 (배경 클릭 · Esc · 닫기 버튼) */
  onClose: () => void;
}

/**
 * 인증 이미지 확대 라이트박스 (공용).
 * 카드 썸네일(1:1 크롭)과 달리 원본 비율 전체를 표시한다.
 * - object-contain + max-h-[85vh]로 원본 비율 유지
 * - Esc / 배경 클릭 닫기, 배경 스크롤 잠금
 * 운영 콘솔 검증 확대는 헤더·정보 패널이 함께 있는 풀스크린 레이아웃이라
 * 이 컴포넌트를 쓰지 않고 별도로 둔다.
 */
export function ImageLightbox({ imageUrl, alt, onClose }: ImageLightboxProps) {
  // Esc 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="인증 이미지 확대 보기"
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
      >
        <X size={22} />
      </button>

      {/* 확대 이미지 — 카드 썸네일(크롭)과 달리 원본 비율 전체를 표시 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full max-w-full items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 원본 비율 표시를 위해 fill 대신 자연 크기 사용 */}
        <img
          src={imageUrl}
          alt={alt}
          className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
        />
      </div>
    </div>,
    document.body,
  );
}
