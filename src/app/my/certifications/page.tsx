"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";

import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/common/Skeleton";
import { getFeed } from "@/services/feed";
import { useAuthStore } from "@/store/authStore";
import type { AvailableCrew, CertificationStatus, FeedItem } from "@/types/domain";

// ─── 상태 설정 ────────────────────────────────────────────────

interface StatusMeta {
  badge: string;
  badgeClass: string;
  description: string;
}

const STATUS_CONFIG: Record<CertificationStatus, StatusMeta> = {
  PENDING_REVIEW: {
    badge: "검토중",
    badgeClass: "bg-amber-100 text-amber-700",
    description: "검토 대기 중",
  },
  SUCCESS: {
    badge: "승인",
    badgeClass: "bg-green-100 text-green-700",
    description: "인증이 승인되었어요",
  },
  FAILED: {
    badge: "거절",
    badgeClass: "bg-red-100 text-red-600",
    description: "인증이 반려되었어요",
  },
};

type StatusFilter = "ALL" | "APPROVED" | "REJECTED" | "PENDING";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "승인", value: "APPROVED" },
  { label: "거절", value: "REJECTED" },
  { label: "검토중", value: "PENDING" },
];

function matchesStatusFilter(status: CertificationStatus, filter: StatusFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "APPROVED") return status === "SUCCESS";
  if (filter === "REJECTED") return status === "FAILED";
  return status === "PENDING_REVIEW";
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

function CrewAvatar({ crewName, crewId }: { crewName: string; crewId: number }) {
  const initial = crewName.charAt(0);
  return (
    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${getAvatarClass(crewId)}`}>
      {initial}
    </div>
  );
}

function CertificationCard({ item }: { item: FeedItem }) {
  const { description } = STATUS_CONFIG[item.certification_status];
  return (
    <div className="flex items-center gap-3 bg-card rounded-card shadow-card border border-text-secondary/10 px-4 py-3 animate-feed-in">
      {/* 왼쪽: 크루명 이니셜 아바타 */}
      <CrewAvatar crewName={item.crew_name} crewId={item.crew_id} />

      {/* 중앙: 닉네임·크루명 / 시간·상태 설명 */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-text-primary truncate leading-snug">
          {item.nickname}
          <span className="font-normal text-text-secondary mx-1">·</span>
          {item.crew_name}
        </p>
        <p className="text-xs text-text-secondary/70">
          {formatTime(item.server_time)}
          <span className="mx-1">·</span>
          {description}
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

// ─── 상수 ────────────────────────────────────────────────────

const ALL_CREW_ID = -1;

// ─── 페이지 ────────────────────────────────────────────────────

export default function CertificationsPage() {
  const user = useAuthStore((state) => state.user);

  const [availableCrews, setAvailableCrews] = useState<AvailableCrew[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState<number>(ALL_CREW_ID);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadInitial = useCallback(
    async (crewId: number) => {
      setIsLoading(true);
      setErrorMessage(null);
      setItems([]);
      setNextCursor(null);

      try {
        const { data } = await getFeed({
          crew_id: crewId === ALL_CREW_ID ? undefined : crewId,
          limit: 20,
        });

        setAvailableCrews(data.available_crews);

        // TODO: BE에서 my_only 파라미터 추가 후 member_uuid 필터링 제거 예정
        console.log("[인증이력] authStore member_uuid:", user?.member_uuid);
        console.log("[인증이력] feed_items member_uuid 목록:", data.feed_items.map((i) => i.member_uuid));

        const myItems = user
          ? data.feed_items.filter((item) => item.member_uuid === user.member_uuid)
          : data.feed_items;

        setItems(myItems);
        setNextCursor(data.next_cursor);
      } catch {
        setErrorMessage("인증 이력을 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    void loadInitial(selectedCrewId);
  }, [selectedCrewId, loadInitial]);

  const handleCrewChange = (crewId: number) => {
    setSelectedCrewId(crewId);
    setStatusFilter("ALL");
  };

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const { data } = await getFeed({
        crew_id: selectedCrewId === ALL_CREW_ID ? undefined : selectedCrewId,
        cursor: nextCursor,
        limit: 20,
      });

      // TODO: BE에서 my_only 파라미터 추가 후 개선 예정 — member_uuid 필터링 후 빈 페이지가 나올 수 있음
      const myItems = user
        ? data.feed_items.filter((item) => item.member_uuid === user.member_uuid)
        : data.feed_items;

      setItems((prev) => [...prev, ...myItems]);
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

        {/* 필터 영역 — sticky */}
        <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-sm border-b border-text-secondary/5">
          {/* 상태 필터 탭 */}
          <div className="flex gap-1.5 px-4 pt-3 pb-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  statusFilter === tab.value
                    ? "bg-text-primary text-white"
                    : "bg-card text-text-secondary border border-text-secondary/15 hover:bg-text-secondary/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 크루 필터 탭 */}
          {availableCrews.length > 0 && (
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleCrewChange(ALL_CREW_ID)}
                className={`shrink-0 px-3.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedCrewId === ALL_CREW_ID
                    ? "bg-primary-green text-white"
                    : "bg-card text-text-secondary border border-text-secondary/15"
                }`}
              >
                전체
              </button>
              {availableCrews.map((crew) => (
                <button
                  key={crew.crew_id}
                  type="button"
                  onClick={() => handleCrewChange(crew.crew_id)}
                  className={`shrink-0 px-3.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                    selectedCrewId === crew.crew_id
                      ? "bg-primary-green text-white"
                      : "bg-card text-text-secondary border border-text-secondary/15"
                  }`}
                >
                  {crew.crew_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="px-4 pt-4 flex flex-col gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          ) : errorMessage ? (
            <div className="mt-20 flex flex-col items-center gap-2 text-text-secondary">
              <ClipboardCheck size={40} className="opacity-30" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          ) : filteredCount === 0 ? (
            <div className="mt-20 flex flex-col items-center gap-2 text-text-secondary">
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
      </div>
    </main>
  );
}
