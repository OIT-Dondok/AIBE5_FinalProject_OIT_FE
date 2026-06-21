"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Bell, ShieldCheck, HelpCircle } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import { ApplicationsTab } from "@/components/domain/host/applications/ApplicationsTab";
import { HostConsoleTabs } from "@/components/domain/host/HostConsoleTabs";
import type { HostTab, VerificationDecision, VerificationRejectInfo } from "@/components/domain/host/hostConsoleTypes";
import { HostSummaryCard } from "@/components/domain/host/HostSummaryCard";
import { NoticesTab } from "@/components/domain/host/notices/NoticesTab";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { VerificationTab } from "@/components/domain/host/verification/VerificationTab";
import { HostGuideModal } from "@/components/domain/host/HostGuideModal";
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
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [verificationDecisionsById, setVerificationDecisionsById] = useState<Record<number, VerificationDecision>>({});

  const handleVerificationDecisionMade = useCallback((id: number, decision: VerificationDecision) => {
    setVerificationDecisionsById((prev) => ({ ...prev, [id]: decision }));
  }, []);

  const handleVerificationDecisionReverted = useCallback((id: number) => {
    setVerificationDecisionsById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const [verificationRejectsById, setVerificationRejectsById] = useState<Record<number, VerificationRejectInfo>>({});

  const handleVerificationRejectInfoSet = useCallback((id: number, info: VerificationRejectInfo) => {
    setVerificationRejectsById((prev) => ({ ...prev, [id]: info }));
  }, []);

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
            <SectionCard>
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
            <SectionCard>
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
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="운영 가이드 열기"
                className="p-1 hover:opacity-75 active:scale-95 transition-all"
                onClick={() => setIsGuideModalOpen(true)}
              >
                <HelpCircle size={22} className="text-text-primary" />
              </button>
              <button
                type="button"
                aria-label="알림 열기"
                className="p-1 hover:opacity-75 active:scale-95 transition-all"
                onClick={() => router.push("/notifications")}
              >
                <Bell size={22} className="text-text-primary" />
              </button>
            </div>
          }
        />

        <div className="px-5 pt-5 flex flex-col gap-4">
          <HostSummaryCard crewDetail={crewDetail} />
          <HostConsoleTabs
            activeTab={activeTab}
            pendingReviewCount={pendingReviewCount}
            pendingApplicationCount={pendingApplicationCount}
            noticeCount={noticeCount}
            onTabChange={handleTabChange}
          />

          {activeTab === "verification" && (
            <VerificationTab
              key={tabRefreshKey}
              onPendingCountChange={setPendingReviewCount}
              decisionsById={verificationDecisionsById}
              onDecisionMade={handleVerificationDecisionMade}
              onDecisionReverted={handleVerificationDecisionReverted}
              rejectsById={verificationRejectsById}
              onRejectInfoSet={handleVerificationRejectInfoSet}
            />
          )}
          {activeTab === "applications" && (
            <ApplicationsTab key={tabRefreshKey} onPendingCountChange={setPendingApplicationCount} />
          )}
          {activeTab === "notices" && <NoticesTab key={tabRefreshKey} />}
        </div>
      </div>
      <HostGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} />
    </main>
  );
}
