"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { formatDateTime } from "@/components/domain/host/hostFormatters";
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
      <SectionCard className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-text-primary">공지 관리</h2>
            <p className="mt-1 text-xs text-text-secondary">공지 게시글과 댓글, 반응 현황을 관리합니다.</p>
          </div>
          <Button
            variant="primary-green"
            size="sm"
            onClick={() => router.push(`/crews/${crewId}/host-console/notices/new`)}
          >
            공지 작성
          </Button>
        </div>
      </SectionCard>

      {notices.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<FileText size={44} className="text-primary-green" />} title="등록된 공지가 없어요" />
        </SectionCard>
      ) : (
        <div className="flex flex-col gap-3">
          {notices.map((notice) => (
            <article
              key={notice.notice_id}
              className="relative rounded-2xl border border-text-secondary/10 bg-card px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <h3 className="truncate text-sm font-bold text-text-primary">{notice.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">{notice.content}</p>
                </button>
                <button
                  type="button"
                  aria-label="공지 메뉴 열기"
                  onClick={() =>
                    setOpenMenuNoticeId((current) => (current === notice.notice_id ? null : notice.notice_id))
                  }
                  className="shrink-0 rounded-full p-1 text-text-secondary hover:bg-text-secondary/10"
                >
                  <MoreHorizontal size={18} />
                </button>
                {openMenuNoticeId === notice.notice_id && (
                  <div className="absolute right-4 top-12 z-20 w-28 overflow-hidden rounded-xl border border-text-secondary/10 bg-card shadow-card">
                    <button
                      type="button"
                      onClick={() => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`)}
                      className="block w-full px-3 py-2.5 text-left text-xs font-bold text-text-primary hover:bg-text-secondary/5"
                    >
                      수정하기
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTargetNoticeId(notice.notice_id);
                        setOpenMenuNoticeId(null);
                      }}
                      className="block w-full px-3 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50"
                    >
                      삭제하기
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-text-secondary">
                <span>작성 {formatDateTime(notice.created_at)}</span>
                <span>
                  댓글 {notice.comment_count} · 반응 {notice.reaction_count}
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
      >
        <div className="px-5 py-5">
          <h2 className="text-base font-extrabold text-text-primary">공지를 삭제할까요?</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            삭제한 공지는 목록에서 더 이상 사용할 수 없습니다. 실제 API 연결 전까지는 mock 처리합니다.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteTargetNoticeId(null)}>
              취소
            </Button>
            <Button type="button" variant="primary-green" onClick={handleDeleteNotice}>
              삭제하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
