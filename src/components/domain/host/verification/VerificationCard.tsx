"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronRight, Maximize2, RotateCcw, X } from "lucide-react";

import { BottomSheet } from "@/components/common/BottomSheet";
import { formatDate, formatDateMinute, formatTime } from "@/components/domain/host/hostFormatters";
import {
  exifBadgeStyle,
  exifDetailLabel,
  exifDetailStyle,
  exifSummaryLabel,
} from "@/components/domain/host/verification/verificationDisplay";
import type { HostCertificationMock } from "@/mocks/data/host";
import type { RejectReasonCode } from "@/types/domain";

type VerificationCardProps = {
  item: HostCertificationMock;
  isExpanded: boolean;
  onToggle: () => void;
  moderationResult: VerificationModerationResult | null;
  onApprove: () => void;
  onReject: (rejectReasonLabel: string) => void;
  onUndo: () => void;
};

export type VerificationModerationResult = {
  decision: "approved" | "rejected";
  rejectReasonLabel?: string;
};

const rejectReasonOptions: Array<{ value: RejectReasonCode; label: string; description: string }> = [
  { value: "TIME_VIOLATION", label: "시간 위반", description: "마감 후 촬영" },
  { value: "DUPLICATE", label: "중복 업로드", description: "이미 인증된 사진" },
  { value: "MISSION_MISMATCH", label: "미션 불일치", description: "주제와 다른 사진" },
  { value: "UNCLEAR", label: "사진 불명확", description: "가림 · 흔들림" },
  { value: "INAPPROPRIATE", label: "부적절", description: "운영원칙 위반" },
  { value: "OTHER", label: "기타", description: "직접 입력" },
];

export function VerificationCard({
  item,
  isExpanded,
  onToggle,
  moderationResult,
  onApprove,
  onReject,
  onUndo,
}: VerificationCardProps) {
  const [isRejectSheetOpen, setIsRejectSheetOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [confirmDecision, setConfirmDecision] = useState<"approved" | "rejected" | "undo" | null>(null);
  const [toastDecision, setToastDecision] = useState<"approved" | "rejected" | "undo" | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState<RejectReasonCode | null>(null);
  const [rejectMemo, setRejectMemo] = useState("");
  const isRejectConfirmDisabled =
    selectedRejectReason === null || (selectedRejectReason === "OTHER" && rejectMemo.trim().length === 0);
  const moderationDecision = moderationResult?.decision ?? null;

  useEffect(() => {
    if (!toastDecision) return;

    const timeoutId = window.setTimeout(() => {
      setToastDecision(null);
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [toastDecision]);

  const handleRejectConfirm = () => {
    if (isRejectConfirmDisabled) return;
    setIsRejectSheetOpen(false);
    setConfirmDecision("rejected");
  };

  const handleConfirmModeration = () => {
    if (confirmDecision === "approved") {
      onApprove();
      setToastDecision("approved");
    }

    if (confirmDecision === "rejected") {
      onReject(selectedRejectReasonLabel);
      setToastDecision("rejected");
    }

    if (confirmDecision === "undo") {
      onUndo();
      setToastDecision("undo");
    }

    setConfirmDecision(null);
  };

  const selectedRejectReasonLabel =
    rejectReasonOptions.find((option) => option.value === selectedRejectReason)?.label ?? "사유 미선택";

  return (
    <>
      <article
        className={`overflow-hidden rounded-card bg-card shadow-sm transition-opacity ${
          isExpanded ? "border-2 border-[#4d73d9]" : "border border-text-secondary/10"
        } ${moderationDecision && !isExpanded ? "opacity-55 grayscale-[15%]" : ""}`}
      >
        <button type="button" onClick={onToggle} className="w-full px-4 py-3.5 text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-sm font-extrabold text-primary-blue">
                {item.nickname.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-text-primary">{item.nickname}</p>
                <p className="mt-0.5 text-xs font-medium text-text-secondary">
                  {formatDate(item.submitted_at)} · {formatTime(item.submitted_at)}
                </p>
              </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  moderationDecision === "approved"
                    ? "bg-success-green/65 text-primary-green"
                    : moderationDecision === "rejected"
                      ? "bg-[#FCEDEC] text-[#DB5C55]"
                      : exifBadgeStyle[item.exif_status]
                }`}
              >
                {moderationDecision === "approved"
                  ? "승인됨"
                  : moderationDecision === "rejected"
                    ? "거절됨"
                    : `Exif ${exifSummaryLabel[item.exif_status]}`}
              </span>
              <span className={`flex h-6 w-5 items-center justify-center ${isExpanded ? "text-[#4d73d9]" : "text-[#aeaaa1]"}`}>
                {isExpanded ? <ChevronDown size={19} strokeWidth={2.4} /> : <ChevronRight size={21} strokeWidth={2.4} />}
              </span>
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-text-secondary/10 bg-[#FAFCFF] px-4 pb-4 pt-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="relative h-32 w-32 shrink-0 cursor-zoom-in overflow-hidden rounded-xl bg-success-green/70"
                aria-label={`${item.nickname} 인증 사진 확대`}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={`${item.nickname} 인증 사진`} className="h-full w-full object-cover" />
                ) : null}
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-text-primary/65 px-2 py-1 text-[10px] font-medium text-white">
                  <Maximize2 size={11} strokeWidth={2.4} />
                  확대
                </span>
              </button>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="grid grid-cols-[64px_1fr] items-center gap-2">
                  <p className="text-xs font-medium text-text-secondary">촬영 시각</p>
                  <p className="text-xs font-extrabold text-text-primary">
                    {item.exif_status === "MISSING" ? "-" : formatDateMinute(item.captured_at)}
                  </p>
                </div>
                <div className="grid grid-cols-[64px_1fr] items-center gap-2">
                  <p className="text-xs font-medium text-text-secondary">Exif 검증</p>
                  <p className={`text-xs font-extrabold ${exifDetailStyle[item.exif_status]}`}>
                    {exifDetailLabel[item.exif_status]}
                  </p>
                </div>
                <div className="grid grid-cols-[64px_1fr] items-center gap-2">
                  <p className="text-xs font-medium text-text-secondary">중복</p>
                  <p className={`text-xs font-extrabold ${item.is_duplicate ? "text-[#DB5C55]" : "text-primary-green"}`}>
                    {item.is_duplicate ? "있음" : "없음"}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-3 rounded-xl bg-card px-3 py-3 text-xs leading-relaxed text-text-primary border border-text-secondary/10">
              &quot;{item.comment}&quot;
            </p>

            {moderationDecision ? (
              <div
                className={`mt-3 flex h-14 items-center justify-between gap-3 rounded-xl px-4 ${
                  moderationDecision === "approved" ? "bg-[#E8F2EB]" : "bg-[#FCEDEC]"
                }`}
              >
                <p
                  className={`flex min-w-0 items-center gap-3 truncate text-[13px] font-extrabold ${
                    moderationDecision === "approved" ? "text-primary-green" : "text-[#DB5C55]"
                  }`}
                >
                  {moderationDecision === "approved" ? (
                    <Check size={18} strokeWidth={2.8} className="shrink-0" />
                  ) : (
                    <X size={18} strokeWidth={2.8} className="shrink-0" />
                  )}
                  <span className="truncate">
                    {moderationDecision === "approved"
                      ? "승인 완료 · 정산에 반영됩니다"
                      : `거절 완료 · ${moderationResult?.rejectReasonLabel ?? selectedRejectReasonLabel}`}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmDecision("undo")}
                  className={`shrink-0 rounded-[10px] border border-text-secondary/10 px-2.5 py-1.5 text-xs font-medium text-text-primary transition-colors ${
                    moderationDecision === "approved" ? "bg-[#E8F2EB] hover:bg-[#DCEBDF]" : "bg-[#FCEDEC] hover:bg-[#F4E6E5]"
                  }`}
                >
                  되돌리기
                </button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsRejectSheetOpen(true)}
                  className="inline-flex h-14 min-h-14 items-center justify-center gap-1.5 rounded-xl bg-[#FCEDEC] text-base font-extrabold leading-none text-[#DB5C55] transition-colors hover:bg-[#F8DEDC]"
                >
                  <X size={16} strokeWidth={2.8} />
                  거절
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDecision("approved")}
                  className="inline-flex h-14 min-h-14 items-center justify-center gap-1.5 rounded-xl bg-primary-green text-base font-extrabold leading-none text-white shadow-sm shadow-primary-green/20 transition-colors hover:bg-[#3F7A55]"
                >
                  <Check size={16} strokeWidth={2.8} />
                  승인
                </button>
              </div>
            )}
          </div>
        )}
      </article>

      <BottomSheet
        isOpen={isRejectSheetOpen}
        onClose={() => setIsRejectSheetOpen(false)}
        ariaLabel="거절 사유를 선택해주세요"
        showCloseButton={false}
        showHeaderBorder={false}
        panelClassName="bg-[#F5F0E6]"
      >
        <div className="bg-[#F5F0E6] px-5 pb-5 pt-3">
          <div className="pb-4">
            <h2 className="text-base font-bold text-text-primary">거절 사유를 선택해주세요</h2>
            <p className="mt-1 text-xs font-medium text-text-secondary">크루원에게 사유가 표시됩니다</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {rejectReasonOptions.map((option) => {
              const isSelected = selectedRejectReason === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRejectReason(option.value)}
                  className={`relative flex min-h-[86px] w-full flex-col items-start justify-center rounded-2xl px-3 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-2 border-[#D9534C] bg-white"
                      : "border border-text-secondary/10 bg-[#FAF7EE] hover:bg-[#F2ECE1]"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D9534C]">
                      <Check size={12} strokeWidth={3} className="text-white" />
                    </span>
                  )}
                  <span className="text-sm font-extrabold text-text-primary">{option.label}</span>
                  <span className="mt-0.5 text-[11px] font-medium text-text-secondary">{option.description}</span>
                  <span className="mt-1.5 text-[9px] font-medium text-text-secondary/70">{option.value}</span>
                </button>
              );
            })}
          </div>

          {selectedRejectReason === "OTHER" && (
            <textarea
              value={rejectMemo}
              onChange={(event) => setRejectMemo(event.target.value.slice(0, 50))}
              maxLength={50}
              placeholder="기타 사유를 입력해주세요"
              aria-label="기타 거절 사유"
              className="mt-3 h-20 w-full resize-none rounded-2xl border border-text-secondary/10 bg-[#FAFCFF] px-4 py-3 text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary focus:border-[#DB5C55]"
            />
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsRejectSheetOpen(false)}
              className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-[#EDE8DF] bg-[#F5F0E6] text-base font-extrabold text-text-primary transition-colors hover:bg-[#EDE8DF] active:bg-[#EDE8DF]"
            >
              취소
            </button>
            <button
              type="button"
              disabled={isRejectConfirmDisabled}
              onClick={handleRejectConfirm}
              className="inline-flex h-14 items-center justify-center rounded-xl bg-[#DB5C55] text-base font-extrabold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              거절 확인
            </button>
          </div>
        </div>
      </BottomSheet>

      {confirmDecision && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`verification-${confirmDecision}-title-${item.mission_log_id}`}
          onClick={() => setConfirmDecision(null)}
        >
          <div
            className="w-full max-w-[340px] rounded-2xl bg-card px-5 py-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
                confirmDecision === "approved"
                  ? "bg-[#E8F2EB] text-primary-green"
                  : confirmDecision === "rejected"
                    ? "bg-[#FCEDEC] text-[#DB5C55]"
                    : "bg-[#EFEDE8] text-text-secondary"
              }`}
            >
              {confirmDecision === "approved" ? (
                <Check size={22} strokeWidth={2.8} />
              ) : confirmDecision === "rejected" ? (
                <X size={22} strokeWidth={2.8} />
              ) : (
                <RotateCcw size={22} strokeWidth={2.6} />
              )}
            </div>
            <h2
              id={`verification-${confirmDecision}-title-${item.mission_log_id}`}
              className="mt-3 text-center text-base font-extrabold text-text-primary"
            >
              {confirmDecision === "approved"
                ? "승인하시겠습니까?"
                : confirmDecision === "rejected"
                  ? "거절하시겠습니까?"
                  : "되돌리시겠습니까?"}
            </h2>
            <p className="mt-2 text-center text-sm font-medium leading-relaxed text-text-secondary">
              {item.nickname}님의 인증을{" "}
              {confirmDecision === "approved" ? "승인합니다." : confirmDecision === "rejected" ? "거절합니다." : "검토 대기로 되돌립니다."}
              <br />
              {confirmDecision === "approved"
                ? "승인 후 정산에 반영됩니다."
                : confirmDecision === "rejected"
                  ? "크루원에게 사유가 표시됩니다."
                  : "되돌린 뒤 다시 승인하거나 거절할 수 있습니다."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmDecision(null)}
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-[#EDE8DF] bg-card text-sm font-extrabold text-text-primary transition-colors hover:bg-[#EDE8DF]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmModeration}
                className={`inline-flex h-12 items-center justify-center rounded-xl text-sm font-extrabold text-white transition-colors ${
                  confirmDecision === "approved"
                    ? "bg-primary-green hover:bg-[#3F7A55]"
                    : confirmDecision === "rejected"
                      ? "bg-[#DB5C55] hover:bg-[#C84D46]"
                      : "bg-text-primary hover:bg-[#3A362E]"
                }`}
              >
                {confirmDecision === "approved" ? "승인" : confirmDecision === "rejected" ? "거절" : "되돌리기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastDecision && (
        <div className="fixed inset-x-0 bottom-6 z-[90] flex justify-center px-5 pointer-events-none">
          <div
            className="flex w-fit items-center gap-2.5 rounded-2xl bg-[#28251F] px-4 py-3 text-white shadow-lg"
            role="status"
            aria-live="polite"
          >
            {toastDecision === "approved" && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-green text-white">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
            {toastDecision === "rejected" && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DB5C55] text-white">
                <X size={13} strokeWidth={3} />
              </span>
            )}
            {toastDecision === "undo" && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8F8980] text-white">
                <RotateCcw size={12} strokeWidth={3} />
              </span>
            )}
            <span className="text-sm font-extrabold">
              {toastDecision === "undo" ? "결정을 되돌렸어요" : `인증을 ${toastDecision === "approved" ? "승인했어요" : "거절했어요"}`}
            </span>
          </div>
        </div>
      )}

      {isLightboxOpen && (
        <div className="fixed inset-0 z-[80] flex justify-center bg-black/70" onClick={() => setIsLightboxOpen(false)}>
          <div className="relative flex h-full w-full max-w-[430px] flex-col bg-black text-white">
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-black/45 px-5 py-4 backdrop-blur-sm">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-extrabold text-white">
                  {item.nickname.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-white">{item.nickname}</p>
                  <p className="mt-0.5 text-xs font-medium text-white/70">
                    {item.exif_status === "MISSING" ? "-" : formatDateMinute(item.captured_at)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsLightboxOpen(false);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                aria-label="확대 사진 닫기"
              >
                <X size={20} strokeWidth={2.6} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 cursor-zoom-out items-center justify-center px-4 py-20">
              <div className="relative w-full overflow-hidden rounded-2xl bg-white/10" onClick={(event) => event.stopPropagation()}>
                {item.image_url ? (
                  <img src={item.image_url} alt={`${item.nickname} 인증 사진 확대`} className="max-h-[68vh] w-full object-contain" />
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center text-sm font-medium text-white/70">
                    인증 사진
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/45 px-4 py-3 backdrop-blur-sm">
                  <p className="text-sm font-medium text-white">{item.comment}</p>
                  <p className="mt-1 text-xs font-medium text-white/70">
                    제출 {formatDate(item.submitted_at)} · {formatTime(item.submitted_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/55 px-5 pb-5 pt-3 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 px-3 py-3">
                  <p className="text-[11px] font-medium text-white/60">Exif 검증</p>
                  <p className={`mt-1 text-sm font-medium ${exifDetailStyle[item.exif_status]}`}>
                    {exifDetailLabel[item.exif_status]}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-3">
                  <p className="text-[11px] font-medium text-white/60">중복</p>
                  <p className={`mt-1 text-sm font-medium ${item.is_duplicate ? "text-[#DB5C55]" : "text-primary-green"}`}>
                    {item.is_duplicate ? "있음" : "없음"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
