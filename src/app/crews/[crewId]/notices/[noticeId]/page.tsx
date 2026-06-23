"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { SmilePlus, Pencil, Trash2 } from "lucide-react";

import { EmojiPickerSheet } from "@/components/common/EmojiPickerSheet";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostBadge } from "@/components/common/HostBadge";
import { Toast } from "@/components/common/Toast";
import type { ToastType } from "@/components/common/Toast";
import { HostConfirmDialog } from "@/components/domain/host/common/HostConfirmDialog";
import { HostMoreMenu } from "@/components/domain/host/common/HostMoreMenu";
import {
  addNoticeReaction,
  getCrewNoticeDetail,
  removeNoticeReaction,
  getCrew,
  deleteCrewNotice,
} from "@/services/crew";
import { getMemberProfile } from "@/services/member";
import { useAuthStore } from "@/store/authStore";
import { NoticeCommentSection } from "@/components/domain/crew/NoticeCommentSection";
import type { CrewNotice, CrewDetail, MemberPublicProfile } from "@/types/domain";
import { formatKstDateTime } from "@/utils/date";

// 숫자 ID 파싱 헬퍼
const parseRouteNumber = (val: string | string[] | undefined): number | null => {
  if (typeof val !== "string") return null;
  const num = parseInt(val, 10);
  return isNaN(num) ? null : num;
};

export default function NoticeDetailPage() {
  const [notice, setNotice] = useState<CrewNotice | null>(null);
  const [crew, setCrew] = useState<CrewDetail | null>(null);
  const [hostProfile, setHostProfile] = useState<MemberPublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isEmojiSheetOpen, setIsEmojiSheetOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNoticeMenuOpen, setIsNoticeMenuOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");

  const user = useAuthStore((s) => s.user);
  const deleteNavTimerRef = useRef<number | null>(null);

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
        router.push('/feed?tab=notice');
      }, 2000);
    } catch {
      setToastMessage("공지 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const router = useRouter();
  const params = useParams<{ crewId: string; noticeId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const noticeId = parseRouteNumber(params.noticeId);

  const handleBack = useCallback(() => {
    router.push('/feed?tab=notice');
  }, [router]);

  useEffect(() => {
    if (crewId === null || noticeId === null) return;

    let mounted = true;

    Promise.all([
      getCrewNoticeDetail(crewId, noticeId),
      getCrew(crewId),
    ])
      .then(async ([noticeRes, crewRes]) => {
        if (!mounted) return;
        setNotice(noticeRes.data);
        setCrew(crewRes.data);

        // 방장의 프로필 정보 추가 로드
        try {
          const profileRes = await getMemberProfile(crewRes.data.host_member_uuid);
          if (mounted) {
            setHostProfile(profileRes.data);
          }
        } catch {
          // 방장 프로필 로드 실패 시 무시하고 진행
        }
      })
      .catch(() => {
        if (mounted) setHasError(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [crewId, noticeId]);

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
      setToastType("error");
      setIsToastOpen(true);
    }
  };


  if (crewId === null || noticeId === null) {
    return (
      <main className="min-h-screen w-full overflow-x-clip bg-transparent flex flex-col items-center">
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
      <main className="min-h-screen w-full overflow-x-clip bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
          <Header
            showBackButton
            title="공지 상세"
            onBackClick={handleBack}
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

  if (hasError || !notice || !crew) {
    return (
      <main className="min-h-screen w-full overflow-x-clip bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
          <Header
            showBackButton
            title="공지 상세"
            onBackClick={handleBack}
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

  // 작성자 정보 매핑 (BE가 공지 작성자 닉네임을 응답에 제공)
  const authorName = notice.author_nickname;
  const authorInitial = authorName.slice(0, 1);
  const hostProfileUrl = hostProfile?.profile_image_url;

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header
          showBackButton
          title="공지 상세"
          onBackClick={handleBack}
        />

        <div className="px-5 pt-5 flex flex-col gap-5">
          {/* 공지 상세 본문 카드 프레임 */}
          <section className="rounded-card border shadow-[var(--shadow-card)] p-5 flex flex-col gap-4 bg-card border-text-secondary/10">
            <article className="px-0 py-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-extrabold leading-snug text-text-primary">{notice.title}</h1>
                  <div className="mt-3 flex items-center gap-2.5">
                    {/* 방장 프로필 이미지 연동 및 프로필 페이지 이동 */}
                    <div
                      onClick={() => router.push(`/members/${crew.host_member_uuid}`)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-xs font-extrabold text-primary-green overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      {hostProfileUrl ? (
                        <img
                          src={hostProfileUrl}
                          alt={authorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        authorInitial
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p
                          onClick={() => router.push(`/members/${crew.host_member_uuid}`)}
                          className="text-xs font-extrabold text-text-primary cursor-pointer hover:underline inline-block"
                        >
                          {authorName}
                        </p>
                        <HostBadge label="방장" className="shrink-0" />
                      </div>
                      <p className="mt-0.5 text-xs text-text-secondary">{formatKstDateTime(notice.created_at)}</p>
                    </div>
                  </div>
                </div>

                {notice && user && notice.author_member_uuid === user.member_uuid && (
                  <HostMoreMenu
                    isOpen={isNoticeMenuOpen}
                    onToggle={() => setIsNoticeMenuOpen((current) => !current)}
                    items={[
                      {
                        label: "수정",
                        icon: <Pencil size={16} />,
                        onClick: () => {
                          setIsNoticeMenuOpen(false);
                          router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit?from=detail`);
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
                )}
              </div>

              <p className="mt-4 text-sm leading-7 text-text-primary whitespace-pre-wrap">{notice.content}</p>
            </article>

            {/* 구분선 */}
            <div className="h-px bg-text-secondary/5" />

            {/* 이모지 리액션 영역 */}
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
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                        isReacted
                          ? "border-[#4D73D9] bg-[#E0E8FA] text-[#4D73D9]"
                          : "border-text-secondary/15 bg-card text-text-primary hover:bg-text-secondary/5"
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
                className="flex h-8 w-9 items-center justify-center rounded-full border border-text-secondary/15 bg-card text-text-secondary hover:bg-text-secondary/5 cursor-pointer"
              >
                <SmilePlus size={16} strokeWidth={2.2} />
              </button>
            </div>
          </section>

          {/* 댓글 영역 */}
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
