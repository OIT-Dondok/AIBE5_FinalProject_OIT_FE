"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Megaphone } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { Toast } from "@/components/common/Toast";
import { Modal } from "@/components/common/Modal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import type { ToastType } from "@/components/common/Toast";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { createCrewNotice, getCrew } from "@/services/crew";

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

export default function HostNoticeNewPage() {
  const router = useRouter();
  const params = useParams<{ crewId: string }>();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const crewId = parseRouteNumber(params.crewId);
  
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [crewName, setCrewName] = useState<string | null>(null);
  const isTitleReady = title.trim().length > 0;

  // 임시 저장 복원 상태
  const [draftToRestore, setDraftToRestore] = useState<{
    title: string;
    content: string;
    isImportant: boolean;
    savedAt: number;
  } | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const preventSaveRef = useRef(true); // 복원 팝업 처리 전 자동 저장 덮어쓰기 가드

  // 진입 시 임시 저장 검사
  useEffect(() => {
    if (crewId === null) return;
    const stored = localStorage.getItem(`temp_notice_draft_${crewId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDraftToRestore(parsed);
        setIsRestoreModalOpen(true);
      } catch {
        preventSaveRef.current = false;
      }
    } else {
      preventSaveRef.current = false;
    }
  }, [crewId]);

  // 실시간 디바운스 임시 저장
  useEffect(() => {
    if (crewId === null) return;
    if (preventSaveRef.current) return;

    if (!title.trim() && !contentHtml.trim() && !isImportant) {
      localStorage.removeItem(`temp_notice_draft_${crewId}`);
      return;
    }

    const handler = setTimeout(() => {
      const draft = {
        title,
        content: contentHtml,
        isImportant,
        savedAt: Date.now()
      };
      localStorage.setItem(`temp_notice_draft_${crewId}`, JSON.stringify(draft));
    }, 1000);

    return () => clearTimeout(handler);
  }, [title, contentHtml, isImportant, crewId]);

  const handleRestoreConfirm = () => {
    if (draftToRestore) {
      setTitle(draftToRestore.title);
      setContentHtml(draftToRestore.content);
      setIsImportant(draftToRestore.isImportant);
    }
    preventSaveRef.current = false;
    setIsRestoreModalOpen(false);
  };

  const handleRestoreCancel = () => {
    if (crewId !== null) {
      localStorage.removeItem(`temp_notice_draft_${crewId}`);
    }
    preventSaveRef.current = false;
    setIsRestoreModalOpen(false);
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    if (from === "feed") {
      router.push("/feed?tab=notice");
    } else {
      router.push(`/crews/${crewId}/host-console?tab=notices`);
    }
  };

  useEffect(() => {
    if (crewId === null) return;
    getCrew(crewId).then((res) => setCrewName(res.data.title)).catch(() => {});
  }, [crewId]);

  if (crewId === null) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
          <Header showBackButton title="공지 작성" />
          <div className="px-5 pt-5">
            <section className="rounded-card bg-card border border-text-secondary/10 shadow-card">
              <EmptyState icon="!" title="공지 작성 화면을 열 수 없어요" />
            </section>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!isTitleReady) {
      setToastMessage("제목을 작성해주세요");
      setToastType("warning");
      setIsToastOpen(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await createCrewNotice(crewId, { title, content: contentHtml.trim(), is_important: isImportant });
      
      // 임시 저장 제거
      localStorage.removeItem(`temp_notice_draft_${crewId}`);
      
      // 자주 사용하는 크루 목록 갱신
      try {
        const stored = localStorage.getItem("frequent_notice_crew_ids");
        let frequentIds: number[] = stored ? JSON.parse(stored) : [];
        frequentIds = frequentIds.filter((id) => id !== crewId);
        frequentIds.unshift(crewId);
        frequentIds = frequentIds.slice(0, 5);
        localStorage.setItem("frequent_notice_crew_ids", JSON.stringify(frequentIds));
      } catch {}

      setIsSuccessModalOpen(true);
    } catch (error) {
      setToastMessage(
        getApiErrorMessage(
          error,
          {
            VALIDATION_ERROR: "제목·내용 길이를 확인해 주세요.",
            FORBIDDEN_NOT_HOST: "방장만 공지를 작성할 수 있어요.",
            CREW_NOT_FOUND: "크루를 찾을 수 없어요.",
          },
          "공지 등록에 실패했어요. 잠시 후 다시 시도해 주세요.",
        ),
      );
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header showBackButton title="공지 작성" />

        <form className="px-5 pt-5 flex flex-col gap-4">
          <div className="px-1">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Megaphone size={14} strokeWidth={2.3} className="text-[#4C73D9]" />
              {crewName && <span className="font-extrabold text-text-primary">{crewName}</span>}{crewName ? " 크루에 공지를 올립니다" : "공지를 올립니다"}
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
              className="mt-2 w-full rounded-xl border border-text-secondary/20 bg-white px-3.5 py-3 text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary/70 focus:border-[#4C73D9]"
            />

            <label className="mt-4 block text-[12px] font-bold text-text-primary" htmlFor="notice-content">
              내용
            </label>
            <textarea
              id="notice-content"
              value={contentHtml}
              onChange={(event) => setContentHtml(event.target.value)}
              placeholder="크루원에게 전할 내용을 작성하세요"
              rows={10}
              maxLength={65000}
              className="mt-2 w-full resize-none rounded-xl border border-text-secondary/20 bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-text-primary outline-none placeholder:text-text-secondary/70 focus:border-[#4C73D9]"
            />

            <div className="mt-4 flex items-center justify-between rounded-xl border border-text-secondary/10 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-text-primary">📌 중요 공지로 고정</span>
                <span className="text-[10px] text-text-secondary">피드 최상단에 필독 공지로 고정됩니다.</span>
              </div>
              <input
                type="checkbox"
                id="is-important"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="h-5 w-5 rounded border-text-secondary/30 text-primary-green focus:ring-primary-green cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-[0.85fr_1.15fr] gap-2">
            <HostActionButton
              variant="cancel"
              onClick={() => {
                if (from === "feed") {
                  router.push("/feed?tab=notice");
                } else {
                  router.push(`/crews/${crewId}/host-console?tab=notices`);
                }
              }}
            >
              취소
            </HostActionButton>
            <HostActionButton
              variant={isTitleReady && !isSubmitting ? "approve" : "approveDisabled"}
              onClick={() => void handleSubmit()}
            >
              공지 등록
            </HostActionButton>
          </div>
        </form>

        {/* 공지 등록 성공 모달 */}
        <Modal 
          isOpen={isSuccessModalOpen} 
          onClose={handleSuccessModalClose}
          className="bg-primary-green text-white border-none p-0 overflow-hidden max-w-[320px]"
          ariaLabel="공지 등록 완료"
        >
          <div className="relative p-6 py-8 overflow-hidden rounded-card">
            <div className="absolute inset-[8px] rounded-2xl border-2 border-dashed border-white/30 pointer-events-none" />

            <div className="relative flex flex-col items-center gap-4 text-center">
              <span className="text-4xl leading-none">🙌</span>
              <div className="flex flex-col gap-1.5">
                <p className="text-lg font-bold text-white">공지가 등록되었습니다!</p>
                <p className="text-sm text-white/75 leading-snug">크루원들에게 소식이 전파됩니다.</p>
              </div>
              <button
                type="button"
                onClick={handleSuccessModalClose}
                className="mt-1 w-full py-2.5 rounded-xl bg-white/20 text-sm font-semibold text-white hover:bg-white/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </Modal>

        {/* 임시 저장 복원 컨펌 모달 */}
        <ConfirmModal
          isOpen={isRestoreModalOpen}
          onClose={handleRestoreCancel}
          onConfirm={handleRestoreConfirm}
          title="작성 중이던 글을 불러올까요?"
          description={`${
            draftToRestore ? getRelativeTimeString(draftToRestore.savedAt) : "이전"
          }에 작성하던 임시 저장된 글이 있습니다. 이어서 작성하시겠습니까?`}
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
