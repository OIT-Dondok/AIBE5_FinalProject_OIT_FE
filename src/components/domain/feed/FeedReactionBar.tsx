"use client";

import { useRef, useState } from 'react';
import { SmilePlus } from 'lucide-react';

import type { ReactionCounts, ReactionResponse } from '@/types/domain';
import { addReaction, removeReaction } from '@/services/feed';
import { EmojiPickerSheet } from '@/components/common/EmojiPickerSheet';

interface FeedReactionBarProps {
  /** 리액션 대상 인증 로그 id */
  missionLogId: number;
  /** emoji token → count 맵 (모든 인증 상태에 채워짐) */
  reactionCounts: ReactionCounts;
  /** 내가 누른 emoji token 목록 */
  myReactions: string[];
}

export function FeedReactionBar({ missionLogId, reactionCounts, myReactions }: FeedReactionBarProps) {
  // 리액션 표시 상태는 마운트 시 prop으로 초기화. API 응답 형태(counts map + mine 배열)를
  // 그대로 들고 있어 서버 응답으로의 동기화가 단순하다.
  // 아이템(mission_log_id) 변경 시 상위에서 key로 remount하므로 prop→state 동기화가 필요 없다.
  const [counts, setCounts] = useState<ReactionCounts>(() => reactionCounts ?? {});
  const [mine, setMine] = useState<string[]>(() => myReactions ?? []);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // 같은 이모지에 대한 추가/삭제 요청이 겹치지 않도록 emoji 단위로 in-flight를 잠근다.
  const inFlightRef = useRef<Set<string>>(new Set());

  // dir=+1 추가, dir=-1 삭제. count가 0 이하가 되면 칩을 제거한다(서버 truth와 동일).
  const applyDelta = (emoji: string, dir: 1 | -1) => {
    setMine((prev) =>
      dir === 1
        ? prev.includes(emoji)
          ? prev
          : [...prev, emoji]
        : prev.filter((e) => e !== emoji),
    );
    setCounts((prev) => {
      const next = { ...prev };
      const value = (next[emoji] ?? 0) + dir;
      if (value <= 0) delete next[emoji];
      else next[emoji] = value;
      return next;
    });
  };

  // 서버 응답으로 최종 상태를 덮어쓴다(추가/삭제 후 정합성 보장).
  const syncFromResponse = (data: ReactionResponse) => {
    setCounts(data.reaction_counts ?? {});
    setMine(data.my_reactions ?? []);
  };

  const toggleReaction = async (emoji: string) => {
    if (inFlightRef.current.has(emoji)) return;
    const isActive = mine.includes(emoji);
    const dir: 1 | -1 = isActive ? -1 : 1;

    // 낙관적 업데이트
    applyDelta(emoji, dir);
    inFlightRef.current.add(emoji);
    try {
      const res = isActive
        ? await removeReaction(missionLogId, emoji)
        : await addReaction(missionLogId, emoji);
      syncFromResponse(res.data);
    } catch {
      // 실패 시 적용한 델타를 그대로 되돌린다(롤백).
      // TODO(Step 3): 에러코드별 안내(REACTION_NOT_ALLOWED / INVALID_REACTION_TYPE / MISSION_LOG_NOT_FOUND)
      applyDelta(emoji, dir === 1 ? -1 : 1);
    } finally {
      inFlightRef.current.delete(emoji);
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    // 피커 선택도 토글과 동일 의미: 이미 누른 이모지면 삭제, 아니면 추가.
    void toggleReaction(emoji);
  };

  const chips = Object.entries(counts);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {chips.map(([emoji, count]) => {
        const isActive = mine.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => void toggleReaction(emoji)}
            aria-pressed={isActive}
            aria-label={`${emoji} 반응 ${count}개`}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
              isActive
                ? 'bg-primary-green/15 border border-primary-green/40 text-primary-green'
                : 'bg-background border border-text-secondary/15 text-text-primary hover:bg-text-secondary/5'
            }`}
          >
            <span>{emoji}</span>
            <span className={isActive ? 'font-bold text-primary-green' : 'text-text-secondary'}>
              {count}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        aria-label="이모지 추가"
        aria-haspopup="dialog"
        aria-expanded={isPickerOpen}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
          isPickerOpen
            ? 'bg-primary-green/10 border border-primary-green/30 text-primary-green'
            : 'bg-background border border-text-secondary/15 text-text-secondary hover:bg-text-secondary/5'
        }`}
      >
        <SmilePlus size={14} />
        이모지
      </button>

      <EmojiPickerSheet
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectEmoji}
        selectedEmojis={mine}
      />
    </div>
  );
}