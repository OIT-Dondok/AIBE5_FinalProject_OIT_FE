"use client";

import { useState } from 'react';

import { BottomSheet } from '@/components/common/BottomSheet';
import { EMOJI_CATEGORIES } from '@/constants/emojiCategories';

interface EmojiPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  /** 내가 이미 누른 이모지 목록 (시각적 강조 + aria-pressed) */
  selectedEmojis?: string[];
}

/**
 * 하단 바텀시트 방식의 공용 이모지 피커.
 * 6개 카테고리 탭 + 그리드. 이모지 선택 시 onSelect 후 시트를 닫는다.
 * 피드 리액션 / 공지 리액션 등에서 공용으로 사용.
 */
export function EmojiPickerSheet({
  isOpen,
  onClose,
  onSelect,
  selectedEmojis = [],
}: EmojiPickerSheetProps) {
  const [activeId, setActiveId] = useState(EMOJI_CATEGORIES[0].id);
  const activeCategory =
    EMOJI_CATEGORIES.find((c) => c.id === activeId) ?? EMOJI_CATEGORIES[0];
  const selectedSet = new Set(selectedEmojis);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    onClose(); // 고르면 시트 닫힘
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="이모지 추가" ariaLabel="이모지 선택">
      {/* 카테고리 탭 */}
      <div className="flex items-center gap-0.5 px-3 pb-2 border-b border-text-secondary/10">
        {EMOJI_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-label={category.label}
            aria-pressed={activeId === category.id}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setActiveId(category.id)}
            className={`flex-1 flex items-center justify-center h-10 rounded-lg text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
              activeId === category.id ? 'bg-primary-green/12' : 'hover:bg-text-secondary/8'
            }`}
          >
            {category.icon}
          </button>
        ))}
      </div>

      {/* 이모지 그리드 */}
      <div className="grid grid-cols-8 gap-1 px-3 py-3 max-h-[40vh] overflow-y-auto">
        {activeCategory.emojis.map((emoji) => {
          const isSelected = selectedSet.has(emoji);
          return (
            <button
              key={emoji}
              type="button"
              aria-label={`${emoji} 반응${isSelected ? ' 취소' : ' 추가'}`}
              aria-pressed={isSelected}
              onClick={() => handleSelect(emoji)}
              className={`aspect-square flex items-center justify-center text-2xl rounded-lg transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
                isSelected
                  ? 'bg-primary-green/15 ring-1 ring-primary-green/40'
                  : 'hover:bg-text-secondary/10'
              }`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}