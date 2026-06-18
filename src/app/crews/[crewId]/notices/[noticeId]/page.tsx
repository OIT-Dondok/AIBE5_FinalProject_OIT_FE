'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Send, SmilePlus } from 'lucide-react';

import { EmojiPickerSheet } from '@/components/common/EmojiPickerSheet';
import { EmptyState } from '@/components/common/EmptyState';
import { Header } from '@/components/common/Header';
import { Toast } from '@/components/common/Toast';
import type { ToastType } from '@/components/common/Toast';
import { formatDateMinute } from '@/components/domain/host/hostFormatters';
import { parseRouteNumber } from '@/components/domain/host/hostRouteParams';
import {
  addNoticeReaction,
  createNoticeComment,
  getCrewNoticeDetail,
  getNoticeComments,
  removeNoticeReaction,
} from '@/services/crew';
import type { CrewNotice, NoticeComment, ReactionCounts } from '@/types/domain';

export default function CrewNoticeDetailPage() {
  const [notice, setNotice] = useState<CrewNotice | null>(null);
  const [comments, setComments] = useState<NoticeComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isEmojiSheetOpen, setIsEmojiSheetOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('error');

  const reactionInFlightRef = useRef<Set<string>>(new Set());
  const reactionQueueRef = useRef<Promise<void>>(Promise.resolve());

  const params = useParams<{ crewId: string; noticeId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const noticeId = parseRouteNumber(params.noticeId);

  useEffect(() => {
    if (crewId === null || noticeId === null) return;
    let mounted = true;
    Promise.all([
      getCrewNoticeDetail(crewId, noticeId),
      getNoticeComments(crewId, noticeId),
    ])
      .then(([noticeRes, commentsRes]) => {
        if (!mounted) return;
        setNotice(noticeRes.data);
        setComments(commentsRes.data.items);
      })
      .catch(() => { if (mounted) setHasError(true); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [crewId, noticeId]);

  const showToast = (message: string, type: ToastType = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setIsToastOpen(true);
  };

  const handleReactionClick = (emoji: string) => {
    if (!notice || crewId === null) return;
    const key = `${notice.notice_id}:${emoji}`;
    if (reactionInFlightRef.current.has(key)) return;
    const isReacted = notice.my_reactions.includes(emoji);
    const dir: 1 | -1 = isReacted ? -1 : 1;

    setNotice((prev) => {
      if (!prev) return prev;
      const my_reactions =
        dir === 1
          ? prev.my_reactions.includes(emoji)
            ? prev.my_reactions
            : [...prev.my_reactions, emoji]
          : prev.my_reactions.filter((e) => e !== emoji);
      const reaction_counts: ReactionCounts = { ...prev.reaction_counts };
      const value = (reaction_counts[emoji] ?? 0) + dir;
      if (value <= 0) delete reaction_counts[emoji];
      else reaction_counts[emoji] = value;
      return { ...prev, my_reactions, reaction_counts };
    });

    reactionInFlightRef.current.add(key);
    const noticeId = notice.notice_id;
    const run = async () => {
      try {
        const res = isReacted
          ? await removeNoticeReaction(crewId, noticeId, emoji)
          : await addNoticeReaction(crewId, noticeId, emoji);
        setNotice((prev) =>
          prev
            ? { ...prev, my_reactions: res.data.my_reactions, reaction_counts: res.data.reaction_counts }
            : prev,
        );
      } catch {
        setNotice((prev) => {
          if (!prev) return prev;
          const my_reactions =
            dir === -1
              ? prev.my_reactions.includes(emoji)
                ? prev.my_reactions
                : [...prev.my_reactions, emoji]
              : prev.my_reactions.filter((e) => e !== emoji);
          const reaction_counts: ReactionCounts = { ...prev.reaction_counts };
          const value = (reaction_counts[emoji] ?? 0) - dir;
          if (value <= 0) delete reaction_counts[emoji];
          else reaction_counts[emoji] = value;
          return { ...prev, my_reactions, reaction_counts };
        });
        showToast('리액션 처리에 실패했어요');
      } finally {
        reactionInFlightRef.current.delete(key);
      }
    };
    reactionQueueRef.current = reactionQueueRef.current.then(run, run);
  };

  const handleCommentSubmit = async () => {
    const content = commentInput.trim();
    if (!content || crewId === null || noticeId === null || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const res = await createNoticeComment(crewId, noticeId, { content });
      setComments((prev) => [...prev, res.data]);
      setCommentInput('');
    } catch {
      showToast('댓글 등록에 실패했어요');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (crewId === null || noticeId === null) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
          <Header showBackButton title="공지 상세" />
          <div className="px-5 pt-5">
            <EmptyState icon="!" title="공지 내용을 찾을 수 없어요" />
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
          <Header showBackButton title="공지 상세" />
          <div className="px-5 pt-5 flex flex-col gap-4 animate-pulse">
            <div className="h-6 w-2/3 bg-text-secondary/10 rounded-full" />
            <div className="h-4 w-1/3 bg-text-secondary/10 rounded-full" />
            <div className="h-24 w-full bg-text-secondary/10 rounded-card" />
          </div>
        </div>
      </main>
    );
  }

  if (hasError || !notice) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
          <Header showBackButton title="공지 상세" />
          <div className="px-5 pt-5">
            <EmptyState icon="!" title="공지 내용을 찾을 수 없어요" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header showBackButton title="공지 상세" />

        <div className="px-5 pt-5 flex flex-col gap-4">
          <article className="px-1 py-1">
            <h1 className="text-lg font-extrabold leading-snug text-text-primary">{notice.title}</h1>
            <p className="mt-2 text-xs text-text-secondary">{formatDateMinute(notice.created_at)}</p>
            <p className="mt-4 text-sm leading-7 text-text-primary whitespace-pre-wrap">{notice.content}</p>
          </article>

          <section className="-mt-1 px-1 py-1">
            <div className="flex flex-wrap gap-2">
              {Object.entries(notice.reaction_counts)
                .filter(([, count]) => count > 0)
                .map(([emoji, count]) => {
                  const isReacted = notice.my_reactions.includes(emoji);
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReactionClick(emoji)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-bold transition active:scale-95 ${
                        isReacted
                          ? 'border-[#4D73D9] bg-[#E0E8FA] text-[#4D73D9]'
                          : 'border-text-secondary/15 bg-white text-text-primary'
                      }`}
                    >
                      {emoji} {count}
                    </button>
                  );
                })}
              <button
                type="button"
                aria-label="이모지 추가"
                onClick={() => setIsEmojiSheetOpen(true)}
                className="flex h-8 w-9 items-center justify-center rounded-full border border-text-secondary/15 bg-white text-text-secondary"
              >
                <SmilePlus size={16} strokeWidth={2.2} />
              </button>
            </div>
          </section>

          <div className="h-px bg-text-secondary/10" />

          <section className="px-1 py-1">
            <h2 className="text-sm font-bold text-text-primary">댓글 {comments.length}</h2>

            <div className="mt-3 flex flex-col gap-1">
              {comments.map((comment) => (
                <article key={comment.comment_id} className="py-1">
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-xs font-extrabold text-primary-blue">
                      {comment.nickname.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-text-primary">{comment.nickname}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-text-primary">{comment.content}</p>
                      <p className="mt-0.5 text-[11px] text-text-secondary">{formatDateMinute(comment.created_at)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmittingComment) void handleCommentSubmit();
                }}
                placeholder="댓글을 입력해주세요"
                className="min-w-0 flex-1 rounded-full border border-text-secondary/10 bg-white px-4 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/70 focus:border-[#4C73D9]"
              />
              <button
                type="button"
                aria-label="댓글 등록"
                onClick={() => void handleCommentSubmit()}
                disabled={isSubmittingComment}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4C73D9] text-white shadow-sm transition hover:bg-[#3358BD] active:scale-95 disabled:opacity-50"
              >
                <Send size={17} strokeWidth={1.8} />
              </button>
            </div>
          </section>
        </div>

        <EmojiPickerSheet
          isOpen={isEmojiSheetOpen}
          onClose={() => setIsEmojiSheetOpen(false)}
          onSelect={(emoji) => {
            setIsEmojiSheetOpen(false);
            handleReactionClick(emoji);
          }}
          selectedEmojis={notice.my_reactions}
        />

        <Toast
          message={toastMessage}
          isOpen={isToastOpen}
          type={toastType}
          onClose={() => setIsToastOpen(false)}
        />
      </div>
    </main>
  );
}
