"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, ClipboardCheck, User } from "lucide-react";

import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";
import { FeedCalendar } from "@/components/domain/feed/FeedCalendar";
import { getFeed } from "@/services/feed";
import { useAuthStore } from "@/store/authStore";
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
  DUPLICATE: "중복 업로드",
  MISSION_MISMATCH: "미션 불일치",
  UNCLEAR: "사진 불명확",
  INAPPROPRIATE: "부적절",
  IMAGE_UNRELATED: "무관한 이미지",
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

// ─── 기간 버튼 레이블 ──────────────────────────────────────────

function formatPeriodLabel(period: FeedPeriod | null): string {
  if (!period) return "기간";
  const fmt = (d: string) => {
    const parts = d.split("-");
    return `${Number(parts[1])}/${Number(parts[2])}`;
  };
  return `${fmt(period.start_date)}~${fmt(period.end_date)}`;
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
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
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

// ─── 서브 컴포넌트 ────────────────────────────────────────────

function StatusBadge({ status }: { status: CertificationStatus }) {
  const { badge, badgeClass } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${badgeClass}`}>
      {badge}
    </span>
  );
}

function NicknameAvatar({ nickname, crewId }: { nickname: string; crewId: number }) {
  const displayChar = (nickname && nickname.charAt(0).toUpperCase()) || "?";
  return (
    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${getAvatarClass(crewId)}`}>
      {displayChar}
    </div>
  );
}

function CertificationCard({ item }: { item: FeedItem }) {
  const rejectReason = formatRejectReason(item.reject_reason_code);
  const decisionType = formatDecisionType(item.decision_type);
  const detailParts = [formatTime(item.server_time), rejectReason, decisionType].filter(Boolean);

  return (
    <Link
      href={`/my/certifications/${item.mission_log_id}`}
      className="flex items-center gap-3 bg-card rounded-card shadow-card border border-text-secondary/10 px-4 py-3 animate-feed-in hover:shadow-card-elevated active:scale-[0.99] transition-all"
    >
      <NicknameAvatar nickname={item.nickname} crewId={item.crew_id} />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-text-primary truncate leading-snug">
          {item.nickname}
          <span className="font-normal text-text-secondary mx-1">·</span>
          {item.crew_name}
        </p>
        <p className="text-xs text-text-secondary/70 truncate">{detailParts.join(" · ")}</p>
        {item.reject_reason_code === "OTHER" && item.reject_memo && (
          <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">"{item.reject_memo}"</p>
        )}
        {item.caption && (
          <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">{item.caption}</p>
        )}
      </div>
      <StatusBadge status={item.certification_status} />
      <ChevronRight size={14} className="shrink-0 text-text-secondary/30" />
    </Link>
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

// ─── 크루 커스텀 드롭다운 ─────────────────────────────────────

interface CrewDropdownProps {
  availableCrews: AvailableCrew[];
  selectedCrewId: number | null;
  onSelect: (crewId: number | null) => void;
}

function CrewDropdown({ availableCrews, selectedCrewId, onSelect }: CrewDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const selectedLabel =
    selectedCrewId === null
      ? "전체 크루"
      : (availableCrews.find((c) => c.crew_id === selectedCrewId)?.crew_name ?? "전체 크루");

  const options: { id: number | null; label: string }[] = [
    { id: null, label: "전체 크루" },
    ...availableCrews.map((c) => ({ id: c.crew_id, label: c.crew_name })),
  ];

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full h-8 pl-3 pr-2 flex items-center justify-between gap-1 text-xs font-medium rounded-lg border transition-colors ${
          selectedCrewId !== null
            ? "bg-[var(--color-primary-green)]/10 border-[var(--color-primary-green)] text-[var(--color-primary-green)]"
            : "bg-card border-text-secondary/20 text-text-primary"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[120px] bg-card border border-text-secondary/15 rounded-xl shadow-lg overflow-hidden">
          {options.map((opt) => {
            const isSelected = opt.id === selectedCrewId;
            return (
              <button
                key={opt.id ?? "all"}
                type="button"
                onClick={() => {
                  onSelect(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-left transition-colors hover:bg-text-secondary/5 active:bg-text-secondary/10 ${
                  isSelected ? "text-[var(--color-primary-green)]" : "text-text-primary"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={12} className="shrink-0 text-[var(--color-primary-green)]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 인라인 필터 바 ───────────────────────────────────────────

interface InlineFilterBarProps {
  availableCrews: AvailableCrew[];
  selectedCrewId: number | null;
  onCrewChange: (crewId: number | null) => void;
  showMyOnly: boolean;
  onToggleMyOnly: () => void;
  myMemberUuid: string | undefined;
  period: FeedPeriod | null;
  isCalendarOpen: boolean;
  onToggleCalendar: () => void;
}

function InlineFilterBar({
  availableCrews,
  selectedCrewId,
  onCrewChange,
  showMyOnly,
  onToggleMyOnly,
  myMemberUuid,
  period,
  isCalendarOpen,
  onToggleCalendar,
}: InlineFilterBarProps) {
  const periodActive = period !== null;

  return (
    <div className="px-4 flex items-center gap-2">
      {/* 크루 커스텀 드롭다운 */}
      <CrewDropdown
        availableCrews={availableCrews}
        selectedCrewId={selectedCrewId}
        onSelect={onCrewChange}
      />

      {/* 내 인증만 토글 */}
      <button
        type="button"
        onClick={onToggleMyOnly}
        disabled={!myMemberUuid}
        className={`shrink-0 flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          showMyOnly
            ? "bg-[var(--color-primary-green)] text-white"
            : "bg-card border border-text-secondary/20 text-text-secondary"
        }`}
      >
        <User size={11} />
        내 인증만
      </button>

      {/* 기간 버튼 */}
      <button
        type="button"
        onClick={onToggleCalendar}
        className={`shrink-0 flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${
          periodActive || isCalendarOpen
            ? "bg-[var(--color-primary-green)]/10 border border-[var(--color-primary-green)] text-[var(--color-primary-green)]"
            : "bg-card border border-text-secondary/20 text-text-secondary"
        }`}
      >
        {formatPeriodLabel(period)}
        <ChevronDown size={11} />
      </button>
    </div>
  );
}

// ─── 페이지 ────────────────────────────────────────────────────

export default function CertificationsPage() {
  const myMemberUuid = useAuthStore((s) => s.user?.member_uuid);

  const [availableCrews, setAvailableCrews] = useState<AvailableCrew[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [showMyOnly, setShowMyOnly] = useState(false);
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

  // 내 인증만 토글 → 상태 필터 → 날짜 그룹핑
  const baseItems = useMemo(() => {
    if (showMyOnly && !myMemberUuid) return [];
    if (showMyOnly && myMemberUuid) return items.filter((i) => i.member_uuid === myMemberUuid);
    return items;
  }, [items, showMyOnly, myMemberUuid]);

  const filteredGroups = useMemo(() => {
    const filtered = baseItems.filter((item) =>
      matchesStatusFilter(item.certification_status, statusFilter),
    );
    return groupByDate(filtered);
  }, [baseItems, statusFilter]);

  const filteredCount = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-transparent">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header title="인증 이력" showBackButton />

        <div className="flex flex-col gap-4 pt-4">
          {isLoading ? (
            <>
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
                  items={baseItems}
                  activeFilter={statusFilter}
                  onSelect={setStatusFilter}
                />
              </div>

              {/* 2. 한 줄 필터 바: 크루 ▼ / 내 인증만 / 기간 ▼ */}
              <InlineFilterBar
                availableCrews={availableCrews}
                selectedCrewId={selectedCrewId}
                onCrewChange={handleCrewChange}
                showMyOnly={showMyOnly}
                onToggleMyOnly={() => setShowMyOnly((v) => !v)}
                myMemberUuid={myMemberUuid}
                period={period}
                isCalendarOpen={isCalendarOpen}
                onToggleCalendar={() => setIsCalendarOpen((v) => !v)}
              />
              {isCalendarOpen && (
                <div className="px-4">
                  <FeedCalendar
                    currentPeriod={period}
                    onApply={handlePeriodApply}
                    onClear={handlePeriodClear}
                    onClose={() => setIsCalendarOpen(false)}
                  />
                </div>
              )}

              {/* 3. 인증 리스트 */}
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
