"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, UserCheck, X } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { HostActionButton } from "@/components/domain/host/common/HostActionButton";
import { formatDate, formatTime } from "@/components/domain/host/hostFormatters";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { useAuthStore } from "@/store/authStore";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Toast } from "@/components/common/Toast";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
  getCrewApplications as fetchCrewApplications,
  approveCrewApplication,
  rejectCrewApplication,
} from "@/services/crew";
import { getMemberProfile } from "@/services/member";
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
  active: "bg-[#4C73D9]/10 text-[#4C73D9] border border-[#4C73D9]/25 font-extrabold shadow-sm",
  inactive: "bg-white text-text-secondary border border-text-secondary/15 hover:bg-slate-50",
};

const applicationFilterStyles: Record<ApplicationVisibleStatus, { active: string; inactive: string }> = {
  PENDING: {
    active: "bg-[#D89B4C]/10 text-[#D89B4C] border border-[#D89B4C]/25 font-extrabold shadow-sm",
    inactive: "bg-white text-text-secondary border border-text-secondary/15 hover:bg-slate-50",
  },
  LOCKED: {
    active: "bg-primary-green/10 text-primary-green border border-primary-green/25 font-extrabold shadow-sm",
    inactive: "bg-white text-text-secondary border border-text-secondary/15 hover:bg-slate-50",
  },
  REJECTED: {
    active: "bg-[#D9534C]/10 text-[#D9534C] border border-[#D9534C]/25 font-extrabold shadow-sm",
    inactive: "bg-white text-text-secondary border border-text-secondary/15 hover:bg-slate-50",
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
      className={`rounded-[24px] border border-text-secondary/10 bg-card px-5 py-4 shadow-sm transition-opacity ${
        visibleStatus !== "PENDING" ? "opacity-55 grayscale-[15%]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/members/${item.member_uuid}`}
          className="flex min-w-0 items-center gap-3 hover:opacity-80 active:opacity-60 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <div aria-hidden="true" className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden text-sm font-extrabold text-primary-blue bg-primary-blue/10 border border-primary-blue/10 shadow-inner">
            {item.profile_image_url ? (
              <img
                src={item.profile_image_url}
                alt={`${item.nickname} 프로필 이미지`}
                className="w-full h-full object-cover"
              />
            ) : (
              item.nickname.slice(0, 1)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-text-primary">{item.nickname}</p>
            <p className="mt-0.5 text-xs font-medium text-text-secondary">
              신청 {formatDate(item.applied_at)} · {formatTime(item.applied_at)}
            </p>
          </div>
        </Link>
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
  const [isLoading, setIsLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<{
    item: ApplicationListItem;
    decision: ApplicationDecision;
  } | null>(null);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const onPendingCountChangeRef = useRef(onPendingCountChange);
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const myUuid = useAuthStore((s) => s.user?.member_uuid);

  const loadApplications = useCallback(async () => {
    if (crewId === null) return;
    setIsLoading(true);
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

      // 프로필 이미지 누락 보완 (백엔드에서 profile_image_url이 null로 내려오는 현상 방어)
      // 중복 member_uuid를 제거한 후 3개씩 배치 처리하여 과도한 병렬 네트워크 요청 방지
      const missingProfileUuids = Array.from(
        new Set(
          all
            .filter((item) => !item.profile_image_url)
            .map((item) => item.member_uuid)
        )
      );

      const uuidToProfileMap = new Map<string, string | null>();
      const batchSize = 3;

      for (let i = 0; i < missingProfileUuids.length; i += batchSize) {
        const batch = missingProfileUuids.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (uuid) => {
            try {
              const profileRes = await getMemberProfile(uuid);
              uuidToProfileMap.set(uuid, profileRes.data.profile_image_url || null);
            } catch (err) {
              uuidToProfileMap.set(uuid, null);
            }
          })
        );
      }

      const allWithProfiles = all.map((item) => {
        if (!item.profile_image_url) {
          const profileImg = uuidToProfileMap.get(item.member_uuid);
          return {
            ...item,
            profile_image_url: profileImg || null,
          };
        }
        return item;
      });

      setApplications(allWithProfiles);
      onPendingCountChangeRef.current?.(
        pendingRes.data.items.filter((item) => item.member_uuid !== myUuid).length,
      );
    } catch (error) {
      setApplications([]);
      onPendingCountChangeRef.current?.(0);
      setToastMessage(
        getApiErrorMessage(
          error,
          {
            CREW_ACCESS_DENIED: "이 크루의 신청 목록에 접근할 수 없어요.",
            FORBIDDEN_NOT_HOST: "방장만 신청을 관리할 수 있어요.",
          },
          "신청 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
        ),
      );
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [crewId, myUuid]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

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
      setToastMessage(decision === "approved" ? "가입을 승인했어요" : "가입을 거절했어요");
      setToastType(decision === "approved" ? "success" : "error");
      setIsToastOpen(true);
      await loadApplications();
    } catch (error) {
      setToastMessage(
        getApiErrorMessage(
          error,
          {
            CAPACITY_FULL: "정원이 가득 차 승인할 수 없어요.",
            APPLICATION_NOT_APPROVABLE: "승인할 수 없는 신청이에요.",
            APPLICATION_NOT_REJECTABLE: "거절할 수 없는 신청이에요.",
            SETTLEMENT_INPUT_FROZEN: "정산이 시작되어 더 이상 처리할 수 없어요.",
            FORBIDDEN_NOT_HOST: "방장만 처리할 수 있어요.",
          },
          decision === "approved"
            ? "승인 처리에 실패했어요. 잠시 후 다시 시도해 주세요."
            : "거절 처리에 실패했어요. 잠시 후 다시 시도해 주세요.",
        ),
      );
      setToastType("error");
      setIsToastOpen(true);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SectionCard className="p-5 flex flex-col gap-4">
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
                <span>{filter.label}</span>{" "}
                <span className="inline-flex min-w-[2ch] justify-center">
                  {isLoading ? (
                    <span className="h-[10px] w-[14px] animate-pulse rounded bg-current opacity-20 self-center" />
                  ) : (
                    <span className="font-extrabold">{count}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-[#E5DEC9] bg-slate-50/50 px-4 py-5 text-center shadow-sm">
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

      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDecision}
        title={confirmTarget?.decision === "approved" ? "승인하시겠습니까?" : "거절하시겠습니까?"}
        description={`${confirmTarget?.item.nickname}님의 가입 신청을 ${confirmTarget?.decision === "approved" ? "승인합니다." : "거절합니다."}\n${confirmTarget?.decision === "approved" ? "승인 후 크루 참여가 확정됩니다." : "거절 후 신청 상태가 변경됩니다."}`}
        confirmText={confirmTarget?.decision === "approved" ? "승인" : "거절"}
        cancelText="취소"
        confirmVariant={confirmTarget?.decision === "approved" ? "primary-green" : "danger"}
        iconType={confirmTarget?.decision === "approved" ? "success" : "error"}
      />

      <Toast
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
        message={toastMessage}
        type={toastType}
      />
    </SectionCard>
  );
}
