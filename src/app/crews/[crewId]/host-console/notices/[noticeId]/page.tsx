"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { Pencil, Send, SmilePlus, Trash2, X } from "lucide-react";

import { BottomSheet } from "@/components/common/BottomSheet";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostBadge } from "@/components/common/HostBadge";
import { HostConfirmDialog } from "@/components/domain/host/common/HostConfirmDialog";
import { HostMoreMenu } from "@/components/domain/host/common/HostMoreMenu";
import { formatDateMinute } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { addHostNoticeComment, deleteHostNotice, getHostNotice, getHostNoticeComments, type HostNoticeMock, updateHostNoticeReactions } from "@/mocks/data/host";
import { mockCrewProfile } from "@/mocks/data/profile";

const sanitizeNoticeHtml = (html: string) => {
  const sanitizer = DOMPurify as unknown as { sanitize?: (value: string) => string };
  return typeof sanitizer.sanitize === "function" ? sanitizer.sanitize(html) : html;
};

const NOTICE_REACTION_LABELS: Record<string, string> = {
  확인: "✅",
};

const EMOJI_OPTIONS = [
  "😀",
  "😄",
  "😊",
  "😍",
  "🥰",
  "😘",
  "😎",
  "🤩",
  "👍",
  "👏",
  "🙌",
  "💪",
  "🙏",
  "👌",
  "🤝",
  "🫶",
  "✅",
  "🔥",
  "✨",
  "💚",
  "💙",
  "💛",
  "❤️",
  "⭐",
  "🌈",
  "☀️",
  "🌙",
  "📌",
  "📣",
  "🎉",
  "🏆",
  "👑",
];

export default function HostNoticeDetailPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [isEmojiSheetOpen, setIsEmojiSheetOpen] = useState(false);
  const [isNoticeMenuOpen, setIsNoticeMenuOpen] = useState(false);
  const router = useRouter();
  const params = useParams<{ crewId: string; noticeId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const noticeId = parseRouteNumber(params.noticeId);
  const notice = crewId !== null && noticeId !== null ? getHostNotice(crewId, noticeId) : null;
  const comments = crewId !== null && noticeId !== null ? getHostNoticeComments(crewId, noticeId) : [];
  const [commentItems, setCommentItems] = useState(() => comments);
  const [commentInput, setCommentInput] = useState("");
  const [reactions, setReactions] = useState<Record<string, number>>(() =>
    notice ? { ...notice.reactions } : {},
  );
  const [selectedReactions, setSelectedReactions] = useState<Set<string>>(() => new Set());
  const [deletedNoticeSnapshot, setDeletedNoticeSnapshot] = useState<HostNoticeMock | null>(null);
  const currentProfileName = mockCrewProfile?.nickname ?? "나";
  const currentProfileInitial = mockCrewProfile?.initials ?? currentProfileName.slice(0, 1);
  const deleteToastTimerRef = useRef<number | null>(null);
  const deleteNavTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (deleteToastTimerRef.current !== null) clearTimeout(deleteToastTimerRef.current);
      if (deleteNavTimerRef.current !== null) clearTimeout(deleteNavTimerRef.current);
    };
  }, []);

  const handleDeleteNotice = () => {
    if (crewId === null || noticeId === null || !notice) return;
    setDeletedNoticeSnapshot(notice);
    deleteHostNotice(crewId, noticeId);
    setIsDeleteModalOpen(false);
    setShowDeleteToast(true);
    deleteToastTimerRef.current = window.setTimeout(() => {
      setShowDeleteToast(false);
      setDeletedNoticeSnapshot(null);
    }, 2400);
    deleteNavTimerRef.current = window.setTimeout(() => {
      router.push(`/crews/${crewId}/host-console?tab=notices`);
    }, 2000);
  };

  const handleReactionClick = (emoji: string) => {
    const isSelected = selectedReactions.has(emoji);

    setReactions((current) => {
      const nextCount = Math.max((current[emoji] ?? 0) + (isSelected ? -1 : 1), 0);
      const next = { ...current, [emoji]: nextCount };
      if (nextCount === 0) delete next[emoji];
      if (crewId !== null && noticeId !== null) {
        updateHostNoticeReactions(crewId, noticeId, next);
      }
      return next;
    });
    setSelectedReactions((current) => {
      const next = new Set(current);

      if (isSelected) {
        next.delete(emoji);
      } else {
        next.add(emoji);
      }

      return next;
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    handleReactionClick(emoji);
    setIsEmojiSheetOpen(false);
  };

  const handleCommentSubmit = () => {
    const content = commentInput.trim();

    if (!content || crewId === null || noticeId === null) return;

    const newComment = {
      comment_id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
      crew_id: crewId,
      notice_id: noticeId,
      member_uuid: "mock-current-member",
      nickname: currentProfileName,
      content,
      created_at: new Date().toISOString(),
    };

    addHostNoticeComment(newComment);
    setCommentItems((current) => [
      ...current,
      { ...newComment, profile_image_url: mockCrewProfile?.avatarImageUrl ?? null },
    ]);
    setCommentInput("");
  };

  const displayNotice = notice ?? deletedNoticeSnapshot;

  if (crewId === null || noticeId === null || !displayNotice) {
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
                <h1 className="text-lg font-extrabold leading-snug text-text-primary">{displayNotice.title}</h1>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-xs font-extrabold text-primary-blue">
                    {currentProfileInitial}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold text-text-primary">{currentProfileName}</p>
                      <HostBadge label="방장" className="shrink-0" />
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">{formatDateMinute(displayNotice.created_at)}</p>
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
                      router.push(`/crews/${crewId}/host-console/notices/${displayNotice.notice_id}/edit`);
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

            <div
              className="mt-4 text-sm leading-7 text-text-primary [&_a]:text-primary-blue [&_a]:underline [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: sanitizeNoticeHtml(displayNotice.content_html) }}
            />
          </article>

          <section className="-mt-1 px-1 py-1">
            <div className="flex flex-wrap gap-2">
              {Object.entries(reactions).map(([emoji, count]) => {
                const isSelected = selectedReactions.has(emoji);

                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReactionClick(emoji)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-bold transition active:scale-95 ${
                      isSelected
                        ? "border-[#4D73D9] bg-[#E0E8FA] text-[#4D73D9]"
                        : "border-text-secondary/15 bg-white text-text-primary"
                    }`}
                  >
                    {NOTICE_REACTION_LABELS[emoji] ?? emoji} {count}
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary">댓글 {commentItems.length}</h2>
            </div>

            <div className="mt-3 flex flex-col gap-1">
              {commentItems.map((comment) => (
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
                onChange={(event) => setCommentInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleCommentSubmit();
                  }
                }}
                placeholder="댓글을 입력해주세요"
                className="min-w-0 flex-1 rounded-full border border-text-secondary/10 bg-white px-4 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/70 focus:border-[#4C73D9]"
              />
              <button
                type="button"
                aria-label="댓글 등록"
                onClick={handleCommentSubmit}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4C73D9] text-white shadow-sm transition hover:bg-[#3358BD] active:scale-95"
              >
                <Send size={17} strokeWidth={1.8} fill="none" />
              </button>
            </div>
          </section>
        </div>

        <BottomSheet
          isOpen={isEmojiSheetOpen}
          onClose={() => setIsEmojiSheetOpen(false)}
          title="이모지 추가"
          showCloseButton={false}
          showHeaderBorder={false}
          panelClassName="bg-[#F5F0E6]"
          ariaLabel="공지 이모지 추가"
        >
          <div className="px-5 pb-6 pt-1">
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="flex aspect-square items-center justify-center rounded-xl bg-white text-xl shadow-sm transition hover:bg-[#E0E8FA] active:scale-95"
                  aria-label={`${emoji} 이모지 추가`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </BottomSheet>

        {showDeleteToast && (
          <div className="fixed inset-x-0 bottom-6 z-[90] flex justify-center px-5 pointer-events-none">
            <div className="flex w-fit items-center gap-2.5 rounded-2xl bg-[#28251F] px-4 py-3 text-white shadow-lg" role="status" aria-live="polite">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DB5C55] text-white">
                <X size={13} strokeWidth={3} />
              </span>
              <span className="text-[13px] font-extrabold">게시글이 삭제되었습니다</span>
            </div>
          </div>
        )}

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
            onCancel={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteNotice}
          />
        )}
      </div>
    </main>
  );
}
