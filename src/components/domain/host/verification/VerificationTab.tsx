"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/common/EmptyState";
import { Toast } from "@/components/common/Toast";
import type { ToastType } from "@/components/common/Toast";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import {
  VerificationCard,
} from "@/components/domain/host/verification/VerificationCard";
import {
  REVIEW_FILTERS,
  REVIEW_FILTER_STYLES,
} from "@/components/domain/host/verification/verificationDisplay";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
  approveMissionLog,
  getReviewableMissionLogs,
  rejectMissionLog,
} from "@/services/moderation";
import type {
  MissionLogReviewBucket,
  RejectReasonCode,
  ReviewableMissionLog,
} from "@/types/domain";
import type { HostCertificationMock } from "@/mocks/data/host";

type VerificationTabProps = {
  onPendingCountChange?: (count: number) => void;
};

const EMPTY_COUNTS: Record<MissionLogReviewBucket, number> = {
  urgent: 0,
  warning: 0,
  normal: 0,
};

const VERIFICATION_ERROR_FALLBACK =
  "검토 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";

const ERROR_MESSAGES: Record<string, string> = {
  FORBIDDEN_NOT_HOST: "방장만 인증을 검토할 수 있어요.",
  MISSION_LOG_NOT_REVIEWABLE: "이미 처리되었거나 검토 가능 시간이 지난 인증이에요.",
  SETTLEMENT_INPUT_FROZEN: "정산이 시작되어 더 이상 검토할 수 없어요.",
  REJECT_MEMO_REQUIRED: "기타 사유를 입력해 주세요.",
  REJECT_MEMO_TOO_LONG: "기타 사유는 50자 이내로 입력해 주세요.",
  INVALID_INPUT: "입력한 검토 정보를 확인해 주세요.",
};

function toCardItem(item: ReviewableMissionLog): HostCertificationMock {
  return {
    mission_log_id: item.mission_log_id,
    crew_id: item.crew_id,
    member_uuid: item.member_uuid,
    nickname: item.nickname,
    image_url: item.image_url,
    submitted_at: item.server_time,
    captured_at: item.captured_at ?? item.server_time,
    exif_status: item.exif_risk === "TIME_INVALID" ? "FAILED" : item.exif_risk,
    exif_valid: item.exif_risk === "NORMAL",
    is_duplicate: item.is_duplicate,
    comment: item.caption,
    first_failed: false,
    review_bucket: item.review_bucket,
    certification_status: item.certification_status,
    decision_type: item.decision_type,
    reject_reason_code: item.reject_reason_code,
  };
}

function getErrorMessage(error: unknown) {
  return getApiErrorMessage(error, ERROR_MESSAGES, VERIFICATION_ERROR_FALLBACK);
}

export function VerificationTab({ onPendingCountChange }: VerificationTabProps) {
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);
  const [reviewFilter, setReviewFilter] = useState<MissionLogReviewBucket>("urgent");
  const [items, setItems] = useState<HostCertificationMock[]>([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [decidedIds, setDecidedIds] = useState<Set<number>>(new Set());
  const [expandedMissionLogId, setExpandedMissionLogId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");

  const updateCounts = useCallback((nextCounts: Record<MissionLogReviewBucket, number>) => {
    setCounts(nextCounts);
    onPendingCountChange?.(nextCounts.urgent + nextCounts.warning + nextCounts.normal);
  }, [onPendingCountChange]);

  const fetchItems = useCallback(async (cursor?: string) => {
    if (crewId === null) return;

    cursor ? setIsLoadingMore(true) : setIsLoading(true);
    try {
      const { data } = await getReviewableMissionLogs(crewId, {
        bucket: reviewFilter,
        cursor,
        limit: 20,
      });
      const nextItems = data.items.map(toCardItem);
      setItems((current) => cursor ? [...current, ...nextItems] : nextItems);
      setNextCursor(data.next_cursor);
      updateCounts(data.counts);
    } catch (error) {
      setToastMessage(getErrorMessage(error));
      setToastType("error");
      setIsToastOpen(true);
      if (!cursor) setItems([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [crewId, reviewFilter, updateCounts]);

  useEffect(() => {
    setExpandedMissionLogId(null);
    void fetchItems();
  }, [fetchItems]);

  const markDecided = (missionLogId: number) => {
    setDecidedIds((prev) => new Set(prev).add(missionLogId));
    setCounts((prev) => {
      const next = { ...prev, [reviewFilter]: Math.max(0, prev[reviewFilter] - 1) };
      onPendingCountChange?.(next.urgent + next.warning + next.normal);
      return next;
    });
  };

  const handleApprove = async (missionLogId: number) => {
    try {
      await approveMissionLog(missionLogId);
      markDecided(missionLogId);
      return true;
    } catch (error) {
      setToastMessage(getErrorMessage(error));
      setToastType("error");
      setIsToastOpen(true);
      return false;
    }
  };

  const handleReject = async (
    missionLogId: number,
    reason: { code: RejectReasonCode; label: string; memo?: string },
  ) => {
    try {
      await rejectMissionLog(missionLogId, {
        reject_reason_code: reason.code,
        reject_memo: reason.memo,
      });
      markDecided(missionLogId);
      return true;
    } catch (error) {
      setToastMessage(getErrorMessage(error));
      setToastType("error");
      setIsToastOpen(true);
      return false;
    }
  };

  if (crewId === null) {
    return (
      <SectionCard>
        <EmptyState icon={<ShieldCheck size={44} className="text-primary-green" />} title="인증 내역을 불러올 수 없어요" />
      </SectionCard>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {REVIEW_FILTERS.map((filter) => {
          const isActive = reviewFilter === filter.value;
          const styles = REVIEW_FILTER_STYLES[filter.value];
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setReviewFilter(filter.value)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? styles.active : styles.inactive
              }`}
            >
              {filter.label} <span className="font-extrabold">{counts[filter.value]}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <SectionCard>
          <div className="py-12 text-center text-sm font-medium text-text-secondary">인증 목록을 불러오는 중...</div>
        </SectionCard>
      ) : items.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<ShieldCheck size={44} className="text-primary-green" />} title="검토할 인증이 없어요" />
        </SectionCard>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <VerificationCard
              key={item.mission_log_id}
              item={item}
              isExpanded={expandedMissionLogId === item.mission_log_id}
              isDecided={decidedIds.has(item.mission_log_id)}
              onToggle={() => setExpandedMissionLogId((current) =>
                current === item.mission_log_id ? null : item.mission_log_id
              )}
              onApprove={() => handleApprove(item.mission_log_id)}
              onReject={(reason) => handleReject(item.mission_log_id, reason)}
            />
          ))}
          {nextCursor && (
            <button
              type="button"
              disabled={isLoadingMore}
              onClick={() => void fetchItems(nextCursor)}
              className="rounded-xl border border-text-secondary/15 bg-card px-4 py-3 text-sm font-bold text-text-primary disabled:opacity-50"
            >
              {isLoadingMore ? "불러오는 중..." : "더 보기"}
            </button>
          )}
        </div>
      )}

      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        type={toastType}
        onClose={() => setIsToastOpen(false)}
      />
    </div>
  );
}
