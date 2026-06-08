"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { MoreHorizontal, Pencil, Send, SmilePlus, Trash2 } from "lucide-react";

import { BottomSheet } from "@/components/common/BottomSheet";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostBadge } from "@/components/common/HostBadge";
import { Modal } from "@/components/common/Modal";
import { formatDateMinute } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { deleteHostNotice, getHostNotice, getHostNoticeComments } from "@/mocks/data/host";
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

const currentProfileName = mockCrewProfile?.nickname ?? "나";
const currentProfileInitial = mockCrewProfile?.initials ?? currentProfileName.slice(0, 1);

export default function HostNoticeDetailPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  const handleDeleteNotice = () => {
    if (crewId === null || noticeId === null) return;
    deleteHostNotice(crewId, noticeId);
    setIsDeleteModalOpen(false);
    router.push(`/crews/${crewId}/host-console`);
  };

  const handleReactionClick = (emoji: string) => {
    const isSelected = selectedReactions.has(emoji);

    setReactions((current) => ({
      ...current,
      [emoji]: Math.max((current[emoji] ?? 0) + (isSelected ? -1 : 1), 0),
    }));
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

    setCommentItems((current) => [
      ...current,
      {
        comment_id: Date.now(),
        crew_id: crewId,
        notice_id: noticeId,
        member_uuid: "mock-current-member",
        nickname: currentProfileName,
        profile_image_url: mockCrewProfile?.avatarImageUrl ?? null,
        content,
        created_at: new Date().toISOString(),
      },
    ]);
    setCommentInput("");
  };

  if (crewId === null || noticeId === null || !notice) {
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
        <Header showBackButton title="공지 상세" />

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
              <div className="relative shrink-0">
                <button
                  type="button"
                  aria-label="공지 메뉴 열기"
                  aria-expanded={isNoticeMenuOpen}
                  onClick={() => setIsNoticeMenuOpen((current) => !current)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-[#EBE7DD]/70 active:scale-95"
                >
                  <MoreHorizontal size={20} strokeWidth={2.4} />
                </button>

                {isNoticeMenuOpen && (
                  <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-xl border border-text-secondary/10 bg-white shadow-[0_8px_20px_rgba(40,37,31,0.12)]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNoticeMenuOpen(false);
                        router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-[#FAF7EE]"
                    >
                      <Pencil size={16} />
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNoticeMenuOpen(false);
                        setIsDeleteModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-[#DB5C55] transition hover:bg-[#FCEDEC]"
                    >
                      <Trash2 size={16} />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              className="mt-5 text-sm leading-7 text-text-primary [&_a]:text-primary-blue [&_a]:underline [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: sanitizeNoticeHtml(notice.content_html) }}
            />
          </article>

          <section className="px-1 py-1">
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

            <div className="mt-3 flex flex-col gap-3">
              {commentItems.map((comment) => (
                <article key={comment.comment_id} className="border-t border-text-secondary/10 py-3">
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-xs font-extrabold text-primary-blue">
                      {comment.nickname.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-text-primary">{comment.nickname}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-text-primary">{comment.content}</p>
                      <p className="mt-1.5 text-[11px] text-text-secondary">{formatDateMinute(comment.created_at)}</p>
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

        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} ariaLabel="공지 삭제 확인">
          <div className="px-5 py-5">
            <h2 className="text-base font-extrabold text-text-primary">공지를 삭제할까요?</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">삭제한 공지는 되돌릴 수 없습니다.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                취소
              </Button>
              <Button type="button" variant="primary-green" onClick={handleDeleteNotice}>
                삭제하기
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}
