import type { MissionLogReviewBucket } from "@/types/domain";

type VerificationExifStatus = "NORMAL" | "MISSING" | "FAILED";

export const REVIEW_FILTERS: Array<{ value: MissionLogReviewBucket; label: string }> = [
  { value: "urgent", label: "긴급 검토" },
  { value: "warning", label: "주의 검토" },
  { value: "normal", label: "일반 검토" },
];

export const REVIEW_FILTER_STYLES: Record<MissionLogReviewBucket, { active: string; inactive: string }> = {
  urgent: {
    active: "bg-[#D9534C]/10 text-[#D9534C] border border-[#D9534C]/25 font-extrabold shadow-sm",
    inactive: "bg-white text-text-secondary border border-text-secondary/15 hover:bg-slate-50",
  },
  warning: {
    active: "bg-[#D89B4C]/10 text-[#D89B4C] border border-[#D89B4C]/25 font-extrabold shadow-sm",
    inactive: "bg-white text-text-secondary border border-text-secondary/15 hover:bg-slate-50",
  },
  normal: {
    active: "bg-[#777777]/10 text-[#777777] border border-[#777777]/25 font-extrabold shadow-sm",
    inactive: "bg-white text-text-secondary border border-text-secondary/15 hover:bg-slate-50",
  },
};

export const exifSummaryLabel: Record<VerificationExifStatus, string> = {
  NORMAL: "정상",
  MISSING: "없음",
  FAILED: "시각 이상",
};

export const exifDetailLabel: Record<VerificationExifStatus, string> = {
  NORMAL: "정상",
  MISSING: "메타데이터 없음",
  FAILED: "촬영 시각 확인 필요",
};

export const exifDetailStyle: Record<VerificationExifStatus, string> = {
  NORMAL: "text-primary-green",
  MISSING: "text-[#D89B4D]",
  FAILED: "text-[#DB5C55]",
};

export const exifBadgeStyle: Record<VerificationExifStatus, string> = {
  NORMAL: "bg-success-green/65 text-primary-green",
  MISSING: "bg-amber-50 text-[#D89B4D]",
  FAILED: "bg-[#FCEDEC] text-[#DB5C55]",
};
