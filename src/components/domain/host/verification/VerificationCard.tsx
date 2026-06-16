"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, Maximize2, X } from "lucide-react";

import { BottomSheet } from "@/components/common/BottomSheet";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { HostConfirmDialog } from "@/components/domain/host/common/HostConfirmDialog";
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
  onApprove: () => Promise<boolean>;
  onReject: (reason: { code: RejectReasonCode; label: string; memo?: string }) => Promise<boolean>;
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
  onApprove,
  onReject,
}: VerificationCardProps) {
  const [isRejectSheetOpen, setIsRejectSheetOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [confirmDecision, setConfirmDecision] = useState<"approved" | "rejected" | null>(null);
  const [toastDecision, setToastDecision] = useState<"approved" | "rejected" | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState<RejectReasonCode | null>(null);
  const [rejectMemo, setRejectMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRejectConfirmDisabled =
    selectedRejectReason === null || (selectedRejectReason === "OTHER" && rejectMemo.trim().length === 0);
  const automaticDecision =
    item.decision_type === "AUTO_APPROVE"
      ? "approved"
      : item.decision_type === "AUTO_REJECT"
        ? "rejected"
        : null;

  const selectedRejectReasonLabel =
    rejectReasonOptions.find((option) => option.value === selectedRejectReason)?.label ?? "사유 미선택";

  const TOAST_DURATION_MS = 2400;

  useEffect(() => {
    if (!toastDecision) return;

    const timeoutId = window.setTimeout(() => {
      setToastDecision(null);
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [toastDecision]);

  const handleRejectConfirm = () => {
    if (isRejectConfirmDisabled) return;
    setIsRejectSheetOpen(false);
    setConfirmDecision("rejected");
  };

  const handleConfirmModeration = async () => {
    if (isSubmitting) return;

    if (confirmDecision === "approved") {
      setIsSubmitting(true);
      const succeeded = await onApprove();
      setIsSubmitting(false);
      if (!succeeded) return;
      setToastDecision("approved");
    }

    if (confirmDecision === "rejected") {
      if (!selectedRejectReason) return;
      setIsSubmitting(true);
      const succeeded = await onReject({
        code: selectedRejectReason,
        label: selectedRejectReasonLabel,
        memo: rejectMemo || undefined,
      });
      setIsSubmitting(false);
      if (!succeeded) return;
      setToastDecision("rejected");
    }

    setConfirmDecision(null);
  };

  return (
    <>
      <article
        className={`overflow-hidden rounded-card bg-card shadow-sm transition-opacity ${
          isExpanded ? "border-2 border-[#4d73d9]" : "border border-text-secondary/10"
        }`}
      >
        <button type="button" onClick={onToggle} className="w-full px-4 py-3.5 text-left">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/members/${item.member_uuid}`}
              className="flex min-w-0 items-center gap-3 hover:opacity-80 active:opacity-60 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-sm font-extrabold text-primary-blue">
                {item.nickname.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-text-primary">{item.nickname}</p>
                <p className="mt-0.5 text-xs font-medium text-text-secondary">
                  {formatDate(item.submitted_at)} · {formatTime(item.submitted_at)}
                </p>
              </div>
            </Link>

          <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  automaticDecision === "approved"
                    ? "bg-success-green/65 text-primary-green"
                    : automaticDecision === "rejected"
                      ? "bg-[#FCEDEC] text-[#DB5C55]"
                      : exifBadgeStyle[item.exif_status]
                }`}
              >
                {automaticDecision === "approved"
                  ? "자동 승인됨"
                  : automaticDecision === "rejected"
                    ? "자동 거절됨"
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
                  <img src={item.image_url} alt={`${item.nickname} 인증 사진`} loading="lazy" className="h-full w-full object-cover" />
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

            <div className="mt-3 grid grid-cols-2 gap-3">
              <HostActionButton
                variant="reject"
                icon={<X size={16} strokeWidth={2.8} />}
                onClick={() => setIsRejectSheetOpen(true)}
              >
                거절
              </HostActionButton>
              <HostActionButton
                variant="approve"
                icon={<Check size={16} strokeWidth={2.8} />}
                onClick={() => setConfirmDecision("approved")}
              >
                승인
              </HostActionButton>
            </div>
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
              className="mt-3 h-20 w-full resize-none rounded-2xl border border-text-secondary/10 bg-[#FAFCFF] px-4 py-3 text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary focus:border-[#DB5C55] focus-visible:ring-2 focus-visible:ring-[#DB5C55]/50"
            />
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <HostActionButton variant="cancel" className="bg-[#F5F0E6]" onClick={() => setIsRejectSheetOpen(false)}>
              취소
            </HostActionButton>
            <HostActionButton
              variant="danger"
              disabled={isRejectConfirmDisabled}
              onClick={handleRejectConfirm}
              className="disabled:cursor-not-allowed disabled:opacity-40"
            >
              거절 확인
            </HostActionButton>
          </div>
        </div>
      </BottomSheet>

      {confirmDecision && (
        <HostConfirmDialog
          labelledById={`verification-${confirmDecision}-title-${item.mission_log_id}`}
          title={
            confirmDecision === "approved"
              ? "승인하시겠습니까?"
              : "거절하시겠습니까?"
          }
          description={
            <>
              {item.nickname}님의 인증을{" "}
              {confirmDecision === "approved" ? "승인합니다." : "거절합니다."}
              <br />
              {confirmDecision === "approved"
                ? "승인 후 정산에 반영됩니다."
                : "크루원에게 사유가 표시됩니다."}
            </>
          }
          icon={
            confirmDecision === "approved" ? (
              <Check size={22} strokeWidth={2.8} />
            ) : (
              <X size={22} strokeWidth={2.8} />
            )
          }
          tone={confirmDecision === "approved" ? "approve" : "danger"}
          confirmLabel={confirmDecision === "approved" ? "승인" : "거절"}
          onCancel={() => setConfirmDecision(null)}
          onConfirm={() => void handleConfirmModeration()}
          isSubmitting={isSubmitting}
        />
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
            <span className="text-[13px] font-extrabold">
              인증을 {toastDecision === "approved" ? "승인했어요" : "거절했어요"}
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
                  <img src={item.image_url} alt={`${item.nickname} 인증 사진 확대`} loading="lazy" className="max-h-[68vh] w-full object-contain" />
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
