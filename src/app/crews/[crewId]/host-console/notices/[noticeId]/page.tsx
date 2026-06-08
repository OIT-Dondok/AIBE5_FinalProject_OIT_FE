"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { HostBadge } from "@/components/common/HostBadge";
import { Modal } from "@/components/common/Modal";
import { formatDateTime } from "@/components/domain/host/hostFormatters";
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
          <article className="px-1 py-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold leading-snug text-text-primary">{notice.title}</h1>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-xs font-extrabold text-primary-blue">
                    방
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold text-text-primary">방장</p>
                      <HostBadge compact className="shrink-0" />
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">작성 {formatDateTime(notice.created_at)}</p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`)}
                >
                  수정
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                  삭제
                </Button>
              </div>
            </div>

            <div
              className="mt-5 text-sm leading-7 text-text-primary [&_a]:text-primary-blue [&_a]:underline [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: sanitizeNoticeHtml(notice.content_html) }}
            />
          </article>

          <section className="px-1 py-1">
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

          <section className="px-1 py-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary">댓글 {comments.length}</h2>
              <span className="text-[11px] font-semibold text-text-secondary">mock</span>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {comments.map((comment) => (
                <article key={comment.comment_id} className="border-t border-text-secondary/10 py-3">
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-xs font-extrabold text-primary-blue">
                      {comment.nickname.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold text-text-primary">{comment.nickname}</p>
                        <p className="shrink-0 text-[11px] text-text-secondary">{formatDateTime(comment.created_at)}</p>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-text-primary">{comment.content}</p>
                    </div>
                  </div>
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
