"use client";

import { useState } from "react";
import { ClipboardCheck, ShieldCheck, Megaphone, X } from "lucide-react";

interface HostGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_ITEMS = [
  {
    icon: ShieldCheck,
    iconBg: "bg-primary-blue/10",
    iconColor: "text-primary-blue",
    tabActiveClass: "bg-primary-blue text-white",
    panelClass: "bg-primary-blue/5 border-primary-blue/15",
    title: "검증",
    description: "크루원이 제출한 미션 인증을 승인하거나 반려합니다. 대기 중인 항목은 탭 배지로 표시됩니다.",
  },
  {
    icon: ClipboardCheck,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    tabActiveClass: "bg-amber-400 text-white",
    panelClass: "bg-amber-50/80 border-amber-200/60",
    title: "입장 신청",
    description: "크루 참가를 신청한 멤버를 승인하거나 거절합니다. 대기 중인 신청은 탭 배지로 확인하세요.",
  },
  {
    icon: Megaphone,
    iconBg: "bg-success-green/30",
    iconColor: "text-primary-green",
    tabActiveClass: "bg-primary-green text-white",
    panelClass: "bg-success-green/20 border-primary-green/15",
    title: "공지",
    description: "크루원에게 공지사항을 등록하고 관리합니다. 중요 안내는 공지로 남겨두세요.",
  },
];

export function HostGuideModal({ isOpen, onClose }: HostGuideModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!isOpen) return null;

  const active = GUIDE_ITEMS[activeIndex];
  const Icon = active.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[390px] bg-card rounded-3xl px-5 pt-5 pb-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
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

        <div className="flex gap-1.5 p-1 bg-background rounded-2xl mb-4">
          {GUIDE_ITEMS.map((item, idx) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeIndex === idx
                  ? `${item.tabActiveClass} shadow-sm`
                  : "text-text-secondary"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className={`flex items-start gap-3.5 p-4 rounded-2xl border ${active.panelClass}`}>
          <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${active.iconBg}`}>
            <Icon size={22} className={active.iconColor} strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary">{active.title}</p>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">{active.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
