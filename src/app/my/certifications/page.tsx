"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Info, Loader2, MessageCircle, ShieldCheck, User } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";
import { CertificationCalendar } from "@/components/domain/certifications/CertificationCalendar";
import { PrinciplesModal } from "@/components/domain/dashboard/PrinciplesModal";
import { mockDashboard } from "@/mocks/data/dashboard";
import { getFeed } from "@/services/feed";
import { useAuthStore } from "@/store/authStore";
import type { AvailableCrew, CertificationStatus, FeedItem, FeedPeriod } from "@/types/domain";
import {
  addDaysToYmd,
  compareYmd,
  formatYmdDot,
  getKstDateKeyFromIso,
  getMsUntilNextKstDay,
  getKstTodayYmd,
  toKstDate,
} from "@/utils/date";

// ─── 상태 설정 ────────────────────────────────────────────────

interface StatusMeta {
  badge: string;
  badgeClass: string;
}

const STATUS_CONFIG: Record<CertificationStatus, StatusMeta> = {
  PENDING_REVIEW: { badge: "검토중", badgeClass: "bg-amber-100 text-amber-700" },
  SUCCESS: { badge: "승인", badgeClass: "bg-success-green text-primary-green" },
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
  return getKstDateKeyFromIso(isoString);
}

function formatDateHeader(isoString: string): string {
  const d = toKstDate(isoString);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function formatTime(isoString: string): string {
  const d = toKstDate(isoString);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
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
          <p className="flex items-center gap-1 text-xs text-amber-600/80 min-w-0 mt-0.5">
            <Info size={10} className="shrink-0" />
            <span className="truncate">{item.reject_memo}</span>
          </p>
        )}
        {item.caption && (
          <p className="flex items-center gap-1 text-xs text-text-secondary min-w-0 mt-0.5">
            <MessageCircle size={10} className="shrink-0 opacity-50" />
            <span className="truncate">{item.caption}</span>
          </p>
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
  activeClass: string;
  countColor: string;
  labelActiveColor: string;
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
      activeClass: "bg-text-secondary/5 border-2 border-text-secondary/25",
      countColor: "text-text-primary",
      labelActiveColor: "text-text-primary",
    },
    {
      filter: "APPROVED",
      label: "승인",
      count: approvedCount,
      activeClass: "bg-success-green/30 border-2 border-primary-green/40",
      countColor: "text-primary-green",
      labelActiveColor: "text-primary-green",
    },
    {
      filter: "REJECTED",
      label: "거절",
      count: rejectedCount,
      activeClass: "bg-rose-50 border-2 border-rose-400/40",
      countColor: "text-rose-500",
      labelActiveColor: "text-rose-500",
    },
    {
      filter: "PENDING",
      label: "검토중",
      count: pendingCount,
      activeClass: "bg-amber-50 border-2 border-amber-400/40",
      countColor: "text-amber-600",
      labelActiveColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {cards.map((card) => {
        const isActive = activeFilter === card.filter;
        return (
          <button
            key={card.filter}
            type="button"
            onClick={() => onSelect(card.filter)}
            className={`flex flex-col items-center justify-center py-3.5 rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.97] ${
              isActive
                ? card.activeClass
                : "bg-card border border-text-secondary/10"
            }`}
          >
            <span className={`text-[10px] font-semibold mb-1 transition-colors ${
              isActive ? card.labelActiveColor : "text-text-secondary"
            }`}>
              {card.label}
            </span>
            <span className={`text-2xl font-black leading-none tabular-nums ${card.countColor}`}>
              {card.count}
            </span>
          </button>
        );
      })}
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
        className={`w-full h-9 pl-4 pr-3 flex items-center justify-between gap-1.5 text-xs font-bold rounded-full border shadow-sm transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1 ${
          selectedCrewId !== null
            ? "bg-primary-green/10 border-primary-green/30 text-primary-green"
            : "bg-card border-text-secondary/15 text-text-primary"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-text-secondary/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[120px] bg-card border border-text-secondary/10 rounded-2xl shadow-xl py-1 overflow-hidden origin-top-left animate-dropdown-open focus:outline-none">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-left transition-colors hover:bg-text-secondary/5 active:bg-text-secondary/10 focus:outline-none ${
                  isSelected ? "text-primary-green" : "text-text-primary"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={12} strokeWidth={3} className="shrink-0 ml-2 text-primary-green" />
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
}

function InlineFilterBar({
  availableCrews,
  selectedCrewId,
  onCrewChange,
  showMyOnly,
  onToggleMyOnly,
  myMemberUuid,
}: InlineFilterBarProps) {
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
        className={`shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1 ${
          showMyOnly
            ? "bg-primary-green text-white border border-primary-green/20"
            : "bg-card border border-text-secondary/15 text-text-primary"
        }`}
      >
        <User size={11} />
        내 인증만
      </button>
    </div>
  );
}

interface DateNavigatorProps {
  selectedDate: string | null;
  period: FeedPeriod | null;
  today: string;
  isBusy: boolean;
  notice: string | null;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onOpenCalendar: () => void;
}

function DateNavigator({
  selectedDate,
  period,
  today,
  isBusy,
  notice,
  onPreviousDay,
  onNextDay,
  onOpenCalendar,
}: DateNavigatorProps) {
  const isDayMode = selectedDate !== null;
  const isAtToday = selectedDate !== null && compareYmd(selectedDate, today) >= 0;
  const label = selectedDate
    ? formatYmdDot(selectedDate)
    : period
      ? formatPeriodLabel(period)
      : "날짜 선택";

  return (
    <div className="px-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 bg-card border border-text-secondary/10 rounded-2xl shadow-card px-2 py-2">
        <button
          type="button"
          onClick={onPreviousDay}
          disabled={!isDayMode}
          aria-label="이전 날짜"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary hover:bg-text-secondary/8 active:scale-95 disabled:opacity-35 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={onOpenCalendar}
          aria-label={`선택 날짜 ${label}`}
          aria-busy={isBusy}
          className="flex-1 min-w-0 h-9 flex items-center justify-center gap-2 rounded-xl text-sm font-extrabold text-text-primary hover:bg-text-secondary/6 active:scale-[0.99] transition-all"
        >
          <span className="truncate">{label}</span>
          {isBusy && (
            <Loader2
              size={15}
              className="shrink-0 animate-spin text-[var(--color-primary-green)]"
              aria-hidden="true"
            />
          )}
          <span className="sr-only">{isBusy ? "인증 이력을 불러오는 중" : ""}</span>
        </button>

        <button
          type="button"
          onClick={onNextDay}
          disabled={!isDayMode || isAtToday}
          aria-label="다음 날짜"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary hover:bg-text-secondary/8 active:scale-95 disabled:opacity-35 disabled:pointer-events-none transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      {notice && (
        <p className="px-1 text-[11px] font-medium text-amber-600" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}

// ─── 페이지 ────────────────────────────────────────────────────

export default function CertificationsPage() {
  const myMemberUuid = useAuthStore((s) => s.user?.member_uuid);
  const [initialToday] = useState(() => getKstTodayYmd());
  const [today, setToday] = useState(initialToday);
  const todayRef = useRef(today);

  const [isPrinciplesModalOpen, setIsPrinciplesModalOpen] = useState(false);

  const [availableCrews, setAvailableCrews] = useState<AvailableCrew[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [showMyOnly, setShowMyOnly] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialToday);
  const [period, setPeriod] = useState<FeedPeriod | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dateNotice, setDateNotice] = useState<string | null>(null);
  const requestEpochRef = useRef(0);

  const queryPeriod = useMemo<FeedPeriod | null>(() => {
    if (selectedDate) return { start_date: selectedDate, end_date: selectedDate };
    return period;
  }, [selectedDate, period]);

  useEffect(() => {
    let timeoutId: number | undefined;

    const refreshToday = () => {
      const nextToday = getKstTodayYmd();
      const previousToday = todayRef.current;
      todayRef.current = nextToday;
      setToday(nextToday);
      setSelectedDate((current) => (current === previousToday ? nextToday : current));
    };
    const scheduleNextKstDayRefresh = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        refreshToday();
        scheduleNextKstDayRefresh();
      }, getMsUntilNextKstDay() + 1_000);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshToday();
    };

    scheduleNextKstDayRefresh();
    window.addEventListener("focus", refreshToday);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("focus", refreshToday);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const loadInitial = useCallback(
    async (crewId: number | null, currentPeriod: FeedPeriod | null) => {
      const epoch = (requestEpochRef.current += 1);
      setIsLoading(true);
      setIsLoadingMore(false);
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

        if (epoch !== requestEpochRef.current) return;
        setAvailableCrews(data.available_crews);
        setItems(data.feed_items);
        setNextCursor(data.next_cursor);
      } catch {
        if (epoch !== requestEpochRef.current) return;
        setErrorMessage("인증 이력을 불러오지 못했어요.");
      } finally {
        if (epoch === requestEpochRef.current) setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void Promise.resolve().then(() => loadInitial(selectedCrewId, queryPeriod));
  }, [selectedCrewId, queryPeriod, loadInitial]);

  const handleCrewChange = (crewId: number | null) => {
    setSelectedCrewId(crewId);
    setStatusFilter("ALL");
  };

  const handlePeriodApply = (newPeriod: FeedPeriod) => {
    if (compareYmd(newPeriod.start_date, today) > 0 || compareYmd(newPeriod.end_date, today) > 0) {
      setDateNotice("미래 날짜는 선택할 수 없어요.");
      return;
    }

    if (newPeriod.start_date === newPeriod.end_date) {
      setSelectedDate(newPeriod.start_date);
      setPeriod(null);
    } else {
      setSelectedDate(null);
      setPeriod(newPeriod);
    }
    setDateNotice(null);
    setIsCalendarOpen(false);
  };

  const handlePeriodClear = () => {
    setSelectedDate(null);
    setPeriod(null);
    setIsCalendarOpen(false);
    setDateNotice(null);
  };

  const handlePreviousDay = () => {
    setSelectedDate((current) => addDaysToYmd(current ?? today, -1));
    setPeriod(null);
    setDateNotice(null);
    setIsCalendarOpen(false);
  };

  const handleNextDay = () => {
    const base = selectedDate ?? today;
    const next = addDaysToYmd(base, 1);
    if (compareYmd(next, today) > 0) {
      setDateNotice("미래 날짜는 선택할 수 없어요.");
      return;
    }

    setSelectedDate(next);
    setPeriod(null);
    setDateNotice(null);
    setIsCalendarOpen(false);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    const epoch = requestEpochRef.current;
    setIsLoadingMore(true);

    try {
      const { data } = await getFeed({
        crew_id: selectedCrewId ?? undefined,
        from: queryPeriod?.start_date,
        to: queryPeriod?.end_date,
        cursor: nextCursor,
        limit: 20,
      });

      if (epoch !== requestEpochRef.current) return;
      setItems((prev) => [...prev, ...data.feed_items]);
      setNextCursor(data.next_cursor);
    } catch {
      if (epoch !== requestEpochRef.current) return;
      setErrorMessage("추가 데이터를 불러오지 못했어요.");
    } finally {
      if (epoch === requestEpochRef.current) setIsLoadingMore(false);
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
  const emptyStateTitle = selectedDate
    ? "해당 날짜의 인증 이력이 없어요"
    : period
      ? "해당 기간의 인증 이력이 없어요"
      : "인증 이력이 없어요";

  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-transparent">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header title="인증 이력" showBackButton />

        <div className="flex flex-col gap-4 pt-4">
          <DateNavigator
            selectedDate={selectedDate}
            period={period}
            today={today}
            isBusy={isLoading}
            notice={dateNotice}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
            onOpenCalendar={() => setIsCalendarOpen((v) => !v)}
          />
          {isCalendarOpen && (
            <div className="px-4">
              <CertificationCalendar
                currentPeriod={queryPeriod}
                todayYmd={today}
                onApply={handlePeriodApply}
                onClear={handlePeriodClear}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
          )}
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

              {/* 2. 한 줄 필터 바: 크루 ▼ / 내 인증만 */}
              <InlineFilterBar
                availableCrews={availableCrews}
                selectedCrewId={selectedCrewId}
                onCrewChange={handleCrewChange}
                showMyOnly={showMyOnly}
                onToggleMyOnly={() => setShowMyOnly((v) => !v)}
                myMemberUuid={myMemberUuid}
              />

              <div className="px-4">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  className="border-primary-green/25 bg-success-green/70 text-primary-green shadow-[0_6px_18px_rgba(94,155,115,0.14)] hover:bg-success-green"
                  onClick={() => setIsPrinciplesModalOpen(true)}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-extrabold">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-green text-white">
                        <ShieldCheck size={15} />
                      </span>
                      방장 운영 원칙 보기
                    </span>
                    <ChevronRight size={16} className="text-primary-green/70" />
                  </span>
                </Button>
              </div>

              {/* 3. 인증 리스트 */}
              <div className="px-4 flex flex-col gap-4 pb-4">
                {filteredCount === 0 ? (
                  <div className="mt-12 flex flex-col items-center gap-2 text-text-secondary">
                    <ClipboardCheck size={40} className="opacity-30" />
                    <p className="text-sm font-medium">{emptyStateTitle}</p>
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

      {isPrinciplesModalOpen && (
        <PrinciplesModal
          principles={mockDashboard.principles}
          onClose={() => setIsPrinciplesModalOpen(false)}
        />
      )}
    </main>
  );
}
