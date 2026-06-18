"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, SmilePlus, Trash2 } from "lucide-react";

import { EmojiPickerSheet } from "@/components/common/EmojiPickerSheet";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostBadge } from "@/components/common/HostBadge";
import { HostConfirmDialog } from "@/components/domain/host/common/HostConfirmDialog";
import { HostMoreMenu } from "@/components/domain/host/common/HostMoreMenu";
import { Toast } from "@/components/common/Toast";
import type { ToastType } from "@/components/common/Toast";
import { formatDateMinute } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import {
  addNoticeReaction,
  deleteCrewNotice,
  getCrewNoticeDetail,
  removeNoticeReaction,
} from "@/services/crew";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { useAuthStore } from "@/store/authStore";
import { NoticeCommentSection } from "@/components/domain/crew/NoticeCommentSection";
import type { CrewNotice } from "@/types/domain";

export default function HostNoticeDetailPage() {
  const [notice, setNotice] = useState<CrewNotice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEmojiSheetOpen, setIsEmojiSheetOpen] = useState(false);
  const [isNoticeMenuOpen, setIsNoticeMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
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

    let mounted = true;

    getCrewNoticeDetail(crewId, noticeId)
      .then((noticeRes) => {
        if (mounted) {
          setNotice(noticeRes.data);
        }
      })
      .catch((err) => {
        if (mounted) setHasError(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [crewId, noticeId]);

  useEffect(() => {
    return () => {
      if (deleteNavTimerRef.current !== null) clearTimeout(deleteNavTimerRef.current);
    };
  }, []);

  const handleDeleteNotice = async () => {
    if (crewId === null || noticeId === null) return;
    setIsDeleting(true);
    try {
      await deleteCrewNotice(crewId, noticeId);
      setIsDeleteModalOpen(false);
      setToastMessage("게시글이 삭제되었습니다");
      setToastType("success");
      setIsToastOpen(true);
      deleteNavTimerRef.current = window.setTimeout(() => {
        router.push(`/crews/${crewId}/host-console?tab=notices`);
      }, 2000);
    } catch (error) {
      setToastMessage(
        getApiErrorMessage(
          error,
          {
            FORBIDDEN_NOT_HOST: "방장만 공지를 삭제할 수 있어요.",
            NOTICE_NOT_FOUND: "이미 삭제된 공지예요.",
          },
          "공지 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.",
        ),
      );
      setToastType("error");
      setIsToastOpen(true);
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
    } catch (error) {
      setToastMessage(
        getApiErrorMessage(
          error,
          {
            REACTION_NOT_ALLOWED: "리액션할 수 없는 공지예요.",
            INVALID_REACTION_TYPE: "사용할 수 없는 리액션이에요.",
          },
          "리액션 처리에 실패했어요. 잠시 후 다시 시도해 주세요.",
        ),
      );
      setToastType("error");
      setIsToastOpen(true);
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5E9B73]/10 text-xs font-extrabold text-[#5E9B73]">
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
                          ? "border-[#5E9B73] bg-[#E8F2EB] text-[#5E9B73]"
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

          <NoticeCommentSection crewId={crewId} noticeId={noticeId} />
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

        <Toast
          message={toastMessage}
          isOpen={isToastOpen}
          type={toastType}
          onClose={() => setIsToastOpen(false)}
        />

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
