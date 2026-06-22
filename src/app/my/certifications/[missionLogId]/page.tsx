"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ClipboardCheck, Maximize2, X } from "lucide-react";

import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";
import { ReportSuspicionCallout } from "@/components/domain/dashboard/ReportSuspicionCallout";
import { getMissionLogDetail } from "@/services/feed";
import type { CertificationStatus, MissionLogDetail } from "@/types/domain";

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
  DUPLICATE: "중복 업로드",
  MISSION_MISMATCH: "미션 불일치",
  UNCLEAR: "사진 불명확",
  INAPPROPRIATE: "부적절",
  OTHER: "기타",
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

const EXIF_RISK_LABEL: Record<string, string> = {
  NORMAL: "정상",
  MISSING: "메타데이터 없음",
  TIME_INVALID: "촬영 시각 확인 필요",
};

function formatExifRisk(risk: string | null | undefined): string {
  if (!risk) return "-";
  return EXIF_RISK_LABEL[risk] ?? risk;
}

function formatOptionalDateTime(isoString: string | null | undefined): string {
  return isoString ? formatDateTime(isoString) : "-";
}

function formatDuplicateResult(isDuplicate: boolean | null | undefined): string {
  if (isDuplicate === undefined || isDuplicate === null) return "-";
  return isDuplicate ? "있음" : "없음";
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

/**
 * 인증 이미지 확대 라이트박스.
 * 카드 썸네일(1:1 크롭)과 달리 원본 비율 전체를 표시.
 * 피드/운영 콘솔 확대와 동일한 동작(object-contain · Esc/배경 클릭 닫기 · 배경 스크롤 잠금).
 */
function ImageLightbox({
  imageUrl,
  alt,
  onClose,
}: {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="인증 이미지 확대 보기"
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
      >
        <X size={22} />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full max-w-full items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 원본 비율 표시를 위해 fill 대신 자연 크기 사용 */}
        <img
          src={imageUrl}
          alt={alt}
          className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
        />
      </div>
    </div>,
    document.body,
  );
}

function DetailSkeleton() {
  return (
    <div className="px-4 pt-4 flex flex-col gap-4">
      <div className="bg-card rounded-xl overflow-hidden shadow-card-elevated border border-text-secondary/10">
        <Skeleton className="w-full aspect-square" />
        <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="w-36 h-4 rounded" />
              <Skeleton className="w-24 h-3 rounded" />
            </div>
            <Skeleton className="w-16 h-6 rounded-full shrink-0" />
          </div>
          <Skeleton className="w-32 h-3 rounded" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
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

function VerificationInfoSection({ item }: { item: MissionLogDetail }) {
  const rejectReason = formatRejectReason(item.reject_reason_code) ?? "없음";
  const decisionType = formatDecisionType(item.decision_type);

  return (
    <section className="rounded-xl bg-text-secondary/5 border border-text-secondary/10 px-4 py-3 flex flex-col">
      <dl className="text-xs divide-y divide-text-secondary/15">
        <div className="grid grid-cols-[92px_1fr] gap-x-3 py-2">
          <dt className="text-text-secondary">촬영 시각</dt>
          <dd className="font-semibold text-text-primary text-right text-[13px]">
            {formatOptionalDateTime(item.exif_taken_at)}
          </dd>
        </div>
        <div className="grid grid-cols-[92px_1fr] gap-x-3 py-2">
          <dt className="text-text-secondary">Exif 검증</dt>
          <dd className="font-semibold text-text-primary text-right text-[13px]">{formatExifRisk(item.exif_risk)}</dd>
        </div>
        <div className="grid grid-cols-[92px_1fr] gap-x-3 py-2">
          <dt className="text-text-secondary">중복</dt>
          <dd className="font-semibold text-text-primary text-right text-[13px]">
            {formatDuplicateResult(item.is_duplicate)}
          </dd>
        </div>
        {decisionType && (
          <div className="grid grid-cols-[92px_1fr] gap-x-3 py-2">
            <dt className="text-text-secondary">검수 방식</dt>
            <dd className="font-semibold text-text-primary text-right text-[13px]">{decisionType}</dd>
          </div>
        )}
        <div className="grid grid-cols-[92px_1fr] gap-x-3 py-2">
          <dt className="text-text-secondary">방장 거절 사유</dt>
          <dd className="font-semibold text-text-primary text-right text-[13px]">{rejectReason}</dd>
        </div>
      </dl>
    </section>
  );
}

// ─── 페이지 ────────────────────────────────────────────────────

export default function MissionLogDetailPage() {
  const params = useParams<{ missionLogId: string }>();
  const router = useRouter();
  const missionLogId = Number(params.missionLogId);

  const [item, setItem] = useState<MissionLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      if (!Number.isFinite(missionLogId) || missionLogId <= 0) {
        setErrorMessage("유효하지 않은 인증 ID예요.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { data } = await getMissionLogDetail(missionLogId);
        setItem(data);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setErrorMessage("인증 기록을 찾을 수 없어요.");
        } else if (status === 403) {
          setErrorMessage("접근 권한이 없어요.");
        } else {
          setErrorMessage("인증 상세를 불러오지 못했어요.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetail();
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
          <div className="px-4 pt-4 flex flex-col gap-4">
            {/* 카드 */}
            <div className="bg-card rounded-xl overflow-hidden shadow-card-elevated border border-text-secondary/10">
              {/* 인증 이미지 (카드 상단, 부모 overflow-hidden이 코너 처리) — 탭하면 원본 비율로 확대 */}
              {item.image_url ? (
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="인증 이미지 확대"
                  className="relative block w-full aspect-square bg-text-secondary/10 cursor-zoom-in"
                >
                  <Image src={item.image_url} alt="인증 이미지" fill className="object-cover" unoptimized />
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-text-primary/55 px-2 py-1 text-[10px] font-medium text-white">
                    <Maximize2 size={11} strokeWidth={2.4} />
                    확대
                  </span>
                </button>
              ) : (
                <div className="relative w-full aspect-square bg-text-secondary/10 flex items-center justify-center">
                  <ClipboardCheck size={48} className="text-text-secondary opacity-30" />
                </div>
              )}

              {/* 본문 (카드 내부) */}
              <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
                {/* 아바타 + 닉네임/크루명(멤버 프로필 이동) + 상태 배지 */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/members/${item.member_uuid}`}
                    className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 active:opacity-60 transition-opacity"
                  >
                    <div
                      className={`shrink-0 w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold ${getAvatarClass(item.crew_id)}`}
                    >
                      {item.profile_image_url ? (
                        <Image
                          src={item.profile_image_url}
                          alt={item.nickname}
                          width={44}
                          height={44}
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        (item.nickname.charAt(0).toUpperCase() || "?")
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <p className="text-[15px] font-bold text-text-primary truncate leading-tight">
                        {item.nickname}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate">{item.crew_name}</p>
                    </div>
                  </Link>
                  {(() => {
                    const meta = STATUS_META[item.certification_status];
                    return (
                      <span
                        className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    );
                  })()}
                </div>

                {/* 인증 시간 */}
                <p className="text-xs text-text-secondary">{formatDateTime(item.server_time)}</p>

                {/* 캡션 */}
                {item.caption && (
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                    {item.caption}
                  </p>
                )}

                {/* 검증 정보 */}
                <VerificationInfoSection item={item} />

                {/* 리액션 */}
                <ReactionRow counts={item.reaction_counts} />
              </div>
            </div>

            {/* 부정 의심 신고 (카드 밖) */}
            <ReportSuspicionCallout
              notice="부정 행위가 의심될 경우 운영팀에 신고해주세요."
              actionLabel="부정 의심 신고"
            />

            {/* 인증 이미지 확대 라이트박스 */}
            {isLightboxOpen && item.image_url && (
              <ImageLightbox
                imageUrl={item.image_url}
                alt="인증 이미지"
                onClose={() => setIsLightboxOpen(false)}
              />
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
