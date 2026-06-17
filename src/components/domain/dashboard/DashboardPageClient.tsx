"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PieChart, RefreshCw } from "lucide-react";

import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";
import { getCrewDashboard, getDashboard } from "@/services/dashboard";
import { mockDashboard } from "@/mocks/data/dashboard";
import type { DashboardSectionId } from "@/mocks/data/dashboard";
import type { DashboardResponse, GlobalDashboardResponse } from "@/types/domain";

import { CrewDonutSection } from "./CrewDonutSection";
import { DailyDashboardSection } from "./DailyDashboardSection";
import { PrinciplesModal } from "./PrinciplesModal";
import { mapCrewDashboard, mapGlobalDashboard } from "./dashboardViewModel";

function formatTodayLabel(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  return `${yy}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
}

export function DashboardPageClient() {
  const router = useRouter();

  const [activeSection, setActiveSection] =
    useState<DashboardSectionId>("donuts");
  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(null);
  const [isPrinciplesModalOpen, setIsPrinciplesModalOpen] = useState(false);

  const [globalData, setGlobalData] = useState<GlobalDashboardResponse | null>(
    null,
  );
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [crewData, setCrewData] = useState<DashboardResponse | null>(null);
  const [crewLoading, setCrewLoading] = useState(false);
  const [crewError, setCrewError] = useState<string | null>(null);

  const loadGlobal = useCallback(() => {
    setGlobalLoading(true);
    setGlobalError(null);

    getDashboard()
      .then(({ data }) => setGlobalData(data))
      .catch((err: { response?: { data?: { code?: string } } }) => {
        const code = err?.response?.data?.code;
        if (code === "PARTICIPANT_NOT_FOUND") {
          setGlobalError("참여 중인 크루 정보를 찾을 수 없어요.");
        } else {
          setGlobalError("대시보드를 불러오지 못했어요.");
        }
      })
      .finally(() => setGlobalLoading(false));
  }, []);

  const loadCrew = useCallback((crewId: number) => {
    setCrewLoading(true);
    setCrewError(null);

    getCrewDashboard(crewId)
      .then(({ data }) => setCrewData(data))
      .catch((err: { response?: { data?: { code?: string } } }) => {
        const code = err?.response?.data?.code;
        if (code === "CREW_NOT_FOUND") {
          setCrewError("크루를 찾을 수 없어요.");
        } else if (code === "CREW_ACCESS_DENIED") {
          setCrewError("이 크루의 대시보드에 접근할 수 없어요.");
        } else if (code === "PARTICIPANT_NOT_FOUND") {
          setCrewError("크루 참여 정보를 찾을 수 없어요.");
        } else {
          setCrewError("크루 대시보드를 불러오지 못했어요.");
        }
      })
      .finally(() => setCrewLoading(false));
  }, []);

  useEffect(() => {
    loadGlobal();
  }, [loadGlobal]);

  const handleOpenDaily = (crewId: number) => {
    setSelectedCrewId(crewId);
    setActiveSection("daily");
    loadCrew(crewId);
  };

  const handleBack = () => {
    if (activeSection === "daily") {
      setActiveSection("donuts");
      return;
    }
    router.back();
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header
          title="대시보드"
          showBackButton
          onBackClick={handleBack}
          rightElement={
            <RefreshButton
              onRefresh={
                activeSection === "daily" && selectedCrewId != null
                  ? () => loadCrew(selectedCrewId)
                  : loadGlobal
              }
            />
          }
        />

        <div className="px-5 pt-5 flex flex-col gap-4">
          {activeSection === "daily" &&
            (crewLoading ? (
              <DashboardSkeleton />
            ) : crewError ? (
              <DashboardError
                message={crewError}
                onRetry={
                  selectedCrewId != null
                    ? () => loadCrew(selectedCrewId)
                    : undefined
                }
              />
            ) : crewData ? (
              <DailyDashboardSection
                dashboard={mapCrewDashboard(crewData)}
                projectionCopy={mockDashboard.projectionCopy}
                reportNotice={mockDashboard.principles.reportNotice}
                reportActionLabel={mockDashboard.principles.reportActionLabel}
              />
            ) : null)}

          {activeSection === "donuts" &&
            (globalLoading ? (
              <DashboardSkeleton />
            ) : globalError ? (
              <DashboardError message={globalError} onRetry={loadGlobal} />
            ) : globalData && globalData.crews.length === 0 ? (
              <DashboardEmpty />
            ) : globalData ? (
              <CrewDonutSection
                crewDonuts={mapGlobalDashboard(globalData, formatTodayLabel())}
                projectionCopy={mockDashboard.projectionCopy}
                onOpenDaily={handleOpenDaily}
                onOpenPrinciples={() => setIsPrinciplesModalOpen(true)}
              />
            ) : null)}
        </div>
      </div>

      {isPrinciplesModalOpen && (
        <PrinciplesModal
          principles={mockDashboard.principles}
          onClose={() => setIsPrinciplesModalOpen(false)}
        />
      )}
    </main>
  );
}

function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  return (
    <button
      type="button"
      aria-label="대시보드 새로고침"
      className="p-1 -mr-1 rounded-full text-text-secondary hover:text-text-primary"
      onClick={onRefresh}
    >
      <RefreshCw size={21} />
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-44 w-full rounded-card" />
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-16 w-full rounded-card" />
    </div>
  );
}

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mt-20 flex flex-col items-center gap-3 text-text-secondary">
      <PieChart size={40} className="opacity-30" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-button border border-text-secondary/20 bg-card px-5 py-2 text-sm font-semibold text-text-primary hover:bg-text-secondary/5"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

function DashboardEmpty() {
  return (
    <div className="mt-20 flex flex-col items-center gap-3 text-text-secondary">
      <PieChart size={40} className="opacity-30" />
      <p className="text-sm font-medium">아직 참여 중인 크루가 없어요.</p>
    </div>
  );
}
