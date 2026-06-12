"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";

import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";
import { FeedCalendar } from "@/components/domain/feed/FeedCalendar";
import { FeedCrewFilter } from "@/components/domain/feed/FeedCrewFilter";
import { FeedPeriodCard } from "@/components/domain/feed/FeedPeriodCard";
import { getFeed } from "@/services/feed";
import type { AvailableCrew, CertificationStatus, FeedItem, FeedPeriod } from "@/types/domain";

// ─── 상태 설정 ────────────────────────────────────────────────

interface StatusMeta {
  badge: string;
  badgeClass: string;
}

const STATUS_CONFIG: Record<CertificationStatus, StatusMeta> = {
  PENDING_REVIEW: { badge: "검토중", badgeClass: "bg-amber-100 text-amber-700" },
  SUCCESS: { badge: "승인", badgeClass: "bg-green-100 text-green-700" },
  FAILED: { badge: "거절", badgeClass: "bg-red-100 text-red-600" },
};

type StatusFilter = "ALL" | "APPROVED" | "REJECTED" | "PENDING";

function matchesStatusFilter(status: CertificationStatus, filter: StatusFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "APPROVED") return status === "SUCCESS";
  if (filter === "REJECTED") return status === "FAILED";
  return status === "PENDING_REVIEW";
}

// ─── 거절 사유 / 검수 유형 한국어 변환 ────────────────────────

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

// ─── 아바타 색상 (crew_id 기준 고정 배정) ──────────────────────

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

// ─── 날짜 헬퍼 ────────────────────────────────────────────────

function getDateKey(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDateHeader(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── 날짜 그룹 ────────────────────────────────────────────────

interface DateGroup {
  dateKey: string;
  dateLabel: string;
  items: FeedItem[];
}

function groupByDate(items: FeedItem[]): DateGroup[] {
  const map = new Map<string, DateGroup>();
  for (const item of items) {
    const key = getDateKey(item.server_time);
    const existing = map.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(key, { dateKey: key, dateLabel: formatDateHeader(item.server_time), items: [item] });
    }
  }
  return Array.from(map.values());
}

// ─── 컴포넌트 ────────────────────────────────────────────────

function StatusBadge({ status }: { status: CertificationStatus }) {
  const { badge, badgeClass } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${badgeClass}`}>
      {badge}
    </span>
  );
}

function NicknameAvatar({ nickname, crewId }: { nickname: string; crewId: number }) {
  return (
    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${getAvatarClass(crewId)}`}>
      {nickname.charAt(0)}
    </div>
  );
}

function CertificationCard({ item }: { item: FeedItem }) {
  const rejectReason = formatRejectReason(item.reject_reason_code);
  const decisionType = formatDecisionType(item.decision_type);

  const detailParts = [formatTime(item.server_time), rejectReason, decisionType].filter(Boolean);

  return (
    <div className="flex items-center gap-3 bg-card rounded-card shadow-card border border-text-secondary/10 px-4 py-3 animate-feed-in">
      {/* 왼쪽: 닉네임 이니셜 아바타 (배경색 크루별 고정색) */}
      <NicknameAvatar nickname={item.nickname} crewId={item.crew_id} />

      {/* 중앙: 닉네임·크루명 / 시간·사유·유형 */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-text-primary truncate leading-snug">
          {item.nickname}
          <span className="font-normal text-text-secondary mx-1">·</span>
          {item.crew_name}
        </p>
        <p className="text-xs text-text-secondary/70 truncate">
          {detailParts.join(" · ")}
        </p>
        {item.caption && (
          <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{item.caption}</p>
        )}
      </div>

      {/* 오른쪽: 상태 배지 */}
      <StatusBadge status={item.certification_status} />
    </div>
  );
}

function DateGroupSection({ group }: { group: DateGroup }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs font-bold text-text-secondary whitespace-nowrap">
          {group.dateLabel} · {group.items.length}건
        </span>
        <div className="flex-1 h-px bg-text-secondary/10" />
      </div>
      {group.items.map((item) => (
        <CertificationCard key={item.mission_log_id} item={item} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-card rounded-card shadow-card border border-text-secondary/10 px-4 py-3">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="w-36 h-4 rounded" />
        <Skeleton className="w-24 h-3 rounded" />
      </div>
      <Skeleton className="w-12 h-[18px] rounded-full shrink-0" />
    </div>
  );
}

// ─── 필터 겸 요약 카드 ────────────────────────────────────────

interface FilterCardDef {
  filter: StatusFilter;
  label: string;
  count: number;
  normalClass: string;
  activeClass: string;
  countClass: string;
}

function FilterSummaryCards({
  items,
  activeFilter,
  onSelect,
}: {
  items: FeedItem[];
  activeFilter: StatusFilter;
  onSelect: (f: StatusFilter) => void;
}) {
  const approvedCount = items.filter((i) => i.certification_status === "SUCCESS").length;
  const rejectedCount = items.filter((i) => i.certification_status === "FAILED").length;
  const pendingCount = items.filter((i) => i.certification_status === "PENDING_REVIEW").length;

  const cards: FilterCardDef[] = [
    {
      filter: "ALL",
      label: "전체",
      count: items.length,
      normalClass: "bg-card border border-text-secondary/10",
      activeClass: "bg-card border-2 border-text-primary/40",
      countClass: "text-text-primary",
    },
    {
      filter: "APPROVED",
      label: "승인",
      count: approvedCount,
      normalClass: "bg-green-50",
      activeClass: "bg-green-100 ring-2 ring-green-400",
      countClass: "text-green-600",
    },
    {
      filter: "REJECTED",
      label: "거절",
      count: rejectedCount,
      normalClass: "bg-rose-50",
      activeClass: "bg-rose-100 ring-2 ring-rose-400",
      countClass: "text-rose-500",
    },
    {
      filter: "PENDING",
      label: "검토중",
      count: pendingCount,
      normalClass: "bg-amber-50",
      activeClass: "bg-amber-100 ring-2 ring-amber-400",
      countClass: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {cards.map((card) => (
        <button
          key={card.filter}
          type="button"
          onClick={() => onSelect(card.filter)}
          className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all ${
            activeFilter === card.filter ? card.activeClass : card.normalClass
          }`}
        >
          <span className="text-[10px] text-text-secondary font-medium mb-0.5">{card.label}</span>
          <span className={`text-xl font-bold leading-none ${card.countClass}`}>{card.count}</span>
        </button>
      ))}
    </div>
  );
}

// ─── 페이지 ────────────────────────────────────────────────────

export default function CertificationsPage() {
  const [availableCrews, setAvailableCrews] = useState<AvailableCrew[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [period, setPeriod] = useState<FeedPeriod | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadInitial = useCallback(
    async (crewId: number | null, currentPeriod: FeedPeriod | null) => {
      setIsLoading(true);
      setErrorMessage(null);
      setItems([]);
      setNextCursor(null);

      try {
        const { data } = await getFeed({
          crew_id: crewId ?? undefined,
          from: currentPeriod?.start_date,
          to: currentPeriod?.end_date,
          limit: 20,
        });

        setAvailableCrews(data.available_crews);
        setItems(data.feed_items);
        setNextCursor(data.next_cursor);
      } catch {
        setErrorMessage("인증 이력을 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadInitial(selectedCrewId, period);
  }, [selectedCrewId, period, loadInitial]);

  const handleCrewChange = (crewId: number | null) => {
    setSelectedCrewId(crewId);
    setStatusFilter("ALL");
  };

  const handlePeriodApply = (newPeriod: FeedPeriod) => {
    setPeriod(newPeriod);
    setIsCalendarOpen(false);
    setStatusFilter("ALL");
  };

  const handlePeriodClear = () => {
    setPeriod(null);
    setIsCalendarOpen(false);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const { data } = await getFeed({
        crew_id: selectedCrewId ?? undefined,
        from: period?.start_date,
        to: period?.end_date,
        cursor: nextCursor,
        limit: 20,
      });

      setItems((prev) => [...prev, ...data.feed_items]);
      setNextCursor(data.next_cursor);
    } catch {
      setErrorMessage("추가 데이터를 불러오지 못했어요.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 클라이언트 사이드 상태 필터 + 날짜 그룹핑
  const filteredGroups = useMemo(() => {
    const filtered = items.filter((item) =>
      matchesStatusFilter(item.certification_status, statusFilter),
    );
    return groupByDate(filtered);
  }, [items, statusFilter]);

  const filteredCount = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-transparent">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header title="인증 이력" showBackButton />

        <div className="flex flex-col gap-4 pt-4">
          {isLoading ? (
            <>
              {/* 요약 카드 스켈레톤 */}
              <div className="grid grid-cols-4 gap-2 px-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
              <div className="px-4 flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </>
          ) : errorMessage ? (
            <div className="mt-20 flex flex-col items-center gap-2 text-text-secondary">
              <ClipboardCheck size={40} className="opacity-30" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          ) : (
            <>
              {/* 1. 필터 겸 요약 카드 */}
              <div className="px-4">
                <FilterSummaryCards
                  items={items}
                  activeFilter={statusFilter}
                  onSelect={setStatusFilter}
                />
              </div>

              {/* 2. 크루 칩 필터 — FeedCrewFilter 재사용 */}
              <FeedCrewFilter
                crews={availableCrews}
                selectedCrewId={selectedCrewId}
                onSelect={handleCrewChange}
              />

              {/* 3. 날짜 필터 — FeedPeriodCard + FeedCalendar 재사용 */}
              <div className="px-4 flex flex-col gap-3">
                <FeedPeriodCard
                  period={period}
                  isCalendarOpen={isCalendarOpen}
                  onOpenCalendar={() => setIsCalendarOpen((v) => !v)}
                />
                {isCalendarOpen && (
                  <FeedCalendar
                    currentPeriod={period}
                    onApply={handlePeriodApply}
                    onClear={handlePeriodClear}
                    onClose={() => setIsCalendarOpen(false)}
                  />
                )}
              </div>

              {/* 4. 인증 리스트 */}
              <div className="px-4 flex flex-col gap-4 pb-4">
                {filteredCount === 0 ? (
                  <div className="mt-12 flex flex-col items-center gap-2 text-text-secondary">
                    <ClipboardCheck size={40} className="opacity-30" />
                    <p className="text-sm font-medium">인증 이력이 없어요</p>
                  </div>
                ) : (
                  <>
                    {filteredGroups.map((group) => (
                      <DateGroupSection key={group.dateKey} group={group} />
                    ))}
                    {nextCursor && (
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="w-full py-3 rounded-button text-sm font-semibold text-text-secondary bg-card border border-text-secondary/15 hover:bg-text-secondary/5 active:bg-text-secondary/10 disabled:opacity-50 transition-colors"
                      >
                        {isLoadingMore ? "불러오는 중..." : "더 보기"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
