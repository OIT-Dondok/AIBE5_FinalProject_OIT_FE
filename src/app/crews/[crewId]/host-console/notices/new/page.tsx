"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/common/Button";
import { Header } from "@/components/common/Header";
import { createHostNotice } from "@/mocks/data/host";

export default function HostNoticeNewPage() {
  const router = useRouter();
  const params = useParams<{ crewId: string }>();
  const crewId = Number(params.crewId);
  const [title, setTitle] = useState("이번 주 인증 기준 안내");
  const [contentHtml, setContentHtml] = useState(
    "<p>사진에는 <strong>오늘 읽은 페이지</strong>와 날짜가 함께 보이도록 촬영해주세요.</p><ul><li>페이지 번호가 보이면 좋아요.</li><li>인증 기준이 맞지 않으면 방장 검토에서 거절될 수 있습니다.</li></ul>",
  );

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
          <section className="rounded-card bg-card border border-text-secondary/10 shadow-card px-4 py-4">
            <label className="block text-[12px] font-bold text-text-secondary" htmlFor="notice-title">
              제목
            </label>
            <input
              id="notice-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="공지 제목을 입력해주세요"
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

          <section className="rounded-card bg-card border border-text-secondary/10 px-4 py-4">
            <h2 className="text-sm font-bold text-text-primary">게시글 기능</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-text-secondary">
              <div className="rounded-xl bg-background px-3 py-3">댓글 허용</div>
              <div className="rounded-xl bg-background px-3 py-3">이모지 반응 허용</div>
            </div>
          </section>

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
