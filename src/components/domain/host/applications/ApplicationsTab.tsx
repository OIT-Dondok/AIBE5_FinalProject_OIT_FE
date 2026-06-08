"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Check, UserCheck, X } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { formatDate, formatTime } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { getCrewApplications, type HostApplicationMock } from "@/mocks/data/host";

type ApplicationFilter = ApplicationVisibleStatus | "ALL";
export type ApplicationDecision = "approved" | "rejected";
type ApplicationVisibleStatus = "PENDING" | "LOCKED" | "REJECTED";

const APPLICATION_FILTERS: Array<{ value: ApplicationFilter; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "대기" },
  { value: "LOCKED", label: "승인" },
  { value: "REJECTED", label: "거절" },
];

const TOAST_DURATION_MS = 2400;

const allFilterStyle = {
  active: "bg-[#4d73d9] text-white",
  inactive: "bg-[#E0E8FA] text-[#4d73d9]",
};

const applicationFilterStyles: Record<ApplicationVisibleStatus, { active: string; inactive: string }> = {
  PENDING: {
    active: "bg-[#D89B4C] text-white",
    inactive: "bg-[#FBF1E1] text-[#D89B4C]",
  },
  LOCKED: {
    active: "bg-primary-green text-white",
    inactive: "bg-[#E8F2EB] text-primary-green",
  },
  REJECTED: {
    active: "bg-[#D9534C] text-white",
    inactive: "bg-[#FCEDEC] text-[#D9534C]",
  },
};

function getApplicationVisibleStatus(
  item: HostApplicationMock,
  decision: ApplicationDecision | null,
): ApplicationVisibleStatus {
  if (decision === "approved") return "LOCKED";
  if (decision === "rejected") return "REJECTED";
  return "PENDING";
}

function ApplicationCard({
  item,
  visibleStatus,
  onApproveClick,
  onRejectClick,
}: {
  item: HostApplicationMock;
  visibleStatus: ApplicationVisibleStatus;
  onApproveClick: () => void;
  onRejectClick: () => void;
}) {
  const canDecide = visibleStatus === "PENDING";

  return (
    <article
      className={`rounded-card border border-text-secondary/10 bg-card px-4 py-3.5 shadow-sm transition-opacity ${
        visibleStatus !== "PENDING" ? "opacity-55 grayscale-[15%]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-blue/10 text-sm font-extrabold text-primary-blue">
            {item.nickname.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-text-primary">{item.nickname}</p>
            <p className="mt-0.5 text-xs font-medium text-text-secondary">
              신청 {formatDate(item.applied_at)} · {formatTime(item.applied_at)}
            </p>
          </div>
        </div>
        {visibleStatus !== "PENDING" && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              visibleStatus === "LOCKED" ? "bg-success-green/65 text-primary-green" : "bg-[#FCEDEC] text-[#DB5C55]"
            }`}
          >
            {visibleStatus === "LOCKED" ? "승인됨" : "거절됨"}
          </span>
        )}
      </div>

      {canDecide && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRejectClick}
            className="inline-flex h-[52px] min-h-[52px] items-center justify-center gap-1.5 rounded-xl bg-[#FCEDEC] text-base font-extrabold leading-none text-[#DB5C55] transition-colors hover:bg-[#F8DEDC]"
          >
            <X size={16} strokeWidth={2.8} />
            거절
          </button>
          <button
            type="button"
            onClick={onApproveClick}
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

type ApplicationsTabProps = {
  applicationDecisions: Record<number, ApplicationDecision>;
  onApplicationDecisionsChange: (decisions: Record<number, ApplicationDecision>) => void;
};

export function ApplicationsTab({
  applicationDecisions,
  onApplicationDecisionsChange,
}: ApplicationsTabProps) {
  const [applicationFilter, setApplicationFilter] = useState<ApplicationFilter>("PENDING");
  const [confirmTarget, setConfirmTarget] = useState<{
    item: HostApplicationMock;
    decision: ApplicationDecision;
  } | null>(null);
  const [toastDecision, setToastDecision] = useState<{ type: ApplicationDecision; seq: number } | null>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);

  useEffect(() => {
    if (!toastDecision) return;
    const timeoutId = window.setTimeout(() => setToastDecision(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [toastDecision]);

  useEffect(() => {
    if (!confirmTarget) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [confirmTarget]);

  useEffect(() => {
    if (!confirmTarget) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const firstButton = confirmDialogRef.current?.querySelector<HTMLButtonElement>("button");
    firstButton?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmTarget(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [confirmTarget]);

  if (crewId === null) {
    return (
      <SectionCard>
        <EmptyState icon={<UserCheck size={44} className="text-primary-green" />} title="신청 내역을 불러올 수 없어요" />
      </SectionCard>
    );
  }

  const applications = getCrewApplications(crewId).filter(
    (item) => item.status !== "CANCELLED" && item.status !== "EXPIRED",
  );
  const applicationsWithStatus = applications.map((item) => ({
    item,
    visibleStatus: getApplicationVisibleStatus(item, applicationDecisions[item.crew_participant_id] ?? null),
  }));
  const counts = applicationsWithStatus.reduce(
    (acc, item) => {
      acc[item.visibleStatus] += 1;
      return acc;
    },
    { PENDING: 0, LOCKED: 0, REJECTED: 0 } as Record<ApplicationVisibleStatus, number>,
  );
  const totalCount = applicationsWithStatus.length;

  const currentFilterLabel = APPLICATION_FILTERS.find((f) => f.value === applicationFilter)?.label ?? "전체";
  const filteredItems = applicationsWithStatus.filter(({ visibleStatus }) => {
    if (applicationFilter === "ALL") return true;
    return visibleStatus === applicationFilter;
  });

  const handleConfirmDecision = () => {
    if (!confirmTarget) return;

    onApplicationDecisionsChange({
      ...applicationDecisions,
      [confirmTarget.item.crew_participant_id]: confirmTarget.decision,
    });
    setToastDecision((prev) => ({ type: confirmTarget.decision, seq: (prev?.seq ?? 0) + 1 }));
    setConfirmTarget(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div className="py-1">
          <h2 className="text-sm font-bold text-text-primary">대기 중인 신청</h2>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {APPLICATION_FILTERS.map((filter) => {
            const isActive = applicationFilter === filter.value;
            const count = filter.value === "ALL" ? totalCount : counts[filter.value];
            const filterStyle = filter.value === "ALL" ? allFilterStyle : applicationFilterStyles[filter.value];

            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setApplicationFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive ? filterStyle.active : filterStyle.inactive
                }`}
              >
                <span>{filter.label}</span> <span className="font-extrabold">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-text-secondary/10 bg-card px-4 py-5 text-center shadow-sm">
          <div className="mb-1.5 flex items-center justify-center text-primary-green">
            <Check size={22} strokeWidth={3} />
          </div>
          <p className="text-[13px] font-medium text-text-secondary">{currentFilterLabel} 신청이 없어요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map(({ item, visibleStatus }) => (
            <ApplicationCard
              key={item.crew_participant_id}
              item={item}
              visibleStatus={visibleStatus}
              onApproveClick={() => setConfirmTarget({ item, decision: "approved" })}
              onRejectClick={() => setConfirmTarget({ item, decision: "rejected" })}
            />
          ))}
        </div>
      )}

      {confirmTarget && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`application-${confirmTarget.decision}-title-${confirmTarget.item.crew_participant_id}`}
          onClick={() => setConfirmTarget(null)}
        >
          <div
            ref={confirmDialogRef}
            className="w-full max-w-[340px] rounded-2xl bg-card px-5 py-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              const buttons = Array.from(confirmDialogRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
              if (buttons.length < 2) return;
              if (e.shiftKey && document.activeElement === buttons[0]) {
                e.preventDefault();
                buttons[buttons.length - 1].focus();
              } else if (!e.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
                e.preventDefault();
                buttons[0].focus();
              }
            }}
          >
            <div
              className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
                confirmTarget.decision === "approved" ? "bg-[#E8F2EB] text-primary-green" : "bg-[#FCEDEC] text-[#DB5C55]"
              }`}
            >
              {confirmTarget.decision === "approved" ? <Check size={22} strokeWidth={2.8} /> : <X size={22} strokeWidth={2.8} />}
            </div>
            <h2
              id={`application-${confirmTarget.decision}-title-${confirmTarget.item.crew_participant_id}`}
              className="mt-3 text-center text-base font-extrabold text-text-primary"
            >
              {confirmTarget.decision === "approved" ? "승인하시겠습니까?" : "거절하시겠습니까?"}
            </h2>
            <p className="mt-2 text-center text-sm font-medium leading-relaxed text-text-secondary">
              {confirmTarget.item.nickname}님의 가입 신청을{" "}
              {confirmTarget.decision === "approved" ? "승인합니다." : "거절합니다."}
              <br />
              {confirmTarget.decision === "approved" ? "승인 후 크루 참여가 확정됩니다." : "거절 후 신청 상태가 변경됩니다."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-[#EDE8DF] bg-card text-sm font-extrabold text-text-primary transition-colors hover:bg-[#EDE8DF]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                className={`inline-flex h-12 items-center justify-center rounded-xl text-sm font-extrabold text-white transition-colors ${
                  confirmTarget.decision === "approved" ? "bg-primary-green hover:bg-[#3F7A55]" : "bg-[#DB5C55] hover:bg-[#C84D46]"
                }`}
              >
                {confirmTarget.decision === "approved" ? "승인" : "거절"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastDecision && (
        <div className="fixed inset-x-0 bottom-6 z-[90] flex justify-center px-5 pointer-events-none">
          <div
            className="flex w-fit items-center gap-2.5 rounded-2xl bg-[#28251F] px-4 py-3 text-white shadow-lg"
            role="status"
            aria-live="polite"
          >
            {toastDecision.type === "approved" ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-green text-white">
                <Check size={13} strokeWidth={3} />
              </span>
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DB5C55] text-white">
                <X size={13} strokeWidth={3} />
              </span>
            )}
            <span className="text-[13px] font-extrabold">
              가입을 {toastDecision.type === "approved" ? "승인했어요" : "거절했어요"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
