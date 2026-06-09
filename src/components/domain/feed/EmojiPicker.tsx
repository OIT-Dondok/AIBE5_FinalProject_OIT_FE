"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface EmojiCategory {
  id: string;
  icon: string;
  label: string;
  emojis: readonly string[];
}

const EMOJI_CATEGORIES: readonly EmojiCategory[] = [
  {
    id: 'smileys',
    icon: '😀',
    label: '얼굴',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
      '😊', '🙂', '😉', '😍', '🥰', '😘', '😎', '🤩',
      '🥳', '🤗', '🤔', '😴', '😭', '😡', '😱', '🥹',
    ],
  },
  {
    id: 'people',
    icon: '🧑',
    label: '사람/동물',
    emojis: [
      '👍', '👎', '👏', '🙌', '🙏', '💪', '🤝', '👋',
      '✌️', '🤟', '🫶', '🧑', '👶', '🐶', '🐱', '🐰',
      '🦁', '🐻', '🐼', '🐧', '🐢', '🦄', '🐝', '🦋',
    ],
  },
  {
    id: 'celebration',
    icon: '🎉',
    label: '축하/물건',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '💯',
      '✨', '⭐', '🌟', '💡', '📱', '💻', '⌚', '📷',
      '🔑', '💰', '📚', '✏️', '📌', '🔔', '🎵', '🎮',
    ],
  },
  {
    id: 'food',
    icon: '🍔',
    label: '음식/식물',
    emojis: [
      '🍔', '🍕', '🍟', '🌭', '🍙', '🍜', '🍣', '🍰',
      '🍩', '🍪', '🍎', '🍓', '🍌', '🥑', '🥗', '🥦',
      '🌶️', '☕', '🍺', '🌷', '🌹', '🌻', '🌲', '🍀',
    ],
  },
  {
    id: 'travel',
    icon: '🚗',
    label: '교통/장소',
    emojis: [
      '🚗', '🚕', '🚌', '🚲', '🛵', '✈️', '🚀', '🚂',
      '🚢', '🏠', '🏢', '🏫', '🏥', '🗼', '🗽', '🏖️',
      '⛰️', '🌋', '🏝️', '🌍', '🌙', '☀️', '⛅', '🌈',
    ],
  },
  {
    id: 'symbols',
    icon: '❤️',
    label: '기호',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '💔', '💕', '💖', '💗', '💞', '✅', '❌', '❗',
      '❓', '💢', '💥', '💦', '🔥', '⚡', '⭐', '➕',
    ],
  },
] as const;

interface EmojiPickerProps {
  /** 팝오버 기준이 되는 버튼의 위치 */
  anchorRect: DOMRect;
  /** 바깥 클릭 감지에서 제외할 트리거 버튼 (토글 동작 보장) */
  triggerRef?: React.RefObject<HTMLElement | null>;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const PICKER_WIDTH = 280;
const GAP = 8;
const MARGIN = 8;
/** page.tsx의 모바일 컨테이너 폭(max-w-[430px])과 동일하게 유지 */
const MOBILE_MAX_WIDTH = 430;

export function EmojiPicker({ anchorRect, triggerRef, onSelect, onClose }: EmojiPickerProps) {
  const [activeId, setActiveId] = useState(EMOJI_CATEGORIES[0].id);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeCategory =
    EMOJI_CATEGORIES.find((c) => c.id === activeId) ?? EMOJI_CATEGORIES[0];

  useEffect(() => {
    const handlePointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return; // 트리거 버튼은 토글로 처리
      onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose, triggerRef]);

  // 위치는 "열 때 한 번만" 페이지 좌표로 계산해 고정.
  // anchorRect만 의존 → 카테고리 탭 클릭(re-render)에는 재계산 안 함.
  // absolute라 이후 스크롤은 페이지와 함께 자연스럽게 이동.
  const position = useMemo(() => {
    if (typeof window === 'undefined') return null;

    // 모바일 컨테이너(최대 430px, 가운데 정렬) 경계 안으로 팝오버를 가둠
    const containerWidth = Math.min(window.innerWidth, MOBILE_MAX_WIDTH);
    const containerLeft = (window.innerWidth - containerWidth) / 2;
    const containerRight = containerLeft + containerWidth;
    const width = Math.min(PICKER_WIDTH, containerWidth - MARGIN * 2);

    // 버튼 왼쪽에 맞추되, 컨테이너 좌우 경계를 넘지 않게 clamp
    const minLeft = containerLeft + MARGIN;
    const maxLeft = containerRight - MARGIN - width;
    const left = Math.min(Math.max(anchorRect.left, minLeft), maxLeft);

    return {
      top: anchorRect.top + window.scrollY,
      left: left + window.scrollX,
      width,
    };
  }, [anchorRect]);

  if (!position) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="이모지 선택"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        // translateY(-100%)로 버튼 위쪽에 띄움(팝오버 높이를 몰라도 됨)
        transform: `translateY(calc(-100% - ${GAP}px))`,
      }}
      className="z-40 bg-card rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(34,34,34,0.18)] overflow-hidden"
    >
      {/* 카테고리 탭 */}
      <div className="flex items-center gap-0.5 px-1.5 py-1.5 border-b border-text-secondary/10">
        {EMOJI_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-label={category.label}
            aria-pressed={activeId === category.id}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setActiveId(category.id)}
            className={`flex-1 flex items-center justify-center h-9 rounded-lg text-lg transition-colors ${
              activeId === category.id
                ? 'bg-primary-green/12'
                : 'hover:bg-text-secondary/8'
            }`}
          >
            {category.icon}
          </button>
        ))}
      </div>

      {/* 이모지 그리드 */}
      <div className="grid grid-cols-8 gap-0.5 p-2 max-h-[200px] overflow-y-auto">
        {activeCategory.emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`${emoji} 반응 추가`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(emoji)}
            className="aspect-square flex items-center justify-center text-xl rounded-lg hover:bg-text-secondary/10 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}