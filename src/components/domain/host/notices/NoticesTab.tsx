"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, MessageCircle, MoreHorizontal, Pencil, Plus, Smile, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { formatDate, formatTime } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { deleteHostNotice, getHostNotices } from "@/mocks/data/host";

export function NoticesTab() {
  const [openMenuNoticeId, setOpenMenuNoticeId] = useState<number | null>(null);
  const [deleteTargetNoticeId, setDeleteTargetNoticeId] = useState<number | null>(null);
  const params = useParams<{ crewId: string }>();
  const router = useRouter();
  const crewId = parseRouteNumber(params.crewId);

  if (crewId === null) {
    return (
      <SectionCard>
        <EmptyState icon={<FileText size={44} className="text-primary-green" />} title="공지 목록을 불러올 수 없어요" />
      </SectionCard>
    );
  }

  const notices = getHostNotices(crewId);

  const handleDeleteNotice = () => {
    if (deleteTargetNoticeId === null) return;
    deleteHostNotice(crewId, deleteTargetNoticeId);
    setDeleteTargetNoticeId(null);
    setOpenMenuNoticeId(null);
    router.push(`/crews/${crewId}/host-console`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 py-1">
          <h2 className="text-sm font-bold text-text-primary">
            작성한 공지 <span className="font-extrabold text-[#4d73d9]">{notices.length}</span>
          </h2>
          <button
            type="button"
            onClick={() => router.push(`/crews/${crewId}/host-console/notices/new`)}
            className="inline-flex h-[52px] min-h-[52px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#4C73D9] px-4 text-base font-extrabold text-white shadow-sm transition-colors hover:bg-[#3F63C3]"
          >
            <Plus size={16} strokeWidth={2.8} />
            글쓰기
          </button>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-text-secondary/10 bg-card px-4 py-5 text-center shadow-sm">
          <div className="mb-1.5 flex items-center justify-center text-[#4d73d9]">
            <FileText size={22} strokeWidth={2.5} />
          </div>
          <p className="text-[13px] font-medium text-text-secondary">등록된 공지가 없어요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notices.map((notice) => (
            <article
              key={notice.notice_id}
              className="relative rounded-card border border-[#E7E1D3] bg-card px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <h3 className="truncate text-sm font-extrabold text-text-primary">{notice.title}</h3>
                  <p className="mt-1 text-xs font-medium text-text-secondary">
                    {formatDate(notice.created_at)} · {formatTime(notice.created_at)}
                  </p>
                  <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-text-secondary">
                    {notice.content}
                  </p>
                </button>
                <button
                  type="button"
                  aria-label="공지 메뉴 열기"
                  onClick={() =>
                    setOpenMenuNoticeId((current) => (current === notice.notice_id ? null : notice.notice_id))
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-[#EBE7DD]/70 active:scale-95"
                >
                  <MoreHorizontal size={20} strokeWidth={2.4} />
                </button>
                {openMenuNoticeId === notice.notice_id && (
                  <div className="absolute right-4 top-12 z-20 w-36 overflow-hidden rounded-xl border border-text-secondary/10 bg-white shadow-[0_8px_20px_rgba(40,37,31,0.12)]">
                    <button
                      type="button"
                      onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`)}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-[#FAF7EE]"
                    >
                      <Pencil size={16} />
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTargetNoticeId(notice.notice_id);
                        setOpenMenuNoticeId(null);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-[#DB5C55] transition hover:bg-[#FCEDEC]"
                    >
                      <Trash2 size={16} />
                      삭제
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-text-secondary">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F0E6] px-2.5 py-1">
                  <MessageCircle size={12} />
                  댓글 {notice.comment_count}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E0E8FA] px-2.5 py-1 text-[#4d73d9]">
                  <Smile size={12} />
                  반응 {notice.reaction_count}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteTargetNoticeId !== null}
        onClose={() => setDeleteTargetNoticeId(null)}
        ariaLabel="공지 삭제 확인"
        className="max-w-[340px]"
        backdropClassName="bg-black/40"
      >
        <div className="px-5 py-5">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FCEDEC] text-[#DB5C55]">
            <Trash2 size={21} strokeWidth={2.6} />
          </div>
          <h2 className="mt-3 text-center text-base font-extrabold text-text-primary">공지를 삭제할까요?</h2>
          <p className="mt-2 text-center text-sm font-medium leading-relaxed text-text-secondary">
            삭제한 공지는 되돌릴 수 없습니다.
            <br />
            댓글과 이모지 반응도 함께 사라집니다.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeleteTargetNoticeId(null)}
              className="inline-flex h-[52px] min-h-[52px] items-center justify-center rounded-xl border-2 border-[#EDE8DF] bg-card text-base font-extrabold text-text-primary transition-colors hover:bg-[#EDE8DF]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDeleteNotice}
              className="inline-flex h-[52px] min-h-[52px] items-center justify-center rounded-xl bg-[#DB5C55] text-base font-extrabold text-white transition-colors hover:bg-[#C84D46]"
            >
              삭제
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
