import type { HostExifStatus, HostReviewBucket } from "@/mocks/data/host";

export const REVIEW_FILTERS: Array<{ value: HostReviewBucket; label: string }> = [
  { value: "urgent", label: "긴급 검토" },
  { value: "warning", label: "주의 검토" },
  { value: "normal", label: "일반 검토" },
];

export const REVIEW_FILTER_STYLES: Record<HostReviewBucket, { active: string; inactive: string }> = {
  urgent: {
    active: "bg-[#D9534C] text-white shadow-sm shadow-[#FCEDEC]/70",
    inactive: "bg-[#FCEDEC] text-[#D9534C] hover:bg-[#F8DEDC]",
  },
  warning: {
    active: "bg-[#D89B4C] text-white shadow-sm shadow-[#FBF1E1]/70",
    inactive: "bg-[#FBF1E1] text-[#D89B4C] hover:bg-[#F6E7CD]",
  },
  normal: {
    active: "bg-[#777777] text-white shadow-sm shadow-[#F3F0E9]/70",
    inactive: "bg-[#F3F0E9] text-[#777777] hover:bg-[#E9E4DA]",
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
  FAILED: "text-[#DB5C55]",
};

export const exifBadgeStyle: Record<HostExifStatus, string> = {
  NORMAL: "bg-success-green/65 text-primary-green",
  MISSING: "bg-amber-50 text-[#D89B4D]",
  FAILED: "bg-[#FCEDEC] text-[#DB5C55]",
};
