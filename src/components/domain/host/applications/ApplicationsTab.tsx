"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Check, UserCheck, X } from "lucide-react";

import { Chip } from "@/components/common/Chip";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDateTime } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { getCrewApplications, type HostApplicationMock } from "@/mocks/data/host";
import type { ParticipantStatus } from "@/types/domain";

type ApplicationFilter = ParticipantStatus | "ALL";

const APPLICATION_FILTERS: Array<{ value: ApplicationFilter; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "대기" },
  { value: "LOCKED", label: "승인" },
  { value: "REJECTED", label: "거절" },
];

function ApplicationCard({ item }: { item: HostApplicationMock }) {
  const canDecide = item.status === "PENDING";

  return (
    <article className="rounded-2xl border border-text-secondary/10 bg-card px-4 py-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-sm font-bold text-primary-green">
          {item.nickname.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-text-primary">{item.nickname}</p>
          </div>
          <p className="mt-1 text-xs text-text-secondary">신청 {formatDateTime(item.applied_at)}</p>
        </div>
      </div>

      {canDecide && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="inline-flex h-[52px] min-h-[52px] items-center justify-center gap-1.5 rounded-xl bg-[#FCEDEC] text-base font-extrabold leading-none text-[#DB5C55] transition-colors hover:bg-[#F8DEDC]"
          >
            <X size={16} strokeWidth={2.8} />
            거절
          </button>
          <button
            type="button"
            className="inline-flex h-[52px] min-h-[52px] items-center justify-center gap-1.5 rounded-xl bg-primary-green text-base font-extrabold leading-none text-white shadow-sm shadow-primary-green/20 transition-colors hover:bg-[#3F7A55]"
          >
            <Check size={16} strokeWidth={2.8} />
            승인
          </button>
        </div>
      )}
    </article>
  );
}

export function ApplicationsTab() {
  const [applicationFilter, setApplicationFilter] = useState<ApplicationFilter>("PENDING");
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);

  if (crewId === null) {
    return (
      <SectionCard>
        <EmptyState icon={<UserCheck size={44} className="text-primary-green" />} title="신청 내역을 불러올 수 없어요" />
      </SectionCard>
    );
  }

  const applications = getCrewApplications(crewId);
  const counts = applications.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { PENDING: 0, LOCKED: 0, REJECTED: 0, CANCELLED: 0, EXPIRED: 0 } as Record<ParticipantStatus, number>,
  );

  const filteredItems = applications.filter((item) => {
    if (applicationFilter === "ALL") return true;
    return item.status === applicationFilter;
  });

  return (
    <div className="flex flex-col gap-3">
      <SectionCard className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text-primary">가입 신청</h2>
            <p className="mt-1 text-xs text-text-secondary">방장이 참여 신청을 확인하고 처리할 수 있어요.</p>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
            대기 {counts.PENDING}
          </span>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {APPLICATION_FILTERS.map((filter) => {
            const count = filter.value === "ALL" ? applications.length : counts[filter.value];
            return (
              <Chip
                key={filter.value}
                label={`${filter.label} ${count}`}
                isActive={applicationFilter === filter.value}
                onClick={() => setApplicationFilter(filter.value)}
                className="whitespace-nowrap"
              />
            );
          })}
        </div>
      </SectionCard>

      {filteredItems.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<UserCheck size={44} className="text-primary-green" />} title="신청 내역이 없어요" />
        </SectionCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <ApplicationCard key={item.crew_participant_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
