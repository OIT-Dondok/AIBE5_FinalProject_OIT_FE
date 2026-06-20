"use client";

import { ClipboardCheck, ShieldCheck, Megaphone, X } from "lucide-react";

interface HostGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_ITEMS = [
  {
    icon: ShieldCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-primary-green",
    title: "검증",
    description: "크루원이 제출한 미션 인증을 승인하거나 반려합니다. 대기 중인 항목은 탭 배지로 표시됩니다.",
  },
  {
    icon: ClipboardCheck,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    title: "입장 신청",
    description: "크루 참가를 신청한 멤버를 승인하거나 거절합니다. 대기 중인 신청은 탭 배지로 확인하세요.",
  },
  {
    icon: Megaphone,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "공지",
    description: "크루원에게 공지사항을 등록하고 관리합니다. 중요 안내는 공지로 남겨두세요.",
  },
];

export function HostGuideModal({ isOpen, onClose }: HostGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[430px] bg-card rounded-t-3xl px-5 pt-5 pb-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-text-primary">운영 콘솔 가이드</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-full hover:bg-text-secondary/10 active:scale-95 transition-all"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {GUIDE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-background border border-text-secondary/10">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  <Icon size={20} className={item.iconColor} strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
