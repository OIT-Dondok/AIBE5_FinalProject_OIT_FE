"use client";

import { useEffect, useRef, useState } from 'react';

import type { FeedReaction } from '@/mocks/data/feed';

const PRESET_EMOJIS = ['👍', '🔥', '💪', '🎉', '😂'] as const;

interface FeedReactionBarProps {
  initialReactions: FeedReaction[];
}

export function FeedReactionBar({ initialReactions }: FeedReactionBarProps) {
  const [reactions, setReactions] = useState<FeedReaction[]>(initialReactions);
  const [activated, setActivated] = useState<Set<string>>(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReactions(initialReactions);
    setActivated(new Set());
  }, [initialReactions]);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  const handleReactionClick = (emoji: string) => {
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

  const handleAddEmoji = (emoji: string) => {
    setShowPicker(false);
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
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
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

      <div className="relative" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
            showPicker
              ? 'bg-primary-green/10 border border-primary-green/30 text-primary-green'
              : 'bg-background border border-text-secondary/15 text-text-secondary hover:bg-text-secondary/5'
          }`}
        >
          + 이모지
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-card rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(34,34,34,0.14)] p-2 flex gap-1 z-50">
            {PRESET_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl rounded-xl hover:bg-text-secondary/10 active:scale-90 transition-all"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
