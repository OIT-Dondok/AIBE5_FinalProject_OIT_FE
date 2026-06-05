"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import {
  VerificationCard,
  type VerificationModerationResult,
} from "@/components/domain/host/verification/VerificationCard";
import { REVIEW_FILTERS, REVIEW_FILTER_STYLES } from "@/components/domain/host/verification/verificationDisplay";
import { getHostCertifications, type HostReviewBucket } from "@/mocks/data/host";

type VerificationTabProps = {
  moderationResults: Record<number, VerificationModerationResult>;
  onModerationResultsChange: (results: Record<number, VerificationModerationResult>) => void;
};

export function VerificationTab({ moderationResults, onModerationResultsChange }: VerificationTabProps) {
  const [reviewFilter, setReviewFilter] = useState<HostReviewBucket>("urgent");
  const [expandedMissionLogId, setExpandedMissionLogId] = useState<number | null>(null);
  const params = useParams<{ crewId: string }>();
  const crewId = parseRouteNumber(params.crewId);

  if (crewId === null) {
    return (
      <SectionCard>
        <EmptyState icon={<ShieldCheck size={44} className="text-primary-green" />} title="인증 내역을 불러올 수 없어요" />
      </SectionCard>
    );
  }

  const certifications = getHostCertifications(crewId);
  const pendingCertifications = certifications.filter((item) => item.certification_status === "PENDING_REVIEW");
  const filteredItems = pendingCertifications.filter((item) => item.review_bucket === reviewFilter);
  const unresolvedCertifications = pendingCertifications.filter((item) => !moderationResults[item.mission_log_id]);
  const isAllReviewed = pendingCertifications.length > 0 && unresolvedCertifications.length === 0;
  const reviewCounts = REVIEW_FILTERS.reduce(
    (acc, filter) => ({
      ...acc,
      [filter.value]: unresolvedCertifications.filter((item) => item.review_bucket === filter.value).length,
    }),
    {} as Record<HostReviewBucket, number>,
  );

  const moveToNextUnresolved = (
    currentMissionLogId: number,
    nextResults: Record<number, VerificationModerationResult>,
  ) => {
    const currentBucketItems = pendingCertifications.filter((item) => item.review_bucket === reviewFilter);
    const currentIndex = currentBucketItems.findIndex((item) => item.mission_log_id === currentMissionLogId);
    const nextInCurrentBucket =
      currentBucketItems
        .slice(currentIndex + 1)
        .find((item) => !nextResults[item.mission_log_id]) ??
      currentBucketItems.slice(0, currentIndex).find((item) => !nextResults[item.mission_log_id]);

    if (nextInCurrentBucket) {
      setExpandedMissionLogId(nextInCurrentBucket.mission_log_id);
      return;
    }

    const nextBucket = REVIEW_FILTERS.find((filter) =>
      pendingCertifications.some(
        (item) => item.review_bucket === filter.value && !nextResults[item.mission_log_id],
      ),
    );

    if (nextBucket) {
      const nextItem = pendingCertifications.find(
        (item) => item.review_bucket === nextBucket.value && !nextResults[item.mission_log_id],
      );
      setReviewFilter(nextBucket.value);
      setExpandedMissionLogId(nextItem?.mission_log_id ?? null);
      return;
    }

    setExpandedMissionLogId(null);
  };

  const updateModerationResult = (missionLogId: number, result: VerificationModerationResult) => {
    const nextResults = {
      ...moderationResults,
      [missionLogId]: result,
    };
    onModerationResultsChange(nextResults);
    moveToNextUnresolved(missionLogId, nextResults);
  };

  const undoModerationResult = (missionLogId: number) => {
    const nextResults = { ...moderationResults };
    delete nextResults[missionLogId];
    onModerationResultsChange(nextResults);
    setExpandedMissionLogId(missionLogId);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          {REVIEW_FILTERS.map((filter) => {
            const isActive = reviewFilter === filter.value;
            const styles = REVIEW_FILTER_STYLES[filter.value];

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setReviewFilter(filter.value);
                  setExpandedMissionLogId(null);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive ? styles.active : styles.inactive
                }`}
              >
                <span>{filter.label}</span> <span className="font-extrabold">{reviewCounts[filter.value]}</span>
              </button>
            );
          })}
        </div>
        {/* <Button variant="primary-blue" size="sm" disabled={normalExifCount === 0} className="shrink-0">
          일괄 승인
        </Button> */}
      </div>

      {isAllReviewed && (
        <div className="flex flex-col items-center justify-center rounded-card border border-text-secondary/10 bg-card px-4 py-5 text-center shadow-sm">
          <div className="mb-1.5 flex items-center justify-center text-primary-green">
            <Check size={22} strokeWidth={3} />
          </div>
          <p className="text-[13px] font-medium text-text-secondary">모든 인증을 검토했어요</p>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<ShieldCheck size={44} className="text-primary-green" />} title="검토할 인증이 없어요" />
        </SectionCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <VerificationCard
              key={item.mission_log_id}
              item={item}
              isExpanded={expandedMissionLogId === item.mission_log_id}
              moderationResult={moderationResults[item.mission_log_id] ?? null}
              onToggle={() =>
                setExpandedMissionLogId((current) =>
                  current === item.mission_log_id ? null : item.mission_log_id,
                )
              }
              onApprove={() => updateModerationResult(item.mission_log_id, { decision: "approved" })}
              onReject={(rejectReasonLabel) =>
                updateModerationResult(item.mission_log_id, { decision: "rejected", rejectReasonLabel })
              }
              onUndo={() => undoModerationResult(item.mission_log_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
