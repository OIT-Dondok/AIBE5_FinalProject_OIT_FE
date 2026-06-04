"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ShieldCheck } from "lucide-react";

import { MOCK_CREWS } from "@/mocks/data/crews";
import { getCrewApplications, type HostCrewDetailMock } from "@/mocks/data/host";

export function HostSummaryCard({ crewDetail }: { crewDetail: HostCrewDetailMock }) {
  const router = useRouter();
  const [isCrewListOpen, setIsCrewListOpen] = useState(false);
  const crewCount = MOCK_CREWS.length;

  const handleCrewSelect = (crewId: number) => {
    setIsCrewListOpen(false);
    if (crewId === crewDetail.crew_id) return;
    router.push(`/crews/${crewId}/host-console`);
  };

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
            <p className="truncate text-[13px] font-extrabold leading-tight text-white">방장 · {crewDetail.title}</p>
            <p className="mt-1 text-xs font-semibold leading-tight text-white/90">
              다음 정산까지 <span className="font-extrabold text-white">3시간 14분</span>
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium leading-tight text-white ring-1 ring-white/25">
            내 크루 <span className="font-extrabold">{crewCount}</span>
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
            {MOCK_CREWS.map((crew) => {
              const isSelected = crew.crew_id === crewDetail.crew_id;
              const pendingApplicationCount = getCrewApplications(crew.crew_id, "PENDING").length;

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
                      {crew.title.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-text-primary">{crew.title}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-text-secondary">
                        {crew.current_participants}/{crew.max_participants}명 · 보증금{" "}
                        {crew.deposit_amount.toLocaleString()}도딘
                      </p>
                    </div>
                  </div>
                  <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-[#FCEDEC] px-2 text-[11px] font-extrabold text-[#DB5C55]">
                    {pendingApplicationCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
