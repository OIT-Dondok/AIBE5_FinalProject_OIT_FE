import { ClipboardCheck, Megaphone, Users } from "lucide-react";

import type { HostTab } from "@/components/domain/host/hostConsoleTypes";

const HOST_TABS: Array<{ value: HostTab; label: string; icon: typeof ClipboardCheck }> = [
  { value: "verification", label: "인증 검증", icon: ClipboardCheck },
  { value: "applications", label: "가입 신청", icon: Users },
  { value: "notices", label: "공지 관리", icon: Megaphone },
];

type HostConsoleTabsProps = {
  activeTab: HostTab;
  pendingReviewCount: number;
  pendingApplicationCount: number;
  noticeCount: number;
  onTabChange: (tab: HostTab) => void;
};

export function HostConsoleTabs({
  activeTab,
  pendingReviewCount,
  pendingApplicationCount,
  noticeCount,
  onTabChange,
}: HostConsoleTabsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {HOST_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-[16px] border px-2 py-3.5 text-xs font-bold shadow-sm transition-colors ${
              isActive
                ? "border-primary-green/20 bg-success-green/55 text-primary-green"
                : "border-text-secondary/10 bg-card text-text-secondary hover:bg-text-secondary/5"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Icon size={15} />
              <span className="truncate">{tab.label}</span>
            </span>
            <span className="text-sm font-extrabold leading-none">
              {tab.value === "verification"
                ? pendingReviewCount
                : tab.value === "applications"
                  ? pendingApplicationCount
                  : noticeCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
