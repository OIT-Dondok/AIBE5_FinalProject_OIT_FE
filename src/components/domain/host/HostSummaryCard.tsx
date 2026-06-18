"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Pin, RefreshCw, ChevronDown, ChevronRight, Check } from "lucide-react";
import { useRouter as useNextRouter } from "next/navigation";

import type { HostCrewDetailMock } from "@/mocks/data/host";
import { getCrew, getCrewApplications, getMyCrew } from "@/services/crew";
import type { DailySettlementType, MyCrew } from "@/types/domain";
import { CATEGORY_EMOJI } from "@/constants/crew";
import { formatShortDate } from "@/utils/date";

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

const CATEGORY_BG: Record<string, string> = {
  MORNING: "bg-orange-50 text-orange-600",
  READING: "bg-amber-50 text-amber-600",
  EXERCISE: "bg-blue-50 text-blue-600",
  STUDY: "bg-violet-50 text-violet-600",
  DIET: "bg-green-50 text-green-600",
  OTHER: "bg-slate-50 text-slate-600",
};

interface StatusConfig {
  dot: string;
  text: string;
  label: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  RECRUITING: {
    dot: "bg-primary-green/60",
    text: "text-text-secondary",
    label: "모집중",
  },
  ACTIVE: {
    dot: "bg-primary-green animate-pulse",
    text: "text-primary-green",
    label: "진행중",
  },
  CLOSED: {
    dot: "bg-text-secondary/50",
    text: "text-text-secondary",
    label: "종료됨",
  },
  CANCELLED: {
    dot: "bg-red-400",
    text: "text-red-500",
    label: "취소됨",
  },
};

export function HostSummaryCard({ crewDetail }: { crewDetail: HostCrewDetailMock }) {
  const router = useNextRouter();
  const [isListOpen, setIsListOpen] = useState(false);
  const [hostCrews, setHostCrews] = useState<MyCrew[]>([]);
  const [pendingCounts, setPendingCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [settlementType, setSettlementType] = useState<DailySettlementType | null>(null);
  const [crewStatus, setCrewStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [participantsInfo, setParticipantsInfo] = useState<{ current: number; max: number } | null>(null);

  useEffect(() => {
    if (!isListOpen) return;
    const handleOutsideClick = () => setIsListOpen(false);
    const timer = setTimeout(() => {
      window.addEventListener("click", handleOutsideClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [isListOpen]);

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
        setParticipantsInfo({
          current: data.current_participants,
          max: data.max_participants,
        });
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
    if (crewId === crewDetail.crew_id) return;
    router.push(`/crews/${crewId}/host-console`);
  };

  const selectedCrew = hostCrews.find((c) => c.crew_id === crewDetail.crew_id);
  const displayTitle = selectedCrew?.title ?? crewDetail.title;
  const isRecruiting = crewStatus === "RECRUITING";

  const otherCrews = hostCrews.filter((c) => c.crew_id !== crewDetail.crew_id);

  const category = selectedCrew?.category;
  const emoji = category ? (CATEGORY_EMOJI[category] ?? "📌") : "📌";
  const categoryBg = category ? (CATEGORY_BG[category] ?? "bg-slate-50 text-slate-600") : "bg-slate-50 text-slate-600";
  const showImage = selectedCrew?.image_url;

  const statusLabel = selectedCrew ? (STATUS_CONFIG[selectedCrew.status]?.label ?? "종료됨") : "모집중";
  const statusColor = selectedCrew ? (STATUS_CONFIG[selectedCrew.status]?.text ?? "text-text-secondary") : "text-primary-blue";
  const statusDot = selectedCrew ? (STATUS_CONFIG[selectedCrew.status]?.dot ?? "bg-text-secondary/50") : "bg-primary-green/60";

  return (
    <div className="flex flex-col gap-2">
      {/* 전환 컨트롤 바 */}
      <div className="flex items-center justify-between px-1 relative">
        <span className="text-xs text-text-secondary font-extrabold flex items-center gap-1">
          <ShieldCheck size={14} className="text-primary-green" />
          현재 운영 중인 크루
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsListOpen((prev) => !prev)}
            className="flex items-center gap-1 text-[12px] font-extrabold text-primary-green hover:opacity-85 active:scale-95 transition-all focus:outline-none py-1.5 px-2 -mr-2"
          >
            <span>운영 크루 전환</span>
            <ChevronDown
              size={13}
              className={`shrink-0 text-primary-green/80 transition-transform duration-200 ${
                isListOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* w-80 사이즈로 큼직하게 확장된 팝오버 드롭다운 리스트 */}
          {isListOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E5DEC9] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col py-1.5 animate-dropdown-open">
              <div className="px-5 py-3 text-[12px] font-extrabold text-text-secondary border-b border-text-secondary/5 bg-slate-50/50">
                전환할 크루를 선택하면 즉시 이동합니다
              </div>
              {hostCrews.length === 0 ? (
                <div className="px-5 py-5 text-sm font-semibold text-text-secondary text-center">
                  운영 중인 크루가 없어요 📭
                </div>
              ) : (
                <div className="flex flex-col max-h-[280px] overflow-y-auto hover-scrollbar divide-y divide-text-secondary/5">
                  {hostCrews.map((crew) => {
                    const isCurrent = crew.crew_id === crewDetail.crew_id;
                    const pendingCount = pendingCounts[crew.crew_id] ?? 0;
                    return (
                      <button
                        key={crew.crew_id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsListOpen(false);
                          if (!isCurrent) {
                            handleCrewSelect(crew.crew_id);
                          }
                        }}
                        className={`w-full text-left px-5 py-4 flex items-center justify-between transition-colors cursor-pointer focus:outline-none ${
                          isCurrent
                            ? "bg-primary-green/5 text-primary-green hover:bg-primary-green/10"
                            : "text-text-primary hover:bg-text-secondary/5"
                        }`}
                      >
                        <span className="text-[14px] font-extrabold truncate mr-3">
                          {crew.title}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {pendingCount > 0 && (
                            <span className="text-[11px] font-extrabold text-white bg-[#D89B4C] px-2.5 py-0.5 rounded-full shrink-0">
                              신청 {pendingCount}
                            </span>
                          )}
                          {isCurrent ? (
                            <Check size={16} strokeWidth={3} className="shrink-0 text-primary-green ml-1" />
                          ) : (
                            <ChevronRight size={16} className="text-text-secondary/40 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 크루 탐색 스타일 카드 */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/crews/${crewDetail.crew_id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(`/crews/${crewDetail.crew_id}`);
          }
        }}
        className="bg-card rounded-[24px] flex flex-col border border-text-secondary/10 shadow-sm relative overflow-hidden p-5 gap-4 cursor-pointer select-none active:scale-[0.995] hover:border-text-secondary/20 hover:shadow-md transition-all duration-200"
      >
        {/* 상단: 이모지 + 크루명/상태 + 보증금 */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center text-2xl ${
              showImage ? "" : categoryBg
            }`}
          >
            {showImage ? (
              <img
                src={showImage}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              emoji
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1.5 min-w-0">
              <p className="text-[15px] font-bold text-text-primary leading-tight truncate">
                {displayTitle}
              </p>
              <ChevronRight size={15} className="text-text-secondary/50 shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot}`} />
              <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-[15px] font-extrabold text-primary-green leading-tight">
              {selectedCrew ? selectedCrew.deposit_amount.toLocaleString() : "0"}
              <span className="text-xs font-semibold ml-0.5">원</span>
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5 tracking-tight">보증금 💰</p>
          </div>
        </div>

        {/* 정산 알림 현황 바 */}
        <div className="flex flex-col gap-1.5 bg-slate-50/70 rounded-xl p-3 border border-text-secondary/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary font-medium">다음 정산 일정</span>
            <span className="text-[11px] font-bold text-text-primary">
              {isRecruiting ? (
                "크루 시작 시 카운트다운 활성화"
              ) : countdown ? (
                <>다음 정산까지 <span className="text-primary-green font-extrabold">{countdown}</span> 남음</>
              ) : (
                "정산 스케줄링 대기 중"
              )}
            </span>
          </div>
        </div>

        {/* 하단: 기간 및 멤버 수 */}
        {selectedCrew && (
          <div className="flex items-center justify-between pt-2.5 border-t border-text-secondary/10">
            <div className="relative bg-[#FFFEEA] border border-amber-200/50 shadow-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shrink-0">
              <Pin size={11} className="text-amber-600/70 rotate-45 shrink-0" />
              <span className="text-[11px] font-bold text-amber-800 tracking-tight">
                {formatShortDate(selectedCrew.start_at)} ~ {formatShortDate(selectedCrew.end_at)}
              </span>
            </div>
            {participantsInfo && (
              <span className="text-[11px] font-extrabold text-text-secondary bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/40">
                멤버 {participantsInfo.current}명 / {participantsInfo.max}명
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
