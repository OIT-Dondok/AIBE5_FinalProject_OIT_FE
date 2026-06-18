import { ClipboardCheck, Megaphone, Users } from "lucide-react";

import type { HostTab } from "@/components/domain/host/hostConsoleTypes";

const HOST_TABS: Array<{ value: HostTab; label: string; icon: typeof ClipboardCheck }> = [
  { value: "verification", label: "인증 검증", icon: ClipboardCheck },
  { value: "applications", label: "가입 신청", icon: Users },
  { value: "notices", label: "공지 관리", icon: Megaphone },
];

const ACTIVE_STYLES: Record<HostTab, string> = {
  verification: "bg-white text-[#4C73D9] border-t-4 border-t-[#4C73D9] border-b-transparent",
  applications: "bg-white text-[#D89B4C] border-t-4 border-t-[#D89B4C] border-b-transparent",
  notices: "bg-white text-[#5E9B73] border-t-4 border-t-[#5E9B73] border-b-transparent",
};

const INACTIVE_STYLES = "bg-[#EFEAD8] text-[#777777] border-t-4 border-t-transparent border-b border-[#E5DEC9] hover:bg-[#EAE4CE]";

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
    <div className="grid grid-cols-3 gap-0 border border-[#E5DEC9] bg-[#FAF8F5] rounded-t-[20px] overflow-hidden">
      {HOST_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`flex min-w-0 flex-col items-center justify-center gap-0.5 px-2 pb-4 pt-3.5 text-[10px] font-bold transition-all border-r border-[#E5DEC9] last:border-r-0 ${
              isActive ? ACTIVE_STYLES[tab.value] : INACTIVE_STYLES
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Icon size={13} />
              <span className="truncate">{tab.label}</span>
            </span>
            <span className="text-[20px] font-extrabold leading-none">
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

