"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Megaphone } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { Toast } from "@/components/common/Toast";
import type { ToastType } from "@/components/common/Toast";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { getCrewNoticeDetail, updateCrewNotice } from "@/services/crew";
import type { CrewNotice } from "@/types/domain";

const isValidDraft = (data: any): data is { title: string; content: string; savedAt: number } => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.title === "string" &&
    typeof data.content === "string" &&
    typeof data.savedAt === "number"
  );
};

const getRelativeTimeString = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};

export default function HostNoticeEditPage() {
  const router = useRouter();
  const params = useParams<{ crewId: string; noticeId: string }>();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const crewId = parseRouteNumber(params.crewId);
  const noticeId = parseRouteNumber(params.noticeId);

  const [notice, setNotice] = useState<CrewNotice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTitleReady = title.trim().length > 0;

  // 임시 저장 복원 상태
  const [draftToRestore, setDraftToRestore] = useState<{
    title: string;
    content: string;
    savedAt: number;
  } | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const preventSaveRef = useRef(true);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (crewId === null || noticeId === null) return;
    getCrewNoticeDetail(crewId, noticeId)
      .then((res) => {
        setNotice(res.data);
        const stored = localStorage.getItem(`temp_notice_edit_draft_${crewId}_${noticeId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (isValidDraft(parsed)) {
              setDraftToRestore(parsed);
              setIsRestoreModalOpen(true);
            } else {
              setTitle(res.data.title);
              setContent(res.data.content);
              preventSaveRef.current = false;
            }
          } catch {
            setTitle(res.data.title);
            setContent(res.data.content);
            preventSaveRef.current = false;
          }
        } else {
          setTitle(res.data.title);
          setContent(res.data.content);
          preventSaveRef.current = false;
        }
        isInitialLoadRef.current = false;
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [crewId, noticeId]);

  // 실시간 디바운스 임시 저장
  useEffect(() => {
    if (crewId === null || noticeId === null) return;
    if (preventSaveRef.current || isInitialLoadRef.current) return;

    const isSameAsOriginal = notice && 
      title === notice.title && 
      content === notice.content;
    
    if (isSameAsOriginal) {
      localStorage.removeItem(`temp_notice_edit_draft_${crewId}_${noticeId}`);
      return;
    }

    const handler = setTimeout(() => {
      const draft = {
        title,
        content,
        savedAt: Date.now()
      };
      localStorage.setItem(`temp_notice_edit_draft_${crewId}_${noticeId}`, JSON.stringify(draft));
    }, 1000);

    return () => clearTimeout(handler);
  }, [title, content, crewId, noticeId, notice]);

  const handleRestoreConfirm = () => {
    if (draftToRestore) {
      setTitle(draftToRestore.title);
      setContent(draftToRestore.content);
    }
    preventSaveRef.current = false;
    setIsRestoreModalOpen(false);
  };

  const handleRestoreCancel = () => {
    if (crewId !== null && noticeId !== null) {
      localStorage.removeItem(`temp_notice_edit_draft_${crewId}_${noticeId}`);
    }
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
    }
    preventSaveRef.current = false;
    setIsRestoreModalOpen(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (crewId === null || !notice) return;
    if (!isTitleReady) {
      setToastMessage("제목을 작성해주세요");
      setToastType("warning");
      setIsToastOpen(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await updateCrewNotice(crewId, notice.notice_id, {
        title: title.trim(),
        content: content.trim(),
        is_important: false,
      });
      
      localStorage.removeItem(`temp_notice_edit_draft_${crewId}_${noticeId}`);

      if (from === "detail") {
        router.push(`/crews/${crewId}/notices/${notice.notice_id}`);
      } else {
        router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}`);
      }
    } catch (error) {
      setToastMessage(
        getApiErrorMessage(
          error,
          {
            VALIDATION_ERROR: "제목·내용 길이를 확인해 주세요.",
            FORBIDDEN_NOT_HOST: "방장만 공지를 수정할 수 있어요.",
            NOTICE_NOT_FOUND: "이미 삭제된 공지예요.",
          },
          "공지 수정에 실패했어요. 잠시 후 다시 시도해 주세요.",
        ),
      );
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (crewId === null || noticeId === null) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
          <Header showBackButton title="공지 수정" />
          <div className="px-5 pt-5">
            <section className="rounded-card bg-card border border-text-secondary/10 shadow-card">
              <EmptyState icon="!" title="수정할 공지를 찾을 수 없어요" />
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
          <Header showBackButton title="공지 수정" />
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
          <Header showBackButton title="공지 수정" />
          <div className="px-5 pt-5">
            <section className="rounded-card bg-card border border-text-secondary/10 shadow-card">
              <EmptyState icon="!" title="수정할 공지를 찾을 수 없어요" />
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header showBackButton title="공지 수정" />

        <form className="px-5 pt-5 flex flex-col gap-4">
          <div className="px-1">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Megaphone size={14} strokeWidth={2.3} className="text-[#5E9B73]" />
              공지를 수정합니다
            </p>
            <label className="block text-[12px] font-bold text-text-primary" htmlFor="notice-title">
              제목
            </label>
            <input
              id="notice-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="공지 제목을 입력해주세요"
              className="mt-2 w-full rounded-xl border border-text-secondary/20 bg-white px-3.5 py-3 text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary/70 focus:border-[#5E9B73]"
            />

            <label className="mt-4 block text-[12px] font-bold text-text-primary" htmlFor="notice-content">
              내용
            </label>
            <textarea
              id="notice-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="크루원에게 전할 내용을 작성하세요"
              rows={10}
              maxLength={65000}
              className="mt-2 w-full resize-none rounded-xl border border-text-secondary/20 bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-text-primary outline-none placeholder:text-text-secondary/70 focus:border-[#5E9B73]"
            />
          </div>

          <div className="mt-1 grid grid-cols-[0.85fr_1.15fr] gap-2">
            <HostActionButton
              variant="cancel"
              onClick={() => {
                if (from === "detail") {
                  router.push(`/crews/${crewId}/notices/${notice.notice_id}`);
                } else {
                  router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}`);
                }
              }}
            >
              취소
            </HostActionButton>
            <HostActionButton
              variant={isTitleReady && !isSubmitting ? "primary" : "primaryDisabled"}
              onClick={() => void handleSubmit()}
            >
              수정 완료
            </HostActionButton>
          </div>
        </form>
        {/* 임시 저장 복원 컨펌 모달 */}
        <ConfirmModal
          isOpen={isRestoreModalOpen}
          onClose={handleRestoreCancel}
          onConfirm={handleRestoreConfirm}
          title="작성 중이던 글을 불러올까요?"
          description={`${
            draftToRestore ? getRelativeTimeString(draftToRestore.savedAt) : "이전"
          }에 작성하던 임시 저장된 수정본이 있습니다. 이어서 작성하시겠습니까?`}
          confirmText="이어 쓰기"
          cancelText="새로 작성"
          confirmVariant="primary-green"
          iconType="warning"
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
