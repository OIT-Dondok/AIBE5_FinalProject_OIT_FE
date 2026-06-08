"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { Modal } from "@/components/common/Modal";
import { formatDate, formatDateTime, formatTime } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { deleteHostNotice, getHostNotice, getHostNoticeComments } from "@/mocks/data/host";

const sanitizeNoticeHtml = (html: string) => {
  const sanitizer = DOMPurify as unknown as { sanitize?: (value: string) => string };
  return typeof sanitizer.sanitize === "function" ? sanitizer.sanitize(html) : html;
};

export default function HostNoticeDetailPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams<{ crewId: string; noticeId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const noticeId = parseRouteNumber(params.noticeId);
  const notice = crewId !== null && noticeId !== null ? getHostNotice(crewId, noticeId) : null;
  const comments = crewId !== null && noticeId !== null ? getHostNoticeComments(crewId, noticeId) : [];

  const handleDeleteNotice = () => {
    if (crewId === null || noticeId === null) return;
    deleteHostNotice(crewId, noticeId);
    setIsDeleteModalOpen(false);
    router.push(`/crews/${crewId}/host-console`);
  };

  if (crewId === null || noticeId === null || !notice) {
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

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-8">
        <Header showBackButton title="공지 상세" />

        <div className="px-5 pt-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 py-1">
            <button
              type="button"
              onClick={() => router.push(`/crews/${crewId}/host-console`)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E7E1D3] bg-card px-3 text-xs font-extrabold text-text-primary transition-colors hover:bg-[#F5F0E6]"
            >
              <ArrowLeft size={15} strokeWidth={2.6} />
              목록으로
            </button>
            <button
              type="button"
              onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#4C73D9] px-3.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-[#3F63C3]"
            >
              <Pencil size={14} strokeWidth={2.6} />
              수정
            </button>
          </div>

          <article className="rounded-card bg-card border border-[#E7E1D3] shadow-sm px-4 py-4">
            <div className="border-b border-[#F1ECE0] pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg font-extrabold leading-snug text-text-primary">{notice.title}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-text-secondary">
                    <span className="inline-flex items-center rounded-full bg-[#F5F0E6] px-2.5 py-1 text-[#777777]">
                      작성자 방장
                    </span>
                    <span>
                      {formatDate(notice.created_at)} · {formatTime(notice.created_at)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="shrink-0 rounded-xl bg-[#FCEDEC] px-3 py-2 text-xs font-extrabold text-[#DB5C55] transition-colors hover:bg-[#F8DEDC]"
                >
                  삭제
                </button>
              </div>
            </div>

            <div
              className="mt-5 rounded-xl bg-[#FAFCFF] px-3.5 py-4 text-sm font-medium leading-7 text-text-primary [&_a]:text-primary-blue [&_a]:underline [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc [&_strong]:font-extrabold"
              dangerouslySetInnerHTML={{ __html: sanitizeNoticeHtml(notice.content_html) }}
            />
          </article>

          <section className="rounded-card bg-card border border-text-secondary/10 px-4 py-4">
            <h2 className="text-sm font-bold text-text-primary">이모지 반응</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(notice.reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-full border border-text-secondary/15 bg-background px-3 py-1.5 text-sm font-bold text-text-primary"
                >
                  {emoji} {count}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-card bg-card border border-text-secondary/10 px-4 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary">댓글 {comments.length}</h2>
              <span className="text-[11px] font-semibold text-text-secondary">mock</span>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {comments.map((comment) => (
                <article key={comment.comment_id} className="rounded-xl bg-background px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-text-primary">{comment.nickname}</p>
                    <p className="shrink-0 text-[11px] text-text-secondary">{formatDateTime(comment.created_at)}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-primary">{comment.content}</p>
                </article>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="댓글을 입력해주세요"
                className="min-w-0 flex-1 rounded-xl border border-text-secondary/20 bg-background px-3 py-2.5 text-xs text-text-primary outline-none focus:border-primary-green"
              />
              <Button type="button" variant="primary-green" size="sm">
                등록
              </Button>
            </div>
          </section>
        </div>

        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} ariaLabel="공지 삭제 확인">
          <div className="px-5 py-5">
            <h2 className="text-base font-extrabold text-text-primary">공지를 삭제할까요?</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">삭제한 공지는 되돌릴 수 없습니다.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                취소
              </Button>
              <Button type="button" variant="primary-green" onClick={handleDeleteNotice}>
                삭제하기
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}
