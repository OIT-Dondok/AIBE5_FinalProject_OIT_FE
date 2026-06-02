import type { HostExifStatus, HostReviewBucket } from "@/mocks/data/host";

export const REVIEW_FILTERS: Array<{ value: HostReviewBucket; label: string }> = [
  { value: "urgent", label: "긴급 검토" },
  { value: "warning", label: "주의 검토" },
  { value: "normal", label: "일반 검토" },
];

export const REVIEW_FILTER_STYLES: Record<HostReviewBucket, { active: string; inactive: string }> = {
  urgent: {
    active: "bg-red-50 text-red-500 shadow-sm shadow-red-100/70",
    inactive: "text-red-500 hover:bg-red-50",
  },
  warning: {
    active: "bg-amber-50 text-[#D89B4D] shadow-sm shadow-amber-100/70",
    inactive: "text-[#D89B4D] hover:bg-amber-50",
  },
  normal: {
    active: "bg-slate-100 text-text-secondary shadow-sm shadow-slate-200/70",
    inactive: "text-text-secondary hover:bg-slate-100",
  },
};

export const exifSummaryLabel: Record<HostExifStatus, string> = {
  NORMAL: "✓ 정상",
  MISSING: "⚠ 없음",
  FAILED: "✕ 실패",
};

export const exifDetailLabel: Record<HostExifStatus, string> = {
  NORMAL: "✓ 성공",
  MISSING: "⚠ 메타데이터 없음",
  FAILED: "✕ 실패",
};

export const exifDetailStyle: Record<HostExifStatus, string> = {
  NORMAL: "text-primary-green",
  MISSING: "text-[#D89B4D]",
  FAILED: "text-red-500",
};

export const exifBadgeStyle: Record<HostExifStatus, string> = {
  NORMAL: "bg-success-green/65 text-primary-green",
  MISSING: "bg-amber-50 text-[#D89B4D]",
  FAILED: "bg-red-50 text-red-500",
};
