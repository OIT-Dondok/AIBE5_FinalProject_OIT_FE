"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { getCrew, getCrewApplications, getCrewNotices } from "@/services/crew";
import { useAuthStore } from "@/store/authStore";
import type { CrewDetail } from "@/types/domain";

function parseHostTab(value: string | null): HostTab | null {
  return value === "verification" || value === "applications" || value === "notices"
    ? value
    : null;
}

export default function HostConsoleClient() {
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseHostTab(searchParams.get("tab")) ?? "verification";

  const { user, isInitialized } = useAuthStore();
  const [crewDetail, setCrewDetail] = useState<CrewDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(true);
  const [pendingReviewCount, setPendingReviewCount] = useState<number | null>(null);
  const [pendingApplicationCount, setPendingApplicationCount] = useState<number | null>(null);
  const [noticeCount, setNoticeCount] = useState<number | null>(null);
  const [tabRefreshKey, setTabRefreshKey] = useState(0);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const detailRequestIdRef = useRef(0);
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
    setTabRefreshKey((prev) => prev + 1);
    if (tab === "verification") setPendingReviewCount(null);
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("tab", tab);
    router.replace(`${pathname}?${nextSearchParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const requestId = detailRequestIdRef.current + 1;
    detailRequestIdRef.current = requestId;

    const loadHostConsole = async () => {
      if (!isInitialized) return;

      if (crewId === null) {
        setCrewDetail(null);
        setPendingApplicationCount(0);
        setNoticeCount(0);
        setIsDetailLoading(false);
        return;
      }

      setIsDetailLoading(true);
      setCrewDetail(null);
      setPendingApplicationCount(null);
      setNoticeCount(null);

      try {
        const [crewRes, appRes, noticeRes] = await Promise.all([
          getCrew(crewId),
          getCrewApplications(crewId, { status: "PENDING" }).catch(() => null),
          getCrewNotices(crewId).catch(() => null),
        ]);
        if (requestId !== detailRequestIdRef.current) return;
        setCrewDetail(crewRes.data);
        setPendingApplicationCount(appRes?.data.items.length ?? 0);
        setNoticeCount(noticeRes?.data.items.length ?? 0);
      } catch {
        if (requestId !== detailRequestIdRef.current) return;
        setCrewDetail(null);
      } finally {
        if (requestId !== detailRequestIdRef.current) return;
        setIsDetailLoading(false);
      }
    };

    void loadHostConsole();
  }, [crewId, isInitialized]);

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

  if (!isInitialized || isDetailLoading) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
        <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
          <Header showBackButton title="운영 콘솔" />
          <div className="px-5 pt-5 flex justify-center py-16 text-sm font-medium text-text-secondary">
            불러오는 중...
          </div>
        </div>
      </main>
    );
  }

  if (!crewDetail || crewDetail.host_member_uuid !== user?.member_uuid) {
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
