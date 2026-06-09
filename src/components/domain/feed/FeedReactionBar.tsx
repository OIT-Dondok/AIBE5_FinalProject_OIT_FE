"use client";

import { useRef, useState } from 'react';
import { SmilePlus } from 'lucide-react';

import type { FeedReaction } from '@/mocks/data/feed';
import { EmojiPicker } from '@/components/domain/feed/EmojiPicker';

interface FeedReactionBarProps {
  initialReactions: FeedReaction[];
}

export function FeedReactionBar({ initialReactions }: FeedReactionBarProps) {
  const [reactions, setReactions] = useState<FeedReaction[]>(initialReactions);
  const [activated, setActivated] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [prevInitial, setPrevInitial] = useState(initialReactions);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // initialReactions(prop)가 바뀌면 로컬 상태를 동기화 (effect 없이 렌더 중 처리)
  if (prevInitial !== initialReactions) {
    setPrevInitial(initialReactions);
    setReactions(initialReactions);
    setActivated(new Set());
  }

  const handleReactionClick = (emoji: string) => {
    // TODO: API - 리액션 토글 반영 (추가 POST /feeds/{feedId}/reactions, 취소 DELETE)
    const isActive = activated.has(emoji);
    setActivated((prev) => {
      const next = new Set(prev);
      if (isActive) next.delete(emoji);
      else next.add(emoji);
      return next;
    });
    setReactions((prev) =>
      prev.map((r) =>
        r.emoji === emoji
          ? { ...r, count: Math.max(0, r.count + (isActive ? -1 : 1)) }
          : r,
      ),
    );
  };

  const handleSelectEmoji = (emoji: string) => {
    // TODO: API - 새 이모지 반응 추가 (POST /feeds/{feedId}/reactions)
    const exists = reactions.some((r) => r.emoji === emoji);
    if (exists) {
      if (!activated.has(emoji)) handleReactionClick(emoji);
    } else {
      setReactions((prev) => [...prev, { emoji, count: 1 }]);
      setActivated((prev) => {
        const next = new Set(prev);
        next.add(emoji);
        return next;
      });
    }
    setOpen(false); // 선택 즉시 닫기
  };

  const closePicker = () => setOpen(false);

  const togglePicker = () => {
    if (open) {
      setOpen(false);
    } else if (buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
      setOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {reactions.map((reaction) => {
        const isActive = activated.has(reaction.emoji);
        return (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => handleReactionClick(reaction.emoji)}
            aria-pressed={isActive}
            aria-label={`${reaction.emoji} 반응 ${reaction.count}개`}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
              isActive
                ? 'bg-primary-green/15 border border-primary-green/40 text-primary-green'
                : 'bg-background border border-text-secondary/15 text-text-primary hover:bg-text-secondary/5'
            }`}
          >
            <span>{reaction.emoji}</span>
            <span className={isActive ? 'font-bold text-primary-green' : 'text-text-secondary'}>
              {reaction.count}
            </span>
          </button>
        );
      })}

      <button
        ref={buttonRef}
        type="button"
        onClick={togglePicker}
        aria-label="이모지 추가"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
          open
            ? 'bg-primary-green/10 border border-primary-green/30 text-primary-green'
            : 'bg-background border border-text-secondary/15 text-text-secondary hover:bg-text-secondary/5'
        }`}
      >
        <SmilePlus size={14} />
        이모지
      </button>

      {open && anchorRect && (
        <EmojiPicker
          anchorRect={anchorRect}
          triggerRef={buttonRef}
          onSelect={handleSelectEmoji}
          onClose={closePicker}
        />
      )}
    </div>
  );
}