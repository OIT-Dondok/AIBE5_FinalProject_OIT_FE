"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { parseRouteNumber } from "@/components/domain/host/hostRouteParams";
import { SectionCard } from "@/components/domain/host/SectionCard";
import { VerificationCard } from "@/components/domain/host/verification/VerificationCard";
import { REVIEW_FILTERS, REVIEW_FILTER_STYLES } from "@/components/domain/host/verification/verificationDisplay";
import { getHostCertifications, type HostReviewBucket } from "@/mocks/data/host";

export function VerificationTab() {
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
  const reviewCounts = REVIEW_FILTERS.reduce(
    (acc, filter) => ({
      ...acc,
      [filter.value]: pendingCertifications.filter((item) => item.review_bucket === filter.value).length,
    }),
    {} as Record<HostReviewBucket, number>,
  );

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
                className={`rounded-[10px] px-3 py-1.5 text-[11px] font-extrabold transition-colors ${
                  isActive ? styles.active : styles.inactive
                }`}
              >
                {filter.label} {reviewCounts[filter.value]}
              </button>
            );
          })}
        </div>
        {/* <Button variant="primary-blue" size="sm" disabled={normalExifCount === 0} className="shrink-0">
          일괄 승인
        </Button> */}
      </div>

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
              onToggle={() =>
                setExpandedMissionLogId((current) =>
                  current === item.mission_log_id ? null : item.mission_log_id,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
