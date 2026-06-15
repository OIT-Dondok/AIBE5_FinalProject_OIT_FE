"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ClipboardCheck } from "lucide-react";

import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";
import { ReportSuspicionCallout } from "@/components/domain/dashboard/ReportSuspicionCallout";
import { getMissionLogDetail } from "@/services/feed";
import type { CertificationStatus, FeedItem } from "@/types/domain";

// ─── 상태 배지 설정 ────────────────────────────────────────────

interface StatusMeta {
  label: string;
  className: string;
}

const STATUS_META: Record<CertificationStatus, StatusMeta> = {
  SUCCESS: { label: "인증 완료", className: "bg-green-100 text-green-700" },
  FAILED: { label: "거절됨", className: "bg-red-100 text-red-600" },
  PENDING_REVIEW: { label: "검토중", className: "bg-amber-100 text-amber-700" },
};

// ─── 거절 사유 / 결정 방식 변환 ────────────────────────────────

const REJECT_REASON_LABEL: Record<string, string> = {
  TIME_VIOLATION: "시간 위반",
  IMAGE_UNRELATED: "무관한 이미지",
};

const DECISION_TYPE_LABEL: Record<string, string> = {
  MANUAL_APPROVE: "수동 승인",
  MANUAL_REJECT: "수동 거절",
  AUTO_APPROVE: "자동 승인",
  AUTO_REJECT: "자동 거절",
};

function formatRejectReason(code: string | null | undefined): string | null {
  if (!code) return null;
  return REJECT_REASON_LABEL[code] ?? code;
}

function formatDecisionType(type: string | null | undefined): string | null {
  if (!type) return null;
  return DECISION_TYPE_LABEL[type] ?? null;
}

// ─── 날짜 포맷 (YYYY.MM.DD HH:mm) ──────────────────────────────

function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

// ─── 아바타 색상 ────────────────────────────────────────────────

const AVATAR_PALETTE = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-600",
  "bg-sky-100 text-sky-700",
  "bg-teal-100 text-teal-700",
];

function getAvatarClass(crewId: number): string {
  return AVATAR_PALETTE[crewId % AVATAR_PALETTE.length];
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="w-full aspect-square rounded-none" />
      <div className="px-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="w-40 h-4 rounded" />
            <Skeleton className="w-28 h-3 rounded" />
          </div>
          <Skeleton className="w-16 h-6 rounded-full shrink-0" />
        </div>
        <Skeleton className="w-32 h-3 rounded" />
        <Skeleton className="w-full h-14 rounded-xl" />
      </div>
    </div>
  );
}

function ReactionRow({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).filter(([, count]) => count > 0);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([emoji, count]) => (
        <span
          key={emoji}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-card rounded-full border border-text-secondary/10 text-sm"
        >
          {emoji}
          <span className="text-xs font-semibold text-text-secondary">{count}</span>
        </span>
      ))}
    </div>
  );
}

// ─── 페이지 ────────────────────────────────────────────────────

export default function MissionLogDetailPage() {
  const params = useParams<{ missionLogId: string }>();
  const router = useRouter();
  const missionLogId = Number(params.missionLogId);

  const [item, setItem] = useState<FeedItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!missionLogId) return;

    setIsLoading(true);
    setErrorMessage(null);

    getMissionLogDetail(missionLogId)
      .then(({ data }) => setItem(data))
      .catch((err: { response?: { status?: number } }) => {
        const status = err?.response?.status;
        if (status === 404) {
          setErrorMessage("인증 기록을 찾을 수 없어요.");
        } else if (status === 403) {
          setErrorMessage("접근 권한이 없어요.");
        } else {
          setErrorMessage("인증 상세를 불러오지 못했어요.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [missionLogId]);

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-transparent">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-12">
        <Header title="인증 상세" showBackButton />

        {isLoading ? (
          <DetailSkeleton />
        ) : errorMessage ? (
          <div className="mt-24 flex flex-col items-center gap-3 px-4 text-text-secondary">
            <ClipboardCheck size={40} className="opacity-30" />
            <p className="text-sm font-medium">{errorMessage}</p>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-2 px-5 py-2 rounded-button bg-card border border-text-secondary/20 text-sm font-semibold text-text-primary hover:bg-text-secondary/5 active:bg-text-secondary/10 transition-colors"
            >
              뒤로가기
            </button>
          </div>
        ) : item ? (
          <div className="flex flex-col gap-0">
            {/* 인증 이미지 */}
            <div className="relative w-full aspect-square bg-text-secondary/10">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt="인증 이미지"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ClipboardCheck size={48} className="text-text-secondary opacity-30" />
                </div>
              )}
            </div>

            {/* 본문 섹션 */}
            <div className="flex flex-col gap-4 px-4 pt-4">
              {/* 닉네임 + 크루명 + 상태 배지 */}
              <div className="flex items-center gap-3">
                <div
                  className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${getAvatarClass(item.crew_id)}`}
                >
                  {item.profile_image_url ? (
                    <Image
                      src={item.profile_image_url}
                      alt={item.nickname}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                      unoptimized
                    />
                  ) : (
                    (item.nickname.charAt(0).toUpperCase() || "?")
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-text-primary truncate leading-snug">
                    {item.nickname}
                  </p>
                  <p className="text-xs text-text-secondary truncate">{item.crew_name}</p>
                </div>
                {(() => {
                  const meta = STATUS_META[item.certification_status];
                  return (
                    <span
                      className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                  );
                })()}
              </div>

              {/* 인증 시간 */}
              <p className="text-xs text-text-secondary">
                {formatDateTime(item.server_time)}
              </p>

              {/* 위반 사유 (거절 시만) */}
              {item.certification_status === "FAILED" && formatRejectReason(item.reject_reason_code) && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex flex-col gap-0.5">
                  <p className="text-xs font-semibold text-red-500">거절 사유</p>
                  <p className="text-sm text-red-700">{formatRejectReason(item.reject_reason_code)}</p>
                </div>
              )}

              {/* 결정 방식 */}
              {formatDecisionType(item.decision_type) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">검수 방식</span>
                  <span className="text-xs font-medium text-text-primary">
                    {formatDecisionType(item.decision_type)}
                  </span>
                </div>
              )}

              {/* 캡션 */}
              {item.caption && (
                <div className="rounded-xl bg-card border border-text-secondary/10 px-4 py-3 shadow-card">
                  <p className="text-sm text-text-primary leading-relaxed">{item.caption}</p>
                </div>
              )}

              {/* 리액션 */}
              <ReactionRow counts={item.reaction_counts} />

              {/* 부정 의심 신고 */}
              <ReportSuspicionCallout
                notice="부정 행위가 의심될 경우 운영팀에 신고해주세요."
                actionLabel="부정 의심 신고"
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
