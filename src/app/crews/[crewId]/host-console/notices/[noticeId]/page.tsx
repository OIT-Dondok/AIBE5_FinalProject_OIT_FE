"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Send, SmilePlus, Trash2, X } from "lucide-react";

import { EmojiPickerSheet } from "@/components/common/EmojiPickerSheet";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostBadge } from "@/components/common/HostBadge";
import { HostConfirmDialog } from "@/components/domain/host/common/HostConfirmDialog";
import { HostMoreMenu } from "@/components/domain/host/common/HostMoreMenu";
import { HostToast } from "@/components/domain/host/common/HostToast";
import { formatDateMinute } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import {
  addNoticeReaction,
  createNoticeComment,
  deleteCrewNotice,
  getCrewNoticeDetail,
  getNoticeComments,
  removeNoticeReaction,
} from "@/services/crew";
import { useAuthStore } from "@/store/authStore";
import type { CrewNotice, NoticeComment } from "@/types/domain";

export default function HostNoticeDetailPage() {
  const [notice, setNotice] = useState<CrewNotice | null>(null);
  const [comments, setComments] = useState<NoticeComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [isEmojiSheetOpen, setIsEmojiSheetOpen] = useState(false);
  const [isNoticeMenuOpen, setIsNoticeMenuOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const deleteToastTimerRef = useRef<number | null>(null);
  const deleteNavTimerRef = useRef<number | null>(null);
  const router = useRouter();
  const params = useParams<{ crewId: string; noticeId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const noticeId = parseRouteNumber(params.noticeId);
  const user = useAuthStore((s) => s.user);
  const currentProfileName = user?.nickname ?? "나";
  const currentProfileInitial = currentProfileName.slice(0, 1);

  useEffect(() => {
    if (crewId === null || noticeId === null) return;
    Promise.all([
      getCrewNoticeDetail(crewId, noticeId),
      getNoticeComments(crewId, noticeId),
    ])
      .then(([noticeRes, commentsRes]) => {
        setNotice(noticeRes.data);
        setComments(commentsRes.data.items);
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [crewId, noticeId]);

  useEffect(() => {
    return () => {
      if (deleteToastTimerRef.current !== null) clearTimeout(deleteToastTimerRef.current);
      if (deleteNavTimerRef.current !== null) clearTimeout(deleteNavTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timeoutId = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const handleDeleteNotice = async () => {
    if (crewId === null || noticeId === null) return;
    setIsDeleting(true);
    try {
      await deleteCrewNotice(crewId, noticeId);
      setIsDeleteModalOpen(false);
      setShowDeleteToast(true);
      deleteToastTimerRef.current = window.setTimeout(() => setShowDeleteToast(false), 2400);
      deleteNavTimerRef.current = window.setTimeout(() => {
        router.push(`/crews/${crewId}/host-console?tab=notices`);
      }, 2000);
    } catch {
      setToastMessage("공지 삭제에 실패했어요");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactionClick = async (emoji: string) => {
    if (!notice || crewId === null) return;
    const isReacted = notice.my_reactions.includes(emoji);
    try {
      const res = isReacted
        ? await removeNoticeReaction(crewId, notice.notice_id, emoji)
        : await addNoticeReaction(crewId, notice.notice_id, emoji);
      setNotice((prev) =>
        prev
          ? { ...prev, my_reactions: res.data.my_reactions, reaction_counts: res.data.reaction_counts }
          : prev,
      );
    } catch {
      setToastMessage("리액션 처리에 실패했어요");
    }
  };

  const handleCommentSubmit = async () => {
    const content = commentInput.trim();
    if (!content || crewId === null || noticeId === null || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const res = await createNoticeComment(crewId, noticeId, { content });
      setComments((prev) => [...prev, res.data]);
      setCommentInput("");
    } catch {
      setToastMessage("댓글 등록에 실패했어요");
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
            <section className="rounded-card bg-card border border-text-secondary/10 shadow-card">
              <EmptyState icon="!" title="공지 내용을 찾을 수 없어요" />
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
          <Header
            showBackButton
            title="공지 상세"
            onBackClick={() => router.push(`/crews/${crewId}/host-console?tab=notices`)}
          />
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
          <Header
            showBackButton
            title="공지 상세"
            onBackClick={() => router.push(`/crews/${crewId}/host-console?tab=notices`)}
          />
          <div className="px-5 pt-5">
            <section className="rounded-card bg-card border border-text-secondary/10 shadow-card">
              <EmptyState icon="!" title="공지 내용을 찾을 수 없어요" />
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header
          showBackButton
          title="공지 상세"
          onBackClick={() => router.push(`/crews/${crewId}/host-console?tab=notices`)}
        />

        <div className="px-5 pt-5 flex flex-col gap-4">
          <article className="px-1 py-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold leading-snug text-text-primary">{notice.title}</h1>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-xs font-extrabold text-primary-blue">
                    {currentProfileInitial}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold text-text-primary">{currentProfileName}</p>
                      <HostBadge label="방장" className="shrink-0" />
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">{formatDateMinute(notice.created_at)}</p>
                  </div>
                </div>
              </div>
              <HostMoreMenu
                isOpen={isNoticeMenuOpen}
                onToggle={() => setIsNoticeMenuOpen((current) => !current)}
                items={[
                  {
                    label: "수정",
                    icon: <Pencil size={16} />,
                    onClick: () => {
                      setIsNoticeMenuOpen(false);
                      router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`);
                    },
                  },
                  {
                    label: "삭제",
                    icon: <Trash2 size={16} />,
                    tone: "danger",
                    onClick: () => {
                      setIsNoticeMenuOpen(false);
                      setIsDeleteModalOpen(true);
                    },
                  },
                ]}
              />
            </div>

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
                      onClick={() => void handleReactionClick(emoji)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-bold transition active:scale-95 ${
                        isReacted
                          ? "border-[#4D73D9] bg-[#E0E8FA] text-[#4D73D9]"
                          : "border-text-secondary/15 bg-white text-text-primary"
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
                      {comment.author_nickname.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-text-primary">{comment.author_nickname}</p>
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
                onChange={(event) => setCommentInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !isSubmittingComment) {
                    void handleCommentSubmit();
                  }
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
                <Send size={17} strokeWidth={1.8} fill="none" />
              </button>
            </div>
          </section>
        </div>

        <EmojiPickerSheet
          isOpen={isEmojiSheetOpen}
          onClose={() => setIsEmojiSheetOpen(false)}
          onSelect={(emoji) => {
            setIsEmojiSheetOpen(false);
            void handleReactionClick(emoji);
          }}
          selectedEmojis={notice.my_reactions}
        />

        {showDeleteToast && (
          <div className="fixed inset-x-0 bottom-6 z-[90] flex justify-center px-5 pointer-events-none">
            <div
              className="flex w-fit items-center gap-2.5 rounded-2xl bg-[#28251F] px-4 py-3 text-white shadow-lg"
              role="status"
              aria-live="polite"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DB5C55] text-white">
                <X size={13} strokeWidth={3} />
              </span>
              <span className="text-[13px] font-extrabold">게시글이 삭제되었습니다</span>
            </div>
          </div>
        )}

        {toastMessage && <HostToast message={toastMessage} />}

        {isDeleteModalOpen && (
          <HostConfirmDialog
            title="공지를 삭제할까요?"
            description={
              <>
                삭제한 공지는 되돌릴 수 없습니다.
                <br />
                댓글과 이모지 반응도 함께 사라집니다.
              </>
            }
            icon={<Trash2 size={21} strokeWidth={2.6} />}
            tone="danger"
            confirmLabel="삭제"
            onCancel={() => {
              if (!isDeleting) setIsDeleteModalOpen(false);
            }}
            onConfirm={() => void handleDeleteNotice()}
          />
        )}
      </div>
    </main>
  );
}
