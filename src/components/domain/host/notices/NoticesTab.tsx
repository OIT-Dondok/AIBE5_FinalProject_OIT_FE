"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, Pencil, Trash2, MessageSquare, ChevronRight, AlertCircle, SmilePlus } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { HostConfirmDialog } from "@/components/domain/host/common/HostConfirmDialog";
import { HostMoreMenu } from "@/components/domain/host/common/HostMoreMenu";
import { Toast } from "@/components/common/Toast";
import type { ToastType } from "@/components/common/Toast";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import {
  deleteCrewNotice,
  getCrewNotices,
  getCrew,
  addNoticeReaction,
  removeNoticeReaction,
  getNoticeComments
} from "@/services/crew";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import type { CrewNotice } from "@/types/domain";
import { formatServerTime, getCrewBrandingColor } from "@/components/domain/feed/feedItemMeta";
import { EmojiPickerSheet } from "@/components/common/EmojiPickerSheet";

interface HostNoticeCardProps {
  crewId: number;
  notice: CrewNotice;
  crewName?: string;
  onNoticeUpdate: (updatedNotice: CrewNotice) => void;
  onEdit: () => void;
  onDelete: () => void;
  openMenuNoticeId: number | null;
  setOpenMenuNoticeId: (id: number | null) => void;
}

function HostNoticeCard({
  crewId,
  notice,
  crewName,
  onNoticeUpdate,
  onEdit,
  onDelete,
  openMenuNoticeId,
  setOpenMenuNoticeId
}: HostNoticeCardProps) {
  const router = useRouter();
  const [isEmojiSheetOpen, setIsEmojiSheetOpen] = useState(false);
  const [commentCount, setCommentCount] = useState<number | null>(null);

  const handleGoToDetail = () => {
    router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}`);
  };

  useEffect(() => {
    let active = true;
    getNoticeComments(crewId, notice.notice_id)
      .then((res) => {
        if (active) {
          setCommentCount(res.data.items.length);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [crewId, notice.notice_id]);

  const handleReactionClick = async (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isReacted = notice.my_reactions?.includes(emoji);
    try {
      const res = isReacted
        ? await removeNoticeReaction(crewId, notice.notice_id, emoji)
        : await addNoticeReaction(crewId, notice.notice_id, emoji);
      onNoticeUpdate({
        ...notice,
        my_reactions: res.data.my_reactions,
        reaction_counts: res.data.reaction_counts,
      });
    } catch {}
  };

  const handleEmojiSelect = (emoji: string) => {
    const isReacted = notice.my_reactions?.includes(emoji);
    const action = isReacted
      ? removeNoticeReaction(crewId, notice.notice_id, emoji)
      : addNoticeReaction(crewId, notice.notice_id, emoji);
    action
      .then((res) => {
        onNoticeUpdate({
          ...notice,
          my_reactions: res.data.my_reactions,
          reaction_counts: res.data.reaction_counts,
        });
      })
      .catch(() => {});
  };

  return (
    <article
      onClick={handleGoToDetail}
      className="group relative overflow-hidden rounded-card border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col bg-card border-text-secondary/10 hover:border-text-secondary/20"
    >
      {/* 1. 상단 풀위드 강조 띠 */}
      <div className="px-4 py-2 flex items-center justify-between gap-2 border-b text-text-secondary bg-text-secondary/5 border-text-secondary/5">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] font-bold shrink-0 bg-text-secondary/20 text-text-primary px-1.5 py-0.5 rounded-md">
            📢 공지
          </span>
          {crewName && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black border tracking-tight shrink-0 transition-colors ${getCrewBrandingColor(notice.crew_id).bgClass} ${getCrewBrandingColor(notice.crew_id).textClass} ${getCrewBrandingColor(notice.crew_id).borderClass}`}>
              {crewName}
            </span>
          )}
        </div>
        
        {/* 우측 영역: 시간 및 더보기 메뉴 */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] font-semibold opacity-70">
            {formatServerTime(notice.created_at)}
          </span>
          <HostMoreMenu
            isOpen={openMenuNoticeId === notice.notice_id}
            onToggle={() =>
              setOpenMenuNoticeId(
                openMenuNoticeId === notice.notice_id ? null : notice.notice_id
              )
            }
            alignClassName="right-0 top-6"
            items={[
              {
                label: "수정",
                icon: <Pencil size={16} />,
                onClick: onEdit,
              },
              {
                label: "삭제",
                icon: <Trash2 size={16} />,
                tone: "danger",
                onClick: onDelete,
              },
            ]}
          />
        </div>
      </div>

      {/* 2. 본문 영역 */}
      <div className="flex flex-col p-4 pb-3 gap-2 flex-1">
        <h3 className="text-[15px] font-extrabold text-text-primary leading-snug group-hover:text-primary-green transition-colors">
          {notice.title}
        </h3>
        <p className="text-[12.5px] font-medium text-text-secondary/90 leading-relaxed whitespace-pre-wrap break-all line-clamp-3 bg-card/65 dark:bg-card/40 p-3 rounded-xl border border-text-secondary/5">
          {notice.content}
        </p>
      </div>

      {/* 3. 하단 액션바 */}
      <div className="mt-auto border-t border-text-secondary/5 px-4 py-3 flex items-center justify-between flex-wrap gap-2 bg-text-secondary/[0.01]">
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(notice.reaction_counts || {})
            .filter(([, count]) => count > 0)
            .map(([emoji, count]) => {
              const isReacted = notice.my_reactions?.includes(emoji);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleReactionClick(emoji, e);
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-all cursor-pointer active:scale-95 ${
                    isReacted
                      ? "bg-[#E0E8FA] border-[#4D73D9] text-[#4D73D9] font-bold"
                      : "bg-transparent border-text-secondary/15 text-text-primary/80 font-semibold hover:bg-text-secondary/5"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              );
            })}
          <button
            type="button"
            aria-label="이모지 추가"
            onClick={(e) => {
              e.stopPropagation();
              setIsEmojiSheetOpen(true);
            }}
            className="flex h-6 w-7 items-center justify-center rounded-full border border-text-secondary/15 bg-card text-text-secondary hover:bg-text-secondary/5 cursor-pointer active:scale-95 shrink-0"
          >
            <SmilePlus size={13.5} strokeWidth={2.2} />
          </button>
          <div className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors shrink-0">
            <MessageSquare size={13.5} className="opacity-70" />
            <span className="text-[11px] font-bold opacity-80">
              {commentCount !== null && commentCount > 0
                ? `댓글 ${commentCount}`
                : "댓글 작성"}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary-green group-hover:underline shrink-0 ml-auto">
          <span>상세 보기</span>
          <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <EmojiPickerSheet
          isOpen={isEmojiSheetOpen}
          onClose={() => setIsEmojiSheetOpen(false)}
          onSelect={handleEmojiSelect}
          selectedEmojis={notice.my_reactions}
        />
      </div>
    </article>
  );
}

export function NoticesTab() {
  const [notices, setNotices] = useState<CrewNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [crewName, setCrewName] = useState<string | undefined>(undefined);
  const [openMenuNoticeId, setOpenMenuNoticeId] = useState<number | null>(null);
  const [deleteTargetNoticeId, setDeleteTargetNoticeId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const deleteNavTimerRef = useRef<number | null>(null);
  const params = useParams<{ crewId: string }>();
  const router = useRouter();
  const crewId = parseRouteNumber(params.crewId);

  // 크루 명 로드
  useEffect(() => {
    if (crewId === null) return;
    getCrew(crewId)
      .then((res) => {
        setCrewName(res.data.title);
      })
      .catch(() => {});
  }, [crewId]);

  const fetchNotices = useCallback(async () => {
    if (crewId === null) return;
    try {
      const res = await getCrewNotices(crewId);
      setNotices(res.data.items);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    return () => {
      if (deleteNavTimerRef.current !== null) clearTimeout(deleteNavTimerRef.current);
    };
  }, []);

  if (crewId === null) {
    return (
      <SectionCard>
        <EmptyState icon={<FileText size={44} className="text-primary-green" />} title="공지 목록을 불러올 수 없어요" />
      </SectionCard>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-card p-5 border border-text-secondary/10 flex flex-col gap-3 shadow-[var(--shadow-card)] animate-pulse"
          >
            <div className="h-5 w-1/3 bg-text-secondary/10 rounded-full" />
            <div className="h-3.5 w-full bg-text-secondary/10 rounded-full" />
            <div className="h-3.5 w-4/5 bg-text-secondary/10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <SectionCard>
        <EmptyState icon={<FileText size={44} className="text-primary-green" />} title="공지 목록을 불러오지 못했어요" />
      </SectionCard>
    );
  }

  const handleDeleteNotice = async () => {
    if (deleteTargetNoticeId === null) return;
    setIsDeleting(true);
    try {
      await deleteCrewNotice(crewId, deleteTargetNoticeId);
      setNotices((prev) => prev.filter((n) => n.notice_id !== deleteTargetNoticeId));
      setDeleteTargetNoticeId(null);
      setOpenMenuNoticeId(null);
      setToastMessage("게시글이 삭제되었습니다");
      setToastType("success");
      setIsToastOpen(true);
      deleteNavTimerRef.current = window.setTimeout(() => {
        router.push(`/crews/${crewId}/host-console?tab=notices`);
      }, 2000);
    } catch (error) {
      setToastMessage(
        getApiErrorMessage(
          error,
          {
            FORBIDDEN_NOT_HOST: "방장만 공지를 삭제할 수 있어요.",
            NOTICE_NOT_FOUND: "이미 삭제된 공지예요.",
          },
          "공지 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.",
        ),
      );
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNoticeUpdate = (updatedNotice: CrewNotice) => {
    setNotices((prev) =>
      prev.map((n) => (n.notice_id === updatedNotice.notice_id ? updatedNotice : n))
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-[13px] font-bold text-text-secondary">
          작성한 공지 <span className="font-extrabold text-primary-green">{notices.length}</span>
        </h2>
        <HostActionButton
          variant="primary"
          icon={<Pencil size={13} strokeWidth={2.4} />}
          className="!h-10 !min-h-10 shrink-0 px-[18px] !text-[12px]"
          onClick={() => router.push(`/crews/${crewId}/host-console/notices/new`)}
        >
          글쓰기
        </HostActionButton>
      </div>

      {notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-text-secondary/[0.02] border border-dashed border-text-secondary/15 rounded-card">
          <AlertCircle size={28} className="text-text-secondary/50" />
          <p className="text-xs font-bold text-text-secondary">등록된 공지사항이 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notices.map((notice) => (
            <HostNoticeCard
              key={notice.notice_id}
              crewId={crewId}
              notice={notice}
              crewName={crewName}
              onNoticeUpdate={handleNoticeUpdate}
              onEdit={() =>
                router.push(`/crews/${crewId}/host-console/notices/${notice.notice_id}/edit`)
              }
              onDelete={() => {
                setDeleteTargetNoticeId(notice.notice_id);
                setOpenMenuNoticeId(null);
              }}
              openMenuNoticeId={openMenuNoticeId}
              setOpenMenuNoticeId={setOpenMenuNoticeId}
            />
          ))}
        </div>
      )}

      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        type={toastType}
        onClose={() => setIsToastOpen(false)}
      />

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
          onCancel={() => {
            if (!isDeleting) setDeleteTargetNoticeId(null);
          }}
          onConfirm={() => void handleDeleteNotice()}
        />
      )}
    </div>
  );
}
