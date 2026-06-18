"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import {
  getNoticeComments,
  createNoticeComment,
  updateNoticeComment,
  deleteNoticeComment,
} from "@/services/crew";
import { getMemberProfile } from "@/services/member";
import { Toast } from "@/components/common/Toast";
import type { ToastType } from "@/components/common/Toast";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import type { NoticeComment } from "@/types/domain";

// YYYY.MM.DD HH:mm 포맷터
const formatDateTime = (isoString: string) => {
  if (!isoString) return "-";
  let targetStr = isoString.trim();
  const hasTimezone =
    targetStr.endsWith("Z") || targetStr.includes("+") || /-\d{2}:?\d{2}$/.test(targetStr);
  if (!hasTimezone) {
    if (targetStr.includes(" ")) {
      targetStr = targetStr.replace(" ", "T");
    }
    targetStr = targetStr + "Z";
  }
  const date = new Date(targetStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${d} ${hh}:${mm}`;
};

interface NoticeCommentSectionProps {
  crewId: number;
  noticeId: number;
}

export function NoticeCommentSection({ crewId, noticeId }: NoticeCommentSectionProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [comments, setComments] = useState<NoticeComment[]>([]);
  const [commentProfiles, setCommentProfiles] = useState<Record<string, string | null>>({});

  // 댓글 등록/수정/삭제 상태
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentInput, setEditingCommentInput] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [deleteTargetCommentId, setDeleteTargetCommentId] = useState<number | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  // 토스트 상태
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");

  // 댓글 목록 조회
  const fetchComments = useCallback(async () => {
    try {
      const res = await getNoticeComments(crewId, noticeId);
      setComments(res.data.items);
    } catch (err) {
      console.error("댓글 목록 조회 실패:", err);
    }
  }, [crewId, noticeId]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  // 댓글 작성자 프로필 이미지 동적 조회
  useEffect(() => {
    if (comments.length === 0) return;

    let mounted = true;
    const uuids = Array.from(new Set(comments.map((c) => c.author_member_uuid).filter(Boolean)));
    const uuidsToFetch = uuids.filter((uuid) => commentProfiles[uuid] === undefined);

    if (uuidsToFetch.length === 0) return;

    uuidsToFetch.forEach(async (uuid) => {
      try {
        const res = await getMemberProfile(uuid);
        if (mounted) {
          setCommentProfiles((prev) => ({
            ...prev,
            [uuid]: res.data.profile_image_url ?? null,
          }));
        }
      } catch (err) {
        console.error(`댓글 작성자 프로필 조회 실패 (${uuid}):`, err);
        if (mounted) {
          setCommentProfiles((prev) => ({
            ...prev,
            [uuid]: null,
          }));
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [comments, commentProfiles]);

  const handleCommentSubmit = async () => {
    const content = commentInput.trim();
    if (!content || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      await createNoticeComment(crewId, noticeId, { content });
      setCommentInput("");
      await fetchComments();
    } catch {
      setToastMessage("댓글 등록에 실패했어요");
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentUpdate = async (commentId: number) => {
    const content = editingCommentInput.trim();
    if (!content || isUpdatingComment) return;
    setIsUpdatingComment(true);
    try {
      await updateNoticeComment(crewId, noticeId, commentId, { content });
      setComments((prev) => prev.map((c) => (c.comment_id === commentId ? { ...c, content } : c)));
      setEditingCommentId(null);
      setEditingCommentInput("");
    } catch {
      setToastMessage("댓글 수정에 실패했어요");
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleCommentDelete = async () => {
    if (deleteTargetCommentId === null || isDeletingComment) return;
    setIsDeletingComment(true);
    try {
      await deleteNoticeComment(crewId, noticeId, deleteTargetCommentId);
      setComments((prev) => prev.filter((c) => c.comment_id !== deleteTargetCommentId));
      setDeleteTargetCommentId(null);
    } catch {
      setToastMessage("댓글 삭제에 실패했어요");
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setIsDeletingComment(false);
    }
  };

  return (
    <section className="px-1 flex flex-col gap-4">
      <h2 className="text-sm font-bold text-text-primary">댓글 {comments.length}</h2>

      <div className="mt-3 flex flex-col gap-2">
        {comments.length === 0 ? (
          <p className="text-xs text-text-secondary py-4 font-semibold text-center">
            등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map((comment, index) => {
            const nickname = comment.nickname || comment.author_nickname || user?.nickname || "사용자";
            const initial = nickname.slice(0, 1);
            const commentAuthorUuid = comment.author_member_uuid || (comment as any).authorMemberUuid || "";
            const profileUrl = comment.profile_image_url || comment.author_profile_image_url || commentProfiles[commentAuthorUuid] || null;

            const myUuid = user?.member_uuid || (user as any)?.memberUuid || "";
            const isMyComment = myUuid && myUuid === commentAuthorUuid;

            const handleGoToMemberProfile = () => {
              if (commentAuthorUuid) {
                router.push(`/members/${commentAuthorUuid}`);
              }
            };

            const isEditing = editingCommentId === comment.comment_id;

            return (
              <article
                key={comment.comment_id ?? `comment-${index}`}
                className="py-2.5 bg-card border border-text-secondary/5 rounded-card px-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
              >
                <div className="flex gap-2.5">
                  <div
                    onClick={handleGoToMemberProfile}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-xs font-extrabold text-primary-blue overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    {profileUrl ? (
                      <img src={profileUrl} alt={nickname} className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <p
                        onClick={handleGoToMemberProfile}
                        className="truncate text-[11px] font-bold text-text-primary cursor-pointer hover:underline inline-block"
                      >
                        {nickname}
                      </p>
                      {/* 본인 댓글 수정/삭제 액션 버튼 */}
                      {!isEditing && isMyComment && (
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(comment.comment_id);
                              setEditingCommentInput(comment.content);
                            }}
                            className="text-[10px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                          >
                            수정
                          </button>
                          <span className="text-[9px] text-text-secondary/20">|</span>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetCommentId(comment.comment_id)}
                            className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      /* 인라인 수정 입력 폼 */
                      <div className="mt-1.5 flex flex-col gap-2">
                        <input
                          type="text"
                          value={editingCommentInput}
                          onChange={(e) => setEditingCommentInput(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-text-secondary/15 rounded-button bg-transparent text-text-primary focus:outline-none focus:border-primary-green"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingCommentInput("");
                            }}
                            className="text-[10px] text-text-secondary font-semibold hover:text-text-primary px-2 py-1 cursor-pointer"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            disabled={isUpdatingComment || !editingCommentInput.trim()}
                            onClick={() => void handleCommentUpdate(comment.comment_id)}
                            className="text-[10px] text-primary-green font-bold hover:opacity-85 px-2 py-1 disabled:opacity-50 cursor-pointer"
                          >
                            완료
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 댓글 본문 및 작성 시각 */
                      <>
                        <p className="mt-0.5 text-xs leading-relaxed text-text-primary/95 break-all whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        <p className="mt-1 text-[9px] text-text-secondary/60">
                          {formatDateTime(comment.created_at)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* 댓글 입력창 */}
      <div className="mt-5 flex items-center gap-2">
        <input
          type="text"
          value={commentInput}
          onChange={(event) => setCommentInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !isSubmittingComment) {
              void handleCommentSubmit();
            }
          }}
          placeholder="댓글을 입력해주세요"
          className="min-w-0 flex-1 rounded-full border border-text-secondary/15 bg-card px-4 py-2.5 text-xs text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-primary-green"
        />
        <button
          type="button"
          aria-label="댓글 등록"
          onClick={() => void handleCommentSubmit()}
          disabled={isSubmittingComment || !commentInput.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-green text-white shadow-sm transition hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Send size={14} strokeWidth={1.8} fill="none" />
        </button>
      </div>

      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        type={toastType}
        onClose={() => setIsToastOpen(false)}
      />

      {/* 댓글 삭제 확인 모달 */}
      {deleteTargetCommentId !== null && (
        <Modal
          isOpen={deleteTargetCommentId !== null}
          onClose={() => setDeleteTargetCommentId(null)}
          ariaLabel="댓글 삭제 확인"
        >
          <div className="p-5 flex flex-col gap-4">
            <p className="text-base font-bold text-text-primary">댓글을 삭제할까요?</p>
            <p className="text-sm font-semibold text-text-primary/80">
              삭제된 댓글은 복구할 수 없습니다.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setDeleteTargetCommentId(null)}
                fullWidth
              >
                취소
              </Button>
              <Button
                variant="primary-green"
                size="md"
                onClick={() => void handleCommentDelete()}
                isLoading={isDeletingComment}
                fullWidth
                className="!bg-red-500 hover:!opacity-90 shadow-red-500/20"
              >
                삭제
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
