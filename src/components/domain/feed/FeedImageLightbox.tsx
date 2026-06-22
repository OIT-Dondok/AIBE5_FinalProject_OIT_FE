"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ImageIcon, X } from 'lucide-react';

import type { FeedItem as FeedItemType } from '@/types/domain';

interface FeedImageLightboxProps {
  item: FeedItemType;
  onClose: () => void;
}

export function FeedImageLightbox({ item, onClose }: FeedImageLightboxProps) {
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
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={`${item.nickname}님의 ${item.crew_name} 인증 이미지`}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        ) : (
          <div className="flex aspect-square w-full max-w-[400px] items-center justify-center rounded-2xl bg-white/10">
            <ImageIcon size={48} strokeWidth={1.5} className="text-white/40" />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}