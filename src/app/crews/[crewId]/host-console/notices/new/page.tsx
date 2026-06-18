"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Megaphone } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { Toast } from "@/components/common/Toast";
import type { ToastType } from "@/components/common/Toast";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { createCrewNotice, getCrew } from "@/services/crew";

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
  const [crewName, setCrewName] = useState<string | null>(null);
  const isTitleReady = title.trim().length > 0;

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
      await createCrewNotice(crewId, { title, content: contentHtml.trim() });
      if (from === "feed") {
        router.push("/feed?tab=notice");
      } else {
        router.push(`/crews/${crewId}/host-console?tab=notices`);
      }
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
              variant={isTitleReady && !isSubmitting ? "primary" : "primaryDisabled"}
              onClick={() => void handleSubmit()}
            >
              공지 등록
            </HostActionButton>
          </div>
        </form>
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
