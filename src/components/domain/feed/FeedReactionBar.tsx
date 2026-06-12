"use client";

import { useCallback, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { SmilePlus } from 'lucide-react';

import type { ReactionCounts, ReactionResponse } from '@/types/domain';
import { ERROR_CODE } from '@/types/common';
import type { ErrorResponse } from '@/types/common';
import { addReaction, removeReaction } from '@/services/feed';
import { EmojiPickerSheet } from '@/components/common/EmojiPickerSheet';
import { Toast } from '@/components/common/Toast';

interface FeedReactionBarProps {
  /** 리액션 대상 인증 로그 id */
  missionLogId: number;
  /** emoji token → count 맵 (모든 인증 상태에 채워짐) */
  reactionCounts: ReactionCounts;
  /** 내가 누른 emoji token 목록 */
  myReactions: string[];
  /** 인증 로그가 더 이상 존재하지 않을 때(MISSION_LOG_NOT_FOUND) 상위에 알린다(목록에서 제거용). */
  onMissingLog?: () => void;
}

export function FeedReactionBar({
  missionLogId,
  reactionCounts,
  myReactions,
  onMissingLog,
}: FeedReactionBarProps) {
  // 리액션 표시 상태는 마운트 시 prop으로 초기화. API 응답 형태(counts map + mine 배열)를
  // 그대로 들고 있어 서버 응답으로의 동기화가 단순하다.
  // 아이템(mission_log_id) 변경 시 상위에서 key로 remount하므로 prop→state 동기화가 필요 없다.
  const [counts, setCounts] = useState<ReactionCounts>(() => reactionCounts ?? {});
  const [mine, setMine] = useState<string[]>(() => myReactions ?? []);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);

  // 같은 이모지에 대한 추가/삭제 요청이 겹치지 않도록 emoji 단위로 in-flight를 잠근다.
  const inFlightRef = useRef<Set<string>>(new Set());
  // 아이템 단위로 네트워크 요청을 직렬화한다. 서로 다른 이모지를 동시에 눌러도 응답이
  // 발신 순서대로 반영되어, 늦게 도착한 오래된 응답이 최신 상태를 덮어쓰는 race를 막는다.
  const requestQueueRef = useRef<Promise<void>>(Promise.resolve());

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setIsToastOpen(true);
  }, []);

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

  const toggleReaction = (emoji: string) => {
    if (inFlightRef.current.has(emoji)) return;
    const isActive = mine.includes(emoji);
    const dir: 1 | -1 = isActive ? -1 : 1;

    // 낙관적 업데이트는 즉시 반영(응답성), 실제 네트워크 요청은 직렬 큐에 태운다.
    applyDelta(emoji, dir);
    inFlightRef.current.add(emoji);
    const run = async () => {
      try {
        // 삭제 시 이미 없는 리액션이어도 서버는 200 + 현재 상태를 응답하므로 동기화로 자연 처리된다.
        const res = isActive
          ? await removeReaction(missionLogId, emoji)
          : await addReaction(missionLogId, emoji);
        syncFromResponse(res.data);
      } catch (err) {
        // 실패 시 적용한 델타를 그대로 되돌린다(롤백).
        applyDelta(emoji, dir === 1 ? -1 : 1);
        const code = isAxiosError<ErrorResponse>(err) ? err.response?.data?.code : undefined;
        if (code === ERROR_CODE.MISSION_LOG_NOT_FOUND) {
          // 인증 로그가 사라짐 → 상위에 알려 목록에서 제거한다. 안내 토스트는 상위(페이지)에서
          // 띄운다. 제거 즉시 이 컴포넌트가 언마운트되어 로컬 토스트는 보이지 않기 때문.
          onMissingLog?.();
        } else if (code === ERROR_CODE.REACTION_NOT_ALLOWED) {
          showToast('이 인증에는 리액션을 남길 수 없어요.');
        } else if (code === ERROR_CODE.INVALID_REACTION_TYPE) {
          showToast('사용할 수 없는 이모지예요.');
        } else {
          showToast('리액션 처리에 실패했어요. 잠시 후 다시 시도해주세요.');
        }
      } finally {
        inFlightRef.current.delete(emoji);
      }
    };
    // 직전 요청이 끝난 뒤 실행(성공·실패 모두 다음으로 진행).
    requestQueueRef.current = requestQueueRef.current.then(run, run);
  };

  const handleSelectEmoji = (emoji: string) => {
    // 피커 선택도 토글과 동일 의미: 이미 누른 이모지면 삭제, 아니면 추가.
    toggleReaction(emoji);
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
            onClick={() => toggleReaction(emoji)}
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

      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />
    </div>
  );
}
