"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Bell, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Header } from "@/components/common/Header";
import {
  ApplicationsTab,
  type ApplicationDecision,
} from "@/components/domain/host/applications/ApplicationsTab";
import { HostConsoleTabs } from "@/components/domain/host/HostConsoleTabs";
import type { HostTab } from "@/components/domain/host/hostConsoleTypes";
import { HostSummaryCard } from "@/components/domain/host/HostSummaryCard";
import { NoticesTab } from "@/components/domain/host/notices/NoticesTab";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { VerificationTab } from "@/components/domain/host/verification/VerificationTab";
import type { VerificationModerationResult } from "@/components/domain/host/verification/VerificationCard";
import {
  getCrewApplications,
  getHostCertifications,
  getHostCrewDetail,
  getHostNotices,
} from "@/mocks/data/host";

export default function HostConsoleClient() {
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const [activeTab, setActiveTab] = useState<HostTab>("verification");
  const [verificationModerationResults, setVerificationModerationResults] = useState<
    Record<number, VerificationModerationResult>
  >({});
  const [applicationDecisions, setApplicationDecisions] = useState<Record<number, ApplicationDecision>>({});

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
  const certifications = getHostCertifications(crewId);
  const applications = getCrewApplications(crewId);
  const notices = getHostNotices(crewId);

  const pendingReviewCount = certifications.filter(
    (item) => item.certification_status === "PENDING_REVIEW" && !verificationModerationResults[item.mission_log_id],
  ).length;
  const pendingApplicationCount = applications.filter(
    (item) =>
      item.status !== "CANCELLED" &&
      item.status !== "EXPIRED" &&
      !applicationDecisions[item.crew_participant_id],
  ).length;

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
        <Header showBackButton title="운영 콘솔" rightElement={<Bell size={22} className="text-text-primary" />} />

        <div className="px-5 pt-5 flex flex-col gap-4">
          <HostSummaryCard crewDetail={crewDetail} />
          <HostConsoleTabs
            activeTab={activeTab}
            pendingReviewCount={pendingReviewCount}
            pendingApplicationCount={pendingApplicationCount}
            noticeCount={notices.length}
            onTabChange={setActiveTab}
          />

          {activeTab === "verification" && (
            <VerificationTab
              moderationResults={verificationModerationResults}
              onModerationResultsChange={setVerificationModerationResults}
            />
          )}
          {activeTab === "applications" && (
            <ApplicationsTab
              applicationDecisions={applicationDecisions}
              onApplicationDecisionsChange={setApplicationDecisions}
            />
          )}
          {activeTab === "notices" && <NoticesTab />}
        </div>
      </div>
    </main>
  );
}
