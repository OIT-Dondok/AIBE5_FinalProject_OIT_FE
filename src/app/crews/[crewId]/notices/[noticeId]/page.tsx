"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { SmilePlus } from "lucide-react";

import { EmojiPickerSheet } from "@/components/common/EmojiPickerSheet";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostBadge } from "@/components/common/HostBadge";
import { Toast } from "@/components/common/Toast";
import type { ToastType } from "@/components/common/Toast";
import {
  addNoticeReaction,
  getCrewNoticeDetail,
  removeNoticeReaction,
  getCrew,
} from "@/services/crew";
import { getMemberProfile } from "@/services/member";
import { useAuthStore } from "@/store/authStore";
import { NoticeCommentSection } from "@/components/domain/crew/NoticeCommentSection";
import type { CrewNotice, CrewDetail, MemberPublicProfile } from "@/types/domain";

// YYYY.MM.DD HH:mm 포맷터
const formatDateTime = (isoString: string) => {
  if (!isoString) return '-';
  let targetStr = isoString.trim();
  const hasTimezone = targetStr.endsWith('Z') || targetStr.includes('+') || /-\d{2}:?\d{2}$/.test(targetStr);
  if (!hasTimezone) {
    if (targetStr.includes(' ')) {
      targetStr = targetStr.replace(' ', 'T');
    }
    targetStr = targetStr + 'Z';
  }
  const date = new Date(targetStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${d} ${hh}:${mm}`;
};

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

  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");

  const router = useRouter();
  const params = useParams<{ crewId: string; noticeId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const noticeId = parseRouteNumber(params.noticeId);
  const user = useAuthStore((s) => s.user);

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
        } catch (profileErr) {
          console.error("방장 프로필 조회 실패:", profileErr);
        }
      })
      .catch((err) => {
        console.error("공지 상세 로드 실패:", err);
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
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
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

  // 작성자 정보 매핑 (공지는 무조건 호스트가 작성하므로 크루 호스트 닉네임 사용)
  const authorName = crew.host_nickname;
  const authorInitial = authorName.slice(0, 1);
  const hostProfileUrl = hostProfile?.profile_image_url;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header
          showBackButton
          title="공지 상세"
          onBackClick={handleBack}
        />

        <div className="px-5 pt-5 flex flex-col gap-5">
          {/* 공지 상세 본문 카드 프레임 */}
          <section className="bg-card rounded-card border border-text-secondary/10 shadow-[var(--shadow-card)] p-5 flex flex-col gap-4">
            <article className="px-0 py-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
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
                      <p className="mt-0.5 text-xs text-text-secondary">{formatDateTime(notice.created_at)}</p>
                    </div>
                  </div>
                </div>
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
      </div>
    </main>
  );
}
