"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Bell, ShieldCheck, Trash2 } from "lucide-react";

import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Toast } from "@/components/common/Toast";
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
import { HostMoreMenu } from "@/components/domain/host/common/HostMoreMenu";
import { getHostCrewDetail } from "@/mocks/data/host";
import { disbandCrew, getCrewApplications, getCrewNotices } from "@/services/crew";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isDisbandModalOpen, setIsDisbandModalOpen] = useState(false);
  const [isDisbanding, setIsDisbanding] = useState(false);
  const [isDisbandErrorToastOpen, setIsDisbandErrorToastOpen] = useState(false);
  const [disbandErrorMessage, setDisbandErrorMessage] = useState(
    "크루 해체에 실패했어요. 다시 시도해 주세요.",
  );

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

  const handleDisband = async () => {
    if (crewId === null || isDisbanding) return;
    setIsDisbanding(true);
    try {
      await disbandCrew(crewId);
      router.push("/");
    } catch (error) {
      setIsDisbanding(false);
      setDisbandErrorMessage(
        getApiErrorMessage(
          error,
          {
            FORBIDDEN_NOT_HOST: "방장만 크루를 해체할 수 있어요.",
            CREW_NOT_FOUND: "크루를 찾을 수 없어요.",
            CREW_NOT_RECRUITING: "모집 중인 크루만 해체할 수 있어요.",
          },
          "크루 해체에 실패했어요. 다시 시도해 주세요.",
        ),
      );
      setIsDisbandErrorToastOpen(true);
    }
  };

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
            <div className="flex items-center gap-1">
              <Bell size={22} className="text-text-primary" />
              <HostMoreMenu
                isOpen={isMoreMenuOpen}
                onToggle={() => setIsMoreMenuOpen((prev) => !prev)}
                items={[
                  {
                    label: "크루 해체",
                    icon: <Trash2 size={15} strokeWidth={2.2} />,
                    tone: "danger",
                    onClick: () => { setIsMoreMenuOpen(false); setIsDisbandModalOpen(true); },
                  },
                ]}
              />
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
            <VerificationTab key={tabRefreshKey} onPendingCountChange={setPendingReviewCount} />
          )}
          {activeTab === "applications" && (
            <ApplicationsTab key={tabRefreshKey} onPendingCountChange={setPendingApplicationCount} />
          )}
          {activeTab === "notices" && <NoticesTab key={tabRefreshKey} />}
        </div>
      </div>

      <Toast
        isOpen={isDisbandErrorToastOpen}
        onClose={() => setIsDisbandErrorToastOpen(false)}
        message={disbandErrorMessage}
        type="error"
      />

      <ConfirmModal
        isOpen={isDisbandModalOpen}
        onClose={() => setIsDisbandModalOpen(false)}
        onConfirm={handleDisband}
        title="크루를 해체할까요?"
        description={"해체한 크루는 복구할 수 없어요.\n모든 멤버의 참여가 종료됩니다."}
        confirmText="해체하기"
        cancelText="취소"
        isLoading={isDisbanding}
        confirmVariant="danger"
        iconType="warning"
      />
    </main>
  );
}
