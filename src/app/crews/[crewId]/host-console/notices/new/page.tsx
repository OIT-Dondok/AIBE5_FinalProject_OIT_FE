"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { createHostNotice, getHostCrewDetail } from "@/mocks/data/host";

export default function HostNoticeNewPage() {
  const router = useRouter();
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const crewDetail = crewId !== null ? getHostCrewDetail(crewId) : null;

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

  const handleSubmit = () => {
    createHostNotice(crewId, {
      title,
      content_html: contentHtml,
    });
    router.push(`/crews/${crewId}/host-console`);
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header showBackButton title="공지 작성" />

        <form className="px-5 pt-5 flex flex-col gap-4">
          <div className="px-1">
            <p className="mb-3 text-xs font-medium text-text-secondary">
              <span className="font-extrabold text-text-primary">{crewDetail?.title}</span> 크루에 공지를 올립니다
            </p>
            <label className="block text-[12px] font-bold text-text-secondary" htmlFor="notice-title">
              제목
            </label>
            <input
              id="notice-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="공지 제목을 입력해주세요"
              className="mt-2 w-full rounded-xl border border-text-secondary/20 bg-white px-3.5 py-3 text-sm font-semibold text-text-primary outline-none focus:border-[#4C73D9]"
            />

            <label className="mt-4 block text-[12px] font-bold text-text-secondary" htmlFor="notice-content">
              본문
            </label>
            <textarea
              id="notice-content"
              value={contentHtml}
              onChange={(event) => setContentHtml(event.target.value)}
              rows={10}
              className="mt-2 w-full resize-none rounded-xl border border-text-secondary/20 bg-white px-3.5 py-3 text-sm leading-relaxed text-text-primary outline-none focus:border-[#4C73D9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(`/crews/${crewId}/host-console`)}>
              취소
            </Button>
            <Button type="button" variant="primary-green" onClick={handleSubmit}>
              공지 등록
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
