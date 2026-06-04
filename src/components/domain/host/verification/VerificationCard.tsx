"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";

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
};

type ModerationDecision = "approved" | "rejected" | null;

const rejectReasonOptions: Array<{ value: RejectReasonCode; label: string; description: string }> = [
  { value: "TIME_VIOLATION", label: "시간 위반", description: "마감 후 촬영" },
  { value: "DUPLICATE", label: "중복 업로드", description: "이미 인증된 사진" },
  { value: "MISSION_MISMATCH", label: "미션 불일치", description: "주제와 다른 사진" },
  { value: "UNCLEAR", label: "사진 불명확", description: "가림 · 흔들림" },
  { value: "INAPPROPRIATE", label: "부적절", description: "운영원칙 위반" },
  { value: "OTHER", label: "기타", description: "직접 입력" },
];

export function VerificationCard({ item, isExpanded, onToggle }: VerificationCardProps) {
  const [isRejectSheetOpen, setIsRejectSheetOpen] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState<RejectReasonCode | null>(null);
  const [rejectMemo, setRejectMemo] = useState("");
  const [moderationDecision, setModerationDecision] = useState<ModerationDecision>(null);
  const isRejectConfirmDisabled =
    selectedRejectReason === null || (selectedRejectReason === "OTHER" && rejectMemo.trim().length === 0);

  const handleRejectConfirm = () => {
    if (isRejectConfirmDisabled) return;
    setModerationDecision("rejected");
    setIsRejectSheetOpen(false);
  };

  const handleApprove = () => {
    setModerationDecision("approved");
  };

  const handleUndoDecision = () => {
    setModerationDecision(null);
  };

  const selectedRejectReasonLabel =
    rejectReasonOptions.find((option) => option.value === selectedRejectReason)?.label ?? "사유 미선택";

  return (
    <>
      <article
        className={`overflow-hidden rounded-card bg-card shadow-sm ${
          isExpanded ? "border-2 border-[#4d73d9]" : "border border-text-secondary/10"
        }`}
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
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-success-green/70">
                {item.image_url ? (
                  <img src={item.image_url} alt={`${item.nickname} 인증 사진`} className="h-full w-full object-cover" />
                ) : null}
                <span className="absolute right-2 top-2 rounded-md bg-text-primary/65 px-2 py-1 text-[10px] font-extrabold text-white">
                  인증
                </span>
              </div>

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
              <div className="mt-3 flex h-14 items-center justify-between gap-3 rounded-xl bg-[#FAF7EE] px-4">
                <p
                  className={`min-w-0 truncate text-sm font-extrabold ${
                    moderationDecision === "approved" ? "text-primary-green" : "text-[#DB5C55]"
                  }`}
                >
                  {moderationDecision === "approved"
                    ? "승인 완료 · 정산에 반영됩니다"
                    : `거절 완료 · ${selectedRejectReasonLabel}`}
                </p>
                <button
                  type="button"
                  onClick={handleUndoDecision}
                  className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-extrabold text-text-secondary transition-colors hover:bg-[#EDE8DF]"
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
                  onClick={handleApprove}
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
    </>
  );
}
