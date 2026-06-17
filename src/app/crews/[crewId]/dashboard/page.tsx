"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/common/Header";
import { DailyDashboardSection } from "@/components/domain/dashboard/DailyDashboardSection";
import {
  DashboardError,
  DashboardSkeleton,
  RefreshButton,
} from "@/components/domain/dashboard/DashboardStates";
import { mapCrewDashboard } from "@/components/domain/dashboard/dashboardViewModel";
import { mockDashboard } from "@/mocks/data/dashboard";
import { getCrewDashboard } from "@/services/dashboard";
import type { DashboardResponse } from "@/types/domain";

export default function CrewDashboardPage() {
  const router = useRouter();
  const params = useParams<{ crewId: string }>();
  const crewId = Number(params.crewId);

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 요청 시퀀스 가드: 연속 새로고침·crewId 변경 시 이전 요청이 늦게 도착해
  // 최신 상태를 덮어쓰지 않도록, 마지막 요청 결과만 반영한다.
  const requestSeq = useRef(0);

  const load = useCallback(() => {
    if (!Number.isFinite(crewId) || crewId <= 0) {
      requestSeq.current += 1; // 진행 중이던 이전 요청 무효화
      setErrorMessage("유효하지 않은 크루예요.");
      setIsLoading(false);
      return;
    }

    const seq = ++requestSeq.current;
    const isStale = () => seq !== requestSeq.current;

    setIsLoading(true);
    setErrorMessage(null);

    getCrewDashboard(crewId)
      .then(({ data: res }) => {
        if (isStale()) return;
        setData(res);
      })
      .catch((err: { response?: { data?: { code?: string } } }) => {
        if (isStale()) return;
        const code = err?.response?.data?.code;
        if (code === "CREW_NOT_FOUND") {
          setErrorMessage("크루를 찾을 수 없어요.");
        } else if (code === "CREW_ACCESS_DENIED") {
          setErrorMessage("이 크루의 대시보드에 접근할 수 없어요.");
        } else if (code === "PARTICIPANT_NOT_FOUND") {
          setErrorMessage("크루 참여 정보를 찾을 수 없어요.");
        } else {
          setErrorMessage("크루 대시보드를 불러오지 못했어요.");
        }
      })
      .finally(() => {
        if (isStale()) return;
        setIsLoading(false);
      });
  }, [crewId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-transparent flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header
          title="크루 대시보드"
          showBackButton
          onBackClick={() => router.push("/dashboard")}
          rightElement={<RefreshButton onRefresh={load} />}
        />

        <div className="px-5 pt-5 flex flex-col gap-4">
          {isLoading ? (
            <DashboardSkeleton />
          ) : errorMessage ? (
            <DashboardError message={errorMessage} onRetry={load} />
          ) : data ? (
            <DailyDashboardSection
              dashboard={mapCrewDashboard(data)}
              projectionCopy={mockDashboard.projectionCopy}
              reportNotice={mockDashboard.principles.reportNotice}
              reportActionLabel={mockDashboard.principles.reportActionLabel}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
