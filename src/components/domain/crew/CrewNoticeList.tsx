'use client';

import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
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
import type { ErrorResponse } from '@/types/common';

const PRESET_REACTIONS = ['👍', '❤️', '😊', '🔥', '👏'];

interface NoticeState extends CrewNotice {
  my_reactions: string[];
  reaction_counts: ReactionCounts;
}

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

  const [notices, setNotices] = useState<NoticeState[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NoticeState | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotices = useCallback(
    async (cursor?: string) => {
      try {
        const res = await getCrewNotices(crewId, cursor);
        const { items, next_cursor } = res.data;
        const withReactions: NoticeState[] = items.map((n) => ({
          ...n,
          my_reactions: [],
          reaction_counts: {},
        }));
        setNotices((prev) => (cursor ? [...prev, ...withReactions] : withReactions));
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

  const openEditModal = (notice: NoticeState) => {
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

  const handleReaction = async (noticeId: number, emoji: string) => {
    const notice = notices.find((n) => n.notice_id === noticeId);
    if (!notice) return;
    const isReacted = notice.my_reactions.includes(emoji);
    try {
      const res = isReacted
        ? await removeNoticeReaction(crewId, noticeId, emoji)
        : await addNoticeReaction(crewId, noticeId, emoji);
      const { my_reactions, reaction_counts } = res.data;
      setNotices((prev) =>
        prev.map((n) =>
          n.notice_id === noticeId ? { ...n, my_reactions, reaction_counts } : n,
        ),
      );
    } catch {
      // 에러 처리는 axios 인터셉터(toast)가 담당
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
              {PRESET_REACTIONS.map((emoji) => {
                const count = notice.reaction_counts[emoji] ?? 0;
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
                    {count > 0 && <span className="font-semibold">{count}</span>}
                  </button>
                );
              })}
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
