"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { getHostCrewDetail, getHostNotice, updateHostNotice } from "@/mocks/data/host";

export default function HostNoticeEditPage() {
  const router = useRouter();
  const params = useParams<{ crewId: string; noticeId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const noticeId = parseRouteNumber(params.noticeId);
  const notice = crewId !== null && noticeId !== null ? getHostNotice(crewId, noticeId) : null;
  const crewDetail = crewId !== null ? getHostCrewDetail(crewId) : null;
  const [title, setTitle] = useState(notice?.title ?? "");
  const [contentHtml, setContentHtml] = useState(notice?.content_html ?? "");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isTitleReady = title.trim().length > 0;

  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const handleSubmit = () => {
    if (crewId === null || !notice) return;
    if (!isTitleReady) {
      setToastMessage("제목을 작성해주세요");
      return;
    }

    updateHostNotice(crewId, notice.notice_id, {
      title,
      content_html: contentHtml,
    });
    router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}`);
  };

  if (crewId === null || noticeId === null || !notice) {
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
              className="mt-2 w-full resize-none rounded-xl border border-text-secondary/20 bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-text-primary outline-none placeholder:text-text-secondary/70 focus:border-[#4C73D9]"
            />
          </div>

          <div className="grid grid-cols-[0.85fr_1.15fr] gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-[52px] min-h-[52px]"
              onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}`)}
            >
              취소
            </Button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`inline-flex h-[52px] min-h-[52px] items-center justify-center rounded-button text-sm font-extrabold text-white shadow-sm transition-colors active:scale-[0.98] ${
                isTitleReady ? "bg-[#4C73D9] hover:bg-[#3358BD]" : "bg-[#A0B1DF]"
              }`}
            >
              공지 등록
            </button>
          </div>
        </form>
        {toastMessage && (
          <div className="fixed inset-x-0 bottom-6 z-[90] flex justify-center px-5 pointer-events-none">
            <div className="rounded-2xl bg-[#28251F] px-4 py-3 text-[13px] font-extrabold text-white shadow-lg" role="status" aria-live="polite">
              {toastMessage}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
