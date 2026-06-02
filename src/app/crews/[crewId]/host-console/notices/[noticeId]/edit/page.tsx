"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { getHostNotice, updateHostNotice } from "@/mocks/data/host";

export default function HostNoticeEditPage() {
  const router = useRouter();
  const params = useParams<{ crewId: string; noticeId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const noticeId = parseRouteNumber(params.noticeId);
  const notice = crewId !== null && noticeId !== null ? getHostNotice(crewId, noticeId) : null;
  const [title, setTitle] = useState(notice?.title ?? "");
  const [contentHtml, setContentHtml] = useState(notice?.content_html ?? "");

  const handleSubmit = () => {
    if (crewId === null || !notice) return;
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
          <section className="rounded-card bg-card border border-text-secondary/10 shadow-card px-4 py-4">
            <label className="block text-[12px] font-bold text-text-secondary" htmlFor="notice-title">
              제목
            </label>
            <input
              id="notice-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-text-secondary/20 bg-background px-3.5 py-3 text-sm font-semibold text-text-primary outline-none focus:border-primary-green"
            />

            <label className="mt-4 block text-[12px] font-bold text-text-secondary" htmlFor="notice-content">
              본문
            </label>
            <textarea
              id="notice-content"
              value={contentHtml}
              onChange={(event) => setContentHtml(event.target.value)}
              rows={10}
              className="mt-2 w-full resize-none rounded-xl border border-text-secondary/20 bg-background px-3.5 py-3 text-sm leading-relaxed text-text-primary outline-none focus:border-primary-green"
            />
          </section>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}`)}
            >
              취소
            </Button>
            <Button type="button" variant="primary-green" onClick={handleSubmit}>
              수정 완료
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
