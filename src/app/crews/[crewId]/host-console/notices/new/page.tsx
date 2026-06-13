"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { HostToast } from "@/components/domain/host/common/HostToast";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { getHostCrewDetail } from "@/mocks/data/host";
import { createCrewNotice } from "@/services/crew";

export default function HostNoticeNewPage() {
  const router = useRouter();
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const crewDetail = crewId !== null ? getHostCrewDetail(crewId) : null;
  const isTitleReady = title.trim().length > 0;

  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

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
    if (!isTitleReady) {
      setToastMessage("제목을 작성해주세요");
      return;
    }
    setIsSubmitting(true);
    try {
      await createCrewNotice(crewId, { title, content: contentHtml.trim() });
      router.push(`/crews/${crewId}/host-console?tab=notices`);
    } catch {
      setToastMessage("공지 등록에 실패했어요");
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
              <span className="font-extrabold text-text-primary">{crewDetail?.title}</span> 크루에 공지를 올립니다
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
            <HostActionButton variant="cancel" onClick={() => router.push(`/crews/${crewId}/host-console?tab=notices`)}>
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
        {toastMessage && <HostToast message={toastMessage} />}
      </div>
    </main>
  );
}
