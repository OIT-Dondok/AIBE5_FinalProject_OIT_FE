"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, MessageCircle, Pencil, Smile, Trash2, X } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { HostConfirmDialog } from "@/components/domain/host/common/HostConfirmDialog";
import { HostMoreMenu } from "@/components/domain/host/common/HostMoreMenu";
import { formatDate, formatTime } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { deleteHostNotice, getHostNotices } from "@/mocks/data/host";

export function NoticesTab() {
  const [openMenuNoticeId, setOpenMenuNoticeId] = useState<number | null>(null);
  const [deleteTargetNoticeId, setDeleteTargetNoticeId] = useState<number | null>(null);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
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
    setShowDeleteToast(true);
    window.setTimeout(() => setShowDeleteToast(false), 2400);
    window.setTimeout(() => {
      router.push(`/crews/${crewId}/host-console`);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 py-0">
          <h2 className="text-sm font-bold text-text-primary">
            작성한 공지 <span className="font-extrabold text-[#4d73d9]">{notices.length}</span>
          </h2>
          <HostActionButton
            variant="primary"
            icon={<Pencil size={13} strokeWidth={2.4} />}
            className="!h-14 !min-h-14 shrink-0 px-[18px] !text-[13px]"
            onClick={() => router.push(`/crews/${crewId}/host-console/notices/new`)}
          >
            글쓰기
          </HostActionButton>
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
                <HostMoreMenu
                  isOpen={openMenuNoticeId === notice.notice_id}
                  onToggle={() => setOpenMenuNoticeId((current) => (current === notice.notice_id ? null : notice.notice_id))}
                  alignClassName="right-0 top-10"
                  items={[
                    {
                      label: "수정",
                      icon: <Pencil size={16} />,
                      onClick: () => router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`),
                    },
                    {
                      label: "삭제",
                      icon: <Trash2 size={16} />,
                      tone: "danger",
                      onClick: () => {
                        setDeleteTargetNoticeId(notice.notice_id);
                        setOpenMenuNoticeId(null);
                      },
                    },
                  ]}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-text-secondary">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F0E6] px-2.5 py-1">
                  <MessageCircle size={12} />
                  댓글 {notice.comment_count}
                </span>
                {(() => {
                  const REACTION_LABELS: Record<string, string> = { "확인": "✅" };
                  const sorted = Object.entries(notice.reactions)
                    .filter(([, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a);
                  const top3 = sorted.slice(0, 3);
                  const restCount = sorted.slice(3).reduce((sum, [, count]) => sum + count, 0);

                  return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E0E8FA] px-2.5 py-1 text-[#4d73d9]">
                      {top3.length === 0 ? (
                        <>
                          <Smile size={12} />
                          반응 0
                        </>
                      ) : (
                        <>
                          {top3.map(([emoji, count]) => (
                            <span key={emoji}>{REACTION_LABELS[emoji] ?? emoji}{count}</span>
                          ))}
                          {restCount > 0 && <span>+{restCount}</span>}
                        </>
                      )}
                    </span>
                  );
                })()}
              </div>
            </article>
          ))}
        </div>
      )}

      {showDeleteToast && (
        <div className="fixed inset-x-0 bottom-6 z-[90] flex justify-center px-5 pointer-events-none">
          <div className="flex w-fit items-center gap-2.5 rounded-2xl bg-[#28251F] px-4 py-3 text-white shadow-lg" role="status" aria-live="polite">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DB5C55] text-white">
              <X size={13} strokeWidth={3} />
            </span>
            <span className="text-[13px] font-extrabold">게시글이 삭제되었습니다</span>
          </div>
        </div>
      )}

      {deleteTargetNoticeId !== null && (
        <HostConfirmDialog
          title="공지를 삭제할까요?"
          description={
            <>
              삭제한 공지는 되돌릴 수 없습니다.
              <br />
              댓글과 이모지 반응도 함께 사라집니다.
            </>
          }
          icon={<Trash2 size={21} strokeWidth={2.6} />}
          tone="danger"
          confirmLabel="삭제"
          onCancel={() => setDeleteTargetNoticeId(null)}
          onConfirm={handleDeleteNotice}
        />
      )}
    </div>
  );
}
