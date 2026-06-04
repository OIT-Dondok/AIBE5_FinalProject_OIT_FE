import { Check, ChevronDown, ChevronRight, X } from "lucide-react";

import { formatDate, formatDateMinute, formatTime } from "@/components/domain/host/hostFormatters";
import {
  exifBadgeStyle,
  exifDetailLabel,
  exifDetailStyle,
  exifSummaryLabel,
} from "@/components/domain/host/verification/verificationDisplay";
import type { HostCertificationMock } from "@/mocks/data/host";

type VerificationCardProps = {
  item: HostCertificationMock;
  isExpanded: boolean;
  onToggle: () => void;
};

export function VerificationCard({ item, isExpanded, onToggle }: VerificationCardProps) {
  return (
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
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${exifBadgeStyle[item.exif_status]}`}>
              Exif {exifSummaryLabel[item.exif_status]}
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

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#FCEDEC] text-sm font-extrabold text-[#DB5C55] transition-colors hover:bg-[#F8DEDC]"
            >
              <X size={16} strokeWidth={2.8} />
              거절
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary-green text-sm font-extrabold text-white shadow-sm shadow-primary-green/20 transition-colors hover:bg-[#3F7A55]"
            >
              <Check size={16} strokeWidth={2.8} />
              승인
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
