'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { isAxiosError } from 'axios';
import { Plus, Edit2, Trash2, SmilePlus } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { EmojiPickerSheet } from '@/components/common/EmojiPickerSheet';
import { Toast } from '@/components/common/Toast';
import { useAuthStore } from '@/store/authStore';
import {
  getCrewNotices,
  createCrewNotice,
  updateCrewNotice,
  deleteCrewNotice,
  addNoticeReaction,
  removeNoticeReaction,
} from '@/services/crew';
import type { CrewNotice, ReactionCounts } from '@/types/domain';
import { ERROR_CODE } from '@/types/common';
import type { ErrorResponse } from '@/types/common';

interface CrewNoticeListProps {
  crewId: number;
  hostMemberUuid: string;
}

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
};

export default function CrewNoticeList({ crewId, hostMemberUuid }: CrewNoticeListProps) {
  const user = useAuthStore((s) => s.user);
  const isHost = !!user && user.member_uuid === hostMemberUuid;

  const [notices, setNotices] = useState<CrewNotice[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CrewNotice | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // EmojiPickerSheet: 어느 공지에 대해 열려 있는지 추적
  const [pickerTarget, setPickerTarget] = useState<number | null>(null);

  // 리액션 안내 토스트 (에러코드별 메시지)
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);
  // 같은 공지·이모지에 대한 추가/삭제 요청이 겹치지 않도록 (noticeId:emoji) 단위로 in-flight를 잠근다.
  const reactionInFlightRef = useRef<Set<string>>(new Set());

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setIsToastOpen(true);
  }, []);

  const fetchNotices = useCallback(
    async (cursor?: string) => {
      try {
        const res = await getCrewNotices(crewId, cursor);
        const { items, next_cursor } = res.data;
        // 서버 응답의 my_reactions, reaction_counts를 그대로 초기 상태로 사용
        setNotices((prev) => (cursor ? [...prev, ...items] : items));
        setNextCursor(next_cursor);
      } catch (err) {
        if (
          isAxiosError<ErrorResponse>(err) &&
          err.response?.data?.code === 'CREW_ACCESS_DENIED'
        ) {
          setAccessDenied(true);
        } else {
          setHasError(true);
        }
      }
    },
    [crewId],
  );

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setAccessDenied(false);
    setNotices([]);
    setNextCursor(null);
    fetchNotices().finally(() => setIsLoading(false));
  }, [fetchNotices]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    await fetchNotices(nextCursor);
    setIsLoadingMore(false);
  };

  const openCreateModal = () => {
    setEditTarget(null);
    setFormTitle('');
    setFormContent('');
    setModalOpen(true);
  };

  const openEditModal = (notice: CrewNotice) => {
    setEditTarget(notice);
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setFormTitle('');
    setFormContent('');
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await updateCrewNotice(crewId, editTarget.notice_id, {
          title: formTitle.trim(),
          content: formContent.trim(),
        });
        setNotices((prev) =>
          prev.map((n) =>
            n.notice_id === editTarget.notice_id
              ? { ...n, title: formTitle.trim(), content: formContent.trim() }
              : n,
          ),
        );
      } else {
        await createCrewNotice(crewId, {
          title: formTitle.trim(),
          content: formContent.trim(),
        });
        setNotices([]);
        setNextCursor(null);
        await fetchNotices();
      }
      closeModal();
    } catch {
      // 에러 처리는 axios 인터셉터(toast)가 담당
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noticeId: number) => {
    setIsDeleting(true);
    try {
      await deleteCrewNotice(crewId, noticeId);
      setNotices((prev) => prev.filter((n) => n.notice_id !== noticeId));
      setDeleteTarget(null);
    } catch {
      // 에러 처리는 axios 인터셉터(toast)가 담당
    } finally {
      setIsDeleting(false);
    }
  };

  // 특정 공지의 리액션 상태를 dir만큼 변경(낙관적 업데이트/롤백 공용).
  // dir=+1 추가, dir=-1 삭제. count가 0 이하가 되면 칩을 제거한다(서버 truth와 동일).
  const applyReactionDelta = (noticeId: number, emoji: string, dir: 1 | -1) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.notice_id !== noticeId) return n;
        const my_reactions =
          dir === 1
            ? n.my_reactions.includes(emoji)
              ? n.my_reactions
              : [...n.my_reactions, emoji]
            : n.my_reactions.filter((e) => e !== emoji);
        const reaction_counts: ReactionCounts = { ...n.reaction_counts };
        const value = (reaction_counts[emoji] ?? 0) + dir;
        if (value <= 0) delete reaction_counts[emoji];
        else reaction_counts[emoji] = value;
        return { ...n, my_reactions, reaction_counts };
      }),
    );
  };

  // 서버 응답으로 해당 공지의 리액션 최종 상태를 덮어쓴다.
  const syncNoticeReaction = (
    noticeId: number,
    my_reactions: string[],
    reaction_counts: ReactionCounts,
  ) => {
    setNotices((prev) =>
      prev.map((n) =>
        n.notice_id === noticeId ? { ...n, my_reactions, reaction_counts } : n,
      ),
    );
  };

  const handleReaction = async (noticeId: number, emoji: string) => {
    const notice = notices.find((n) => n.notice_id === noticeId);
    if (!notice) return;
    const key = `${noticeId}:${emoji}`;
    if (reactionInFlightRef.current.has(key)) return;
    const isReacted = notice.my_reactions.includes(emoji);
    const dir: 1 | -1 = isReacted ? -1 : 1;

    // 낙관적 업데이트
    applyReactionDelta(noticeId, emoji, dir);
    reactionInFlightRef.current.add(key);
    try {
      // 삭제 시 이미 없는 리액션이어도 서버는 200 + 현재 상태를 응답하므로 동기화로 자연 처리된다.
      const res = isReacted
        ? await removeNoticeReaction(crewId, noticeId, emoji)
        : await addNoticeReaction(crewId, noticeId, emoji);
      const { my_reactions, reaction_counts } = res.data;
      syncNoticeReaction(noticeId, my_reactions, reaction_counts);
    } catch (err) {
      // 실패 시 적용한 델타를 그대로 되돌린다(롤백).
      applyReactionDelta(noticeId, emoji, dir === 1 ? -1 : 1);
      const code = isAxiosError<ErrorResponse>(err) ? err.response?.data?.code : undefined;
      if (code === ERROR_CODE.REACTION_NOT_ALLOWED) {
        showToast('이 공지에는 리액션을 남길 수 없어요.');
      } else if (code === ERROR_CODE.INVALID_REACTION_TYPE) {
        showToast('사용할 수 없는 이모지예요.');
      } else {
        showToast('리액션 처리에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      reactionInFlightRef.current.delete(key);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-card p-4 flex flex-col gap-2 shadow-[var(--shadow-card)] animate-pulse"
          >
            <div className="h-4 w-2/3 bg-text-secondary/10 rounded-full" />
            <div className="h-3 w-full bg-text-secondary/10 rounded-full" />
            <div className="h-3 w-4/5 bg-text-secondary/10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <p className="text-3xl">🔒</p>
        <p className="text-sm font-semibold text-text-primary">크루 멤버만 볼 수 있습니다</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <p className="text-3xl">⚠️</p>
        <p className="text-sm text-text-secondary">공지를 불러오지 못했습니다</p>
      </div>
    );
  }

  const pickerNotice = notices.find((n) => n.notice_id === pickerTarget) ?? null;

  return (
    <div className="flex flex-col gap-4">
      {isHost && (
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-button border border-dashed border-primary-green text-primary-green text-sm font-semibold hover:bg-primary-green/5 transition-colors"
        >
          <Plus size={16} />
          공지 작성
        </button>
      )}

      {notices.length === 0 && (
        <EmptyState
          icon="📢"
          title="공지사항이 없어요"
          description="방장이 공지를 올리면 여기에 표시됩니다"
        />
      )}

      {notices.map((notice) => (
        <div
          key={notice.notice_id}
          className="bg-card rounded-card p-4 shadow-[var(--shadow-card)] flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-text-primary leading-snug flex-1">
              {notice.title}
            </h3>
            {isHost && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(notice)}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="공지 수정"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(notice.notice_id)}
                  className="p-1 text-text-secondary hover:text-red-500 transition-colors"
                  aria-label="공지 삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 whitespace-pre-wrap">
            {notice.content}
          </p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* 리액션이 있는 이모지 pills — 클릭 시 토글 */}
              {Object.entries(notice.reaction_counts)
                .filter(([, count]) => count > 0)
                .map(([emoji, count]) => {
                  const isReacted = notice.my_reactions.includes(emoji);
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReaction(notice.notice_id, emoji)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                        isReacted
                          ? 'bg-primary-green/10 border-primary-green/30 text-text-primary'
                          : 'bg-transparent border-text-secondary/20 text-text-secondary hover:bg-text-secondary/5'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="font-semibold">{count}</span>
                    </button>
                  );
                })}

              {/* 이모지 추가 버튼 → EmojiPickerSheet 열기 */}
              <button
                type="button"
                onClick={() => setPickerTarget(notice.notice_id)}
                className="flex items-center justify-center w-7 h-7 rounded-full border border-text-secondary/20 text-text-secondary hover:bg-text-secondary/5 transition-colors"
                aria-label="리액션 추가"
              >
                <SmilePlus size={14} />
              </button>
            </div>
            <span className="text-xs text-text-secondary shrink-0">
              {formatDate(notice.created_at)}
            </span>
          </div>
        </div>
      ))}

      {nextCursor && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="w-full py-2.5 text-sm font-semibold text-text-secondary border border-text-secondary/20 rounded-button hover:bg-text-secondary/5 transition-colors disabled:opacity-50"
        >
          {isLoadingMore ? '불러오는 중...' : '더 보기'}
        </button>
      )}

      {/* EmojiPickerSheet — 이미 반응한 이모지는 시각적으로 강조 */}
      <EmojiPickerSheet
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(emoji) => {
          if (pickerTarget !== null) void handleReaction(pickerTarget, emoji);
        }}
        selectedEmojis={pickerNotice?.my_reactions ?? []}
      />

      {/* 리액션 에러 안내 토스트 */}
      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />

      {/* 공지 작성 / 수정 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        ariaLabel={editTarget ? '공지 수정' : '공지 작성'}
      >
        <div className="p-5 flex flex-col gap-4">
          <h2 className="text-base font-bold text-text-primary">
            {editTarget ? '공지 수정' : '새 공지 작성'}
          </h2>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="notice-title"
              className="text-xs font-semibold text-text-secondary"
            >
              제목
            </label>
            <input
              id="notice-title"
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="공지 제목을 입력하세요"
              className="w-full px-3 py-2 text-sm border border-text-secondary/20 rounded-button focus:outline-none focus:border-primary-green bg-transparent text-text-primary placeholder:text-text-secondary/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="notice-content"
              className="text-xs font-semibold text-text-secondary"
            >
              내용
            </label>
            <textarea
              id="notice-content"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="공지 내용을 입력하세요"
              rows={5}
              className="w-full px-3 py-2 text-sm border border-text-secondary/20 rounded-button focus:outline-none focus:border-primary-green bg-transparent text-text-primary placeholder:text-text-secondary/50 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="md" onClick={closeModal} fullWidth>
              취소
            </Button>
            <Button
              variant="primary-green"
              size="md"
              onClick={() => void handleSubmit()}
              isLoading={isSubmitting}
              disabled={!formTitle.trim() || !formContent.trim()}
              fullWidth
            >
              {editTarget ? '수정' : '등록'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 공지 삭제 확인 모달 */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        ariaLabel="공지 삭제 확인"
      >
        <div className="p-5 flex flex-col gap-4">
          <p className="text-base font-bold text-text-primary">공지를 삭제할까요?</p>
          <p className="text-sm text-text-secondary">삭제된 공지는 복구할 수 없습니다.</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteTarget(null)}
              fullWidth
            >
              취소
            </Button>
            <Button
              variant="primary-green"
              size="md"
              onClick={() => {
                if (deleteTarget !== null) void handleDelete(deleteTarget);
              }}
              isLoading={isDeleting}
              fullWidth
              className="!bg-red-500 hover:!opacity-90 shadow-red-500/20"
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
