"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Megaphone } from "lucide-react";
import type { MyCrew } from "@/types/domain";
import CrewSelectDropdown from "@/components/domain/crew/CrewSelectDropdown";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { Toast } from "@/components/common/Toast";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import type { ToastType } from "@/components/common/Toast";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { createCrewNotice, getMyCrew } from "@/services/crew";

const isValidDraft = (data: unknown): data is { title: string; content: string; savedAt: number } => {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.title === "string" &&
    typeof d.content === "string" &&
    typeof d.savedAt === "number"
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

export default function HostNoticeNewPage() {
  const router = useRouter();
  const params = useParams<{ crewId: string }>();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const crewId = parseRouteNumber(params.crewId);
  
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [hostCrews, setHostCrews] = useState<MyCrew[]>([]);
  const isTitleReady = title.trim().length > 0;

  // 임시 저장 복원 상태
  const [draftToRestore, setDraftToRestore] = useState<{
    title: string;
    content: string;
    savedAt: number;
  } | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const preventSaveRef = useRef(true); // 복원 팝업 처리 전 자동 저장 덮어쓰기 가드

  // 내가 방장인 크루 목록 로드
  useEffect(() => {
    let active = true;
    getMyCrew("HOST")
      .then((res) => {
        if (active) {
          setHostCrews(res.data.items);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // 진입 시 임시 저장 검사
  useEffect(() => {
    if (crewId === null) return;
    // effect 동기 구간에서 setState가 실행되지 않도록 마이크로태스크로 지연 (set-state-in-effect 방지)
    void Promise.resolve().then(() => {
      const stored = localStorage.getItem(`temp_notice_draft_${crewId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (isValidDraft(parsed)) {
            setDraftToRestore(parsed);
            setIsRestoreModalOpen(true);
          } else {
            preventSaveRef.current = false;
          }
        } catch {
          preventSaveRef.current = false;
        }
      } else {
        preventSaveRef.current = false;
      }
    });
  }, [crewId]);

  // 실시간 디바운스 임시 저장
  useEffect(() => {
    if (crewId === null) return;
    if (preventSaveRef.current) return;

    if (!title.trim() && !contentHtml.trim()) {
      localStorage.removeItem(`temp_notice_draft_${crewId}`);
      return;
    }

    const handler = setTimeout(() => {
      const draft = {
        title,
        content: contentHtml,
        savedAt: Date.now()
      };
      localStorage.setItem(`temp_notice_draft_${crewId}`, JSON.stringify(draft));
    }, 1000);

    return () => clearTimeout(handler);
  }, [title, contentHtml, crewId]);

  const handleRestoreConfirm = () => {
    if (draftToRestore) {
      setTitle(draftToRestore.title);
      setContentHtml(draftToRestore.content);
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

  if (crewId === null) {
    return (
      <main className="min-h-screen w-full overflow-x-clip bg-transparent flex flex-col items-center">
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
      await createCrewNotice(crewId, { title, content: contentHtml.trim(), is_important: false });
      
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
    <main className="min-h-screen w-full overflow-x-clip bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header showBackButton title="공지 작성" />

        <form className="px-5 pt-5 flex flex-col gap-4">
          <div className="px-1">
            {hostCrews.length > 0 && (
              <div className="mb-4">
                <label className="block text-[12px] font-bold text-text-primary mb-1.5 flex items-center gap-1.5" htmlFor="crew-select-dropdown-btn">
                  <Megaphone size={14} strokeWidth={2.3} className="text-[#5E9B73]" />
                  공지를 등록할 크루 선택
                </label>
                <CrewSelectDropdown
                  value={crewId}
                  options={hostCrews}
                  onChange={(newCrewId) => {
                    router.replace(`/crews/${newCrewId}/host-console/notices/new?from=${from || ''}`);
                  }}
                />
              </div>
            )}

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
              value={contentHtml}
              onChange={(event) => setContentHtml(event.target.value)}
              placeholder="크루원에게 전할 내용을 작성하세요"
              rows={10}
              maxLength={65000}
              className="mt-2 w-full resize-none rounded-xl border border-text-secondary/20 bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-text-primary outline-none placeholder:text-text-secondary/70 focus:border-[#5E9B73]"
            />
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
        <ConfirmModal
          isOpen={isSuccessModalOpen}
          onClose={handleSuccessModalClose}
          onConfirm={handleSuccessModalClose}
          title="공지가 등록되었습니다!"
          description="크루원들에게 소식이 전파됩니다."
          confirmText="확인"
          confirmVariant="primary-green"
          iconType="success"
          showCancel={false}
        />

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
