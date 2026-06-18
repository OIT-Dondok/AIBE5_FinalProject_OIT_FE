"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Bell, ShieldCheck, HelpCircle } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { ApplicationsTab } from "@/components/domain/host/applications/ApplicationsTab";
import { HostConsoleTabs } from "@/components/domain/host/HostConsoleTabs";
import type { HostTab } from "@/components/domain/host/hostConsoleTypes";
import { HostSummaryCard } from "@/components/domain/host/HostSummaryCard";
import { NoticesTab } from "@/components/domain/host/notices/NoticesTab";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { VerificationTab } from "@/components/domain/host/verification/VerificationTab";
import { getHostCrewDetail } from "@/mocks/data/host";
import { getCrewApplications, getCrewNotices } from "@/services/crew";

export default function HostConsoleClient() {
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<HostTab>(
    tabParam === "verification" || tabParam === "applications" || tabParam === "notices"
      ? tabParam
      : "verification"
  );

  useEffect(() => {
    if (tabParam === "verification" || tabParam === "applications" || tabParam === "notices") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [pendingApplicationCount, setPendingApplicationCount] = useState(0);
  const [noticeCount, setNoticeCount] = useState(0);
  const [tabRefreshKey, setTabRefreshKey] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleTabChange = (tab: HostTab) => {
    setActiveTab(tab);
    setTabRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (crewId === null) return;
    getCrewNotices(crewId)
      .then((res) => setNoticeCount(res.data.items.length))
      .catch(() => setNoticeCount(0));
  }, [crewId]);

  useEffect(() => {
    if (crewId === null) return;
    getCrewApplications(crewId, { status: "PENDING" })
      .then((res) => setPendingApplicationCount(res.data.items.length))
      .catch(() => setPendingApplicationCount(0));
  }, [crewId]);


  if (crewId === null) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
          <Header showBackButton title="운영 콘솔" />
          <div className="px-5 pt-5">
            <SectionCard isTabContent={false}>
              <EmptyState
                icon={<ShieldCheck size={44} className="text-text-secondary" />}
                title="크루 정보를 찾을 수 없어요"
                description="올바른 크루 주소로 다시 접근해주세요."
              />
            </SectionCard>
          </div>
        </div>
      </main>
    );
  }

  const crewDetail = getHostCrewDetail(crewId);

  if (!crewDetail.isHost) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
          <Header showBackButton title="운영 콘솔" />
          <div className="px-5 pt-5">
            <SectionCard isTabContent={false}>
              <EmptyState
                icon={<ShieldCheck size={44} className="text-text-secondary" />}
                title="방장만 접근할 수 있어요"
                description="운영 콘솔은 크루 방장에게만 제공됩니다."
              />
            </SectionCard>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header
          showBackButton
          title="운영 콘솔"
          rightElement={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                aria-label="운영 가이드 열기"
                className="p-1 hover:opacity-75 active:scale-95 transition-all text-text-primary"
              >
                <HelpCircle size={22} className="text-text-primary" />
              </button>
              <Bell size={22} className="text-text-primary" />
            </div>
          }
        />

        <div className="px-5 pt-5 flex flex-col gap-4">
          <HostSummaryCard crewDetail={crewDetail} />
          <div className="flex flex-col">
            <HostConsoleTabs
              activeTab={activeTab}
              pendingReviewCount={pendingReviewCount}
              pendingApplicationCount={pendingApplicationCount}
              noticeCount={noticeCount}
              onTabChange={handleTabChange}
            />

            {activeTab === "verification" && (
              <VerificationTab key={tabRefreshKey} onPendingCountChange={setPendingReviewCount} />
            )}
            {activeTab === "applications" && (
              <ApplicationsTab key={tabRefreshKey} onPendingCountChange={setPendingApplicationCount} />
            )}
            {activeTab === "notices" && <NoticesTab key={tabRefreshKey} />}
          </div>
        </div>
      </div>

      <BottomSheet
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        ariaLabel="운영 가이드"
      >
        <div className="px-5 pb-8 pt-4">
          <div className="flex items-center gap-2 pb-4 border-b border-text-secondary/10">
            <div>
              <h2 className="text-base font-bold text-text-primary">운영콘솔 사용방법</h2>
              <p className="text-xs font-semibold text-text-secondary mt-0.5">성공적인 크루 운영을 위한 가이드</p>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-text-primary">
            <div>
              <h3 className="font-extrabold text-xs text-[#4C73D9] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4C73D9]" />
                인증 검증 탭
              </h3>
              <p className="mt-1 text-xs text-text-secondary font-medium">
                크루원들이 올린 인증 내역을 수동 검수합니다. 
                사진 속 메타데이터(Exif 촬영 일시)의 유효성과 중복 업로드 여부를 확인해 적절히 **승인** 또는 **거절**해 주세요.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-xs text-[#D89B4C] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D89B4C]" />
                가입 신청 탭
              </h3>
              <p className="mt-1 text-xs text-text-secondary font-medium">
                크루 가입을 대기 중인 신청 목록입니다. 
                멤버의 프로필을 검토한 후 승인 시 해당 멤버의 보증금이 확정(LOCKED)되며 크루원으로 합류합니다.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-xs text-[#5E9B73] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5E9B73]" />
                공지 관리 탭
              </h3>
              <p className="mt-1 text-xs text-text-secondary font-medium">
                전체 크루원에게 전파할 핵심 규칙이나 격려의 말을 공지글로 올릴 수 있으며, 멤버들의 반응과 댓글 피드백을 모니터링합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGuideOpen(false)}
            className="mt-6 w-full rounded-xl bg-primary-green py-3.5 text-center text-sm font-extrabold text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            확인했어요
          </button>
        </div>
      </BottomSheet>

    </main>
  );
}
