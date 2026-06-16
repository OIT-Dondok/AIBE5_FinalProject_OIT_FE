"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Check, UserCheck, X } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { formatDate, formatTime } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { useAuthStore } from "@/store/authStore";
import {
  getCrewApplications as fetchCrewApplications,
  approveCrewApplication,
  rejectCrewApplication,
} from "@/services/crew";
import type { ApplicationListItem } from "@/types/domain";

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

function getApplicationVisibleStatus(item: ApplicationListItem): ApplicationVisibleStatus {
  if (item.status === "LOCKED") return "LOCKED";
  if (item.status === "REJECTED") return "REJECTED";
  return "PENDING";
}

function ApplicationCard({
  item,
  visibleStatus,
  isProcessing,
  onApproveClick,
  onRejectClick,
}: {
  item: ApplicationListItem;
  visibleStatus: ApplicationVisibleStatus;
  isProcessing: boolean;
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
          <HostActionButton variant="reject" icon={<X size={16} strokeWidth={2.8} />} onClick={onRejectClick} disabled={isProcessing}>
            거절
          </HostActionButton>
          <HostActionButton variant="approve" icon={<Check size={16} strokeWidth={2.8} />} onClick={onApproveClick} disabled={isProcessing}>
            승인
          </HostActionButton>
        </div>
      )}
    </article>
  );
}

type ApplicationsTabProps = {
  onPendingCountChange?: (count: number) => void;
};

export function ApplicationsTab({ onPendingCountChange }: ApplicationsTabProps) {
  const [applicationFilter, setApplicationFilter] = useState<ApplicationFilter>("PENDING");
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [confirmTarget, setConfirmTarget] = useState<{
    item: ApplicationListItem;
    decision: ApplicationDecision;
  } | null>(null);
  const [toastDecision, setToastDecision] = useState<{ type: ApplicationDecision; seq: number } | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const onPendingCountChangeRef = useRef(onPendingCountChange);
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const myUuid = useAuthStore((s) => s.user?.member_uuid);

  useEffect(() => {
    onPendingCountChangeRef.current = onPendingCountChange;
  }, [onPendingCountChange]);

  const loadApplications = useCallback(async () => {
    if (crewId === null) return;
    try {
      const [pendingRes, lockedRes, rejectedRes] = await Promise.all([
        fetchCrewApplications(crewId, { status: "PENDING" }),
        fetchCrewApplications(crewId, { status: "LOCKED" }),
        fetchCrewApplications(crewId, { status: "REJECTED" }),
      ]);
      const all = [
        ...pendingRes.data.items,
        ...lockedRes.data.items,
        ...rejectedRes.data.items,
      ].filter((item) => item.member_uuid !== myUuid);
      setApplications(all);
      onPendingCountChangeRef.current?.(
        pendingRes.data.items.filter((item) => item.member_uuid !== myUuid).length,
      );
    } catch {
      setApplications([]);
    }
  }, [crewId, myUuid]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

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

  const applicationsWithStatus = applications.map((item) => ({
    item,
    visibleStatus: getApplicationVisibleStatus(item),
  }));
  const counts = applicationsWithStatus.reduce(
    (acc, { visibleStatus }) => {
      acc[visibleStatus] += 1;
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

  const handleConfirmDecision = async () => {
    if (!confirmTarget || crewId === null) return;
    const { item, decision } = confirmTarget;
    setConfirmTarget(null);
    setProcessingId(item.crew_participant_id);
    try {
      if (decision === "approved") {
        await approveCrewApplication(crewId, item.crew_participant_id);
      } else {
        await rejectCrewApplication(crewId, item.crew_participant_id);
      }
      setToastDecision((prev) => ({ type: decision, seq: (prev?.seq ?? 0) + 1 }));
      setApplicationFilter(decision === "approved" ? "LOCKED" : "REJECTED");
      await loadApplications();
    } catch {
      // API 실패 시 상태 유지
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div className="py-1">
          <h2 className="text-sm font-bold text-text-primary">가입 신청 목록</h2>
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
              isProcessing={processingId === item.crew_participant_id}
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
              <HostActionButton variant="cancel" onClick={() => setConfirmTarget(null)}>
                취소
              </HostActionButton>
              <HostActionButton
                variant={confirmTarget.decision === "approved" ? "approve" : "danger"}
                onClick={handleConfirmDecision}
              >
                {confirmTarget.decision === "approved" ? "승인" : "거절"}
              </HostActionButton>
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
