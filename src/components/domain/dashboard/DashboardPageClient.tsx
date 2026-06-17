"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/common/Header";
import { getDashboard } from "@/services/dashboard";
import { mockDashboard } from "@/mocks/data/dashboard";
import type { GlobalDashboardResponse } from "@/types/domain";

import { CrewDonutSection } from "./CrewDonutSection";
import { PrinciplesModal } from "./PrinciplesModal";
import {
  DashboardEmpty,
  DashboardError,
  DashboardSkeleton,
  RefreshButton,
} from "./DashboardStates";
import { mapGlobalDashboard } from "./dashboardViewModel";

function formatTodayLabel(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  return `${yy}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
}

export function DashboardPageClient() {
  const router = useRouter();

  const [isPrinciplesModalOpen, setIsPrinciplesModalOpen] = useState(false);
  const [globalData, setGlobalData] = useState<GlobalDashboardResponse | null>(
    null,
  );
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

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

  useEffect(() => {
    loadGlobal();
  }, [loadGlobal]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header
          title="대시보드"
          showBackButton
          rightElement={<RefreshButton onRefresh={loadGlobal} />}
        />

        <div className="px-5 pt-5 flex flex-col gap-4">
          {globalLoading ? (
            <DashboardSkeleton />
          ) : globalError ? (
            <DashboardError message={globalError} onRetry={loadGlobal} />
          ) : globalData && globalData.crews.length === 0 ? (
            <DashboardEmpty />
          ) : globalData ? (
            <CrewDonutSection
              crewDonuts={mapGlobalDashboard(globalData, formatTodayLabel())}
              projectionCopy={mockDashboard.projectionCopy}
              onOpenDaily={(crewId) => router.push(`/crews/${crewId}/dashboard`)}
              onOpenPrinciples={() => setIsPrinciplesModalOpen(true)}
            />
          ) : null}
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
