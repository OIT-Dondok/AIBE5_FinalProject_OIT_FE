"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ShieldCheck } from "lucide-react";

import type { HostCrewDetailMock } from "@/mocks/data/host";
import { getCrew, getCrewApplications, getMyCrew } from "@/services/crew";
import type { DailySettlementType, MyCrew } from "@/types/domain";

function getNextSettlementMs(type: DailySettlementType): number {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const nowKST = new Date(now.getTime() + kstOffset);

  const todayKSTMidnight = new Date(nowKST);
  todayKSTMidnight.setUTCHours(0, 0, 0, 0);

  if (type === "A" || type === "C") {
    const target = new Date(todayKSTMidnight.getTime() + 12 * 60 * 60 * 1000 - kstOffset);
    return target > now ? target.getTime() - now.getTime() : target.getTime() + 24 * 60 * 60 * 1000 - now.getTime();
  }

  // B: next midnight KST
  const tomorrowMidnight = new Date(todayKSTMidnight.getTime() + 24 * 60 * 60 * 1000 - kstOffset);
  return tomorrowMidnight.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0시간 0분";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}시간 ${minutes}분`;
}

export function HostSummaryCard({ crewDetail }: { crewDetail: HostCrewDetailMock }) {
  const router = useRouter();
  const [isCrewListOpen, setIsCrewListOpen] = useState(false);
  const [hostCrews, setHostCrews] = useState<MyCrew[]>([]);
  const [pendingCounts, setPendingCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [settlementType, setSettlementType] = useState<DailySettlementType | null>(null);
  const [crewStatus, setCrewStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setIsLoading(true);
    getMyCrew("HOST", undefined, signal)
      .then(({ data }) => {
        if (signal.aborted) return;
        setHostCrews(data.items);
        Promise.all(
          data.items.map((crew) =>
            getCrewApplications(crew.crew_id, { status: "PENDING" })
              .then(({ data: appData }) => ({ crew_id: crew.crew_id, count: appData.items.length }))
              .catch(() => ({ crew_id: crew.crew_id, count: 0 })),
          ),
        ).then((counts) => {
          if (signal.aborted) return;
          setPendingCounts(
            Object.fromEntries(counts.map(({ crew_id, count }) => [crew_id, count])),
          );
        });
      })
      .catch(() => { if (!signal.aborted) setHostCrews([]); })
      .finally(() => { if (!signal.aborted) setIsLoading(false); });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    getCrew(crewDetail.crew_id)
      .then(({ data }) => {
        setSettlementType(data.daily_settlement_type);
        setCrewStatus(data.status);
      })
      .catch(() => {});
  }, [crewDetail.crew_id]);

  useEffect(() => {
    if (!settlementType || crewStatus === "RECRUITING") return;

    const update = () => setCountdown(formatCountdown(getNextSettlementMs(settlementType)));
    update();
    const id = window.setInterval(update, 60000);
    return () => window.clearInterval(id);
  }, [settlementType, crewStatus]);

  const handleCrewSelect = (crewId: number) => {
    setIsCrewListOpen(false);
    if (crewId === crewDetail.crew_id) return;
    router.push(`/crews/${crewId}/host-console`);
  };

  const selectedCrew = hostCrews.find((c) => c.crew_id === crewDetail.crew_id);
  const displayTitle = selectedCrew?.title ?? crewDetail.title;
  const isRecruiting = crewStatus === "RECRUITING";

  return (
    <section className="relative">
      <button
        type="button"
        onClick={() => setIsCrewListOpen((current) => !current)}
        aria-expanded={isCrewListOpen}
        className="w-full rounded-[20px] bg-[linear-gradient(135deg,#5d7fe3_0%,#6486ea_45%,#5f81e6_100%)] px-4 py-4 text-left text-white shadow-card transition-transform active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-8 shrink-0 items-center justify-center text-white">
            <ShieldCheck size={24} strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-extrabold leading-tight text-white">방장 · {displayTitle}</p>
            <p className="mt-1 text-xs font-semibold leading-tight text-white/90">
              {isRecruiting ? (
                "다음 정산까지 -"
              ) : countdown ? (
                <>다음 정산까지 <span className="font-extrabold text-white">{countdown}</span></>
              ) : null}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium leading-tight text-white ring-1 ring-white/25">
            내 크루 <span className="font-extrabold">{hostCrews.length}</span>
          </span>
          <ChevronDown
            size={18}
            strokeWidth={2.6}
            className={`shrink-0 text-white transition-transform ${isCrewListOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isCrewListOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-text-secondary/10 bg-card shadow-card">
          <div className="border-b border-text-secondary/10 px-4 pb-1.5 pt-3">
            <p className="text-[11px] font-semibold text-text-secondary">운영 중인 크루</p>
          </div>
          <div className="hover-scrollbar max-h-64 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-4 text-[13px] font-medium text-text-secondary">불러오는 중...</p>
            ) : hostCrews.length === 0 ? (
              <p className="px-4 py-4 text-[13px] font-medium text-text-secondary">운영 중인 크루가 없어요</p>
            ) : (
              hostCrews.map((crew) => {
                const isSelected = crew.crew_id === crewDetail.crew_id;
                const pendingCount = pendingCounts[crew.crew_id] ?? 0;

                return (
                  <button
                    key={crew.crew_id}
                    type="button"
                    onClick={() => handleCrewSelect(crew.crew_id)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected ? "bg-[#E0E8FA]" : "hover:bg-[#FAF7EE]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-sm font-extrabold text-[#4d73d9]">
                        {crew.title.slice(0, 1) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-text-primary">{crew.title}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-text-secondary">
                          보증금 {crew.deposit_amount.toLocaleString()}도딘
                        </p>
                      </div>
                    </div>
                    <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-[#FCEDEC] px-2 text-[11px] font-extrabold text-[#DB5C55]">
                      {pendingCount}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </section>
  );
}
