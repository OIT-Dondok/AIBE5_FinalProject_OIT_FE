"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Settings,
  TrendingUp,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { Header } from "@/components/common/Header";
import { EmptyState } from "@/components/common/EmptyState";
import { getNotifications, getUnreadCount, readAllNotifications, readNotification } from "@/api/notification";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import type { NotificationItem } from "@/types/domain";
import { useNotificationStore } from "@/store/notificationStore";

// ── 카테고리 매핑 ────────────────────────────────────────────────────────────
type BadgeCategory = "미션" | "정산" | "크루" | "리액션";

function getCategory(event_type: string): BadgeCategory {
  if (event_type.startsWith("MISSION_")) return "미션";
  if (event_type.startsWith("SETTLEMENT_")) return "정산";
  if (event_type.includes("REACTION")) return "리액션";
  return "크루";
}

const CATEGORY_META: Record<
  BadgeCategory,
  {
    icon: LucideIcon;
    iconBoxClassName: string;
    iconClassName: string;
    badgeClassName: string;
  }
> = {
  미션: {
    icon: TrendingUp,
    iconBoxClassName: "bg-amber-50",
    iconClassName: "text-amber-600",
    badgeClassName: "bg-amber-50 text-amber-600",
  },
  정산: {
    icon: WalletCards,
    iconBoxClassName: "bg-success-green/40",
    iconClassName: "text-primary-green",
    badgeClassName: "bg-success-green/40 text-primary-green",
  },
  크루: {
    icon: Users,
    iconBoxClassName: "bg-primary-blue/10",
    iconClassName: "text-primary-blue",
    badgeClassName: "bg-primary-blue/10 text-primary-blue",
  },
  리액션: {
    icon: Heart,
    iconBoxClassName: "bg-rose-50",
    iconClassName: "text-rose-500",
    badgeClassName: "bg-rose-50 text-rose-500",
  },
};

// ── 딥링크 ────────────────────────────────────────────────────────────────────
function getDeepLink(item: NotificationItem): string | null {
  if (item.deep_link) {
    const converted = item.deep_link.replace(/^dondok:\/\//, '/');
    if (process.env.NODE_ENV === 'development') {
      console.log('[DeepLink]', item.deep_link, '→', converted);
    }
    return converted;
  }
  // deep_link이 없으면 라우팅하지 않는다.
  // (BE 계약: 알림 클릭 시 deep_link로 이동 후 canonical API refetch. payload로 URL을 재구성하지 않음)
  return null;
}

// ── 시간 포맷 ────────────────────────────────────────────────────────────────
function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getDateLabel(isoString: string): string {
  const target = new Date(isoString);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((todayMidnight.getTime() - targetMidnight.getTime()) / 86400000);
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  return `${target.getFullYear()}년 ${target.getMonth() + 1}월 ${target.getDate()}일`;
}

// ── 날짜별 그루핑 ────────────────────────────────────────────────────────────
function groupByDate(items: NotificationItem[]): Array<{ label: string; items: NotificationItem[] }> {
  const map = new Map<string, NotificationItem[]>();
  const sorted = [...items].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  for (const item of sorted) {
    const label = getDateLabel(item.occurred_at);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(item);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

// ── 알림 카드 ────────────────────────────────────────────────────────────────
function NotificationCard({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: (item: NotificationItem) => void;
}) {
  const category = getCategory(item.event_type);
  const categoryMeta = CATEGORY_META[category];
  const CategoryIcon = categoryMeta.icon;
  const message = item.display_text;

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={`w-full origin-center rounded-2xl px-4 py-3.5 text-left transition-[background-color,transform] duration-150 ease-out active:scale-[0.985] ${
        item.read_at !== null ? "bg-card active:bg-text-secondary/5" : "bg-primary-blue/5 active:bg-primary-blue/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${categoryMeta.iconBoxClassName}`}
          aria-hidden="true"
        >
          <CategoryIcon size={18} strokeWidth={2.2} className={categoryMeta.iconClassName} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${categoryMeta.badgeClassName}`}>
                {category}
              </span>
              {item.read_at === null && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue" aria-label="읽지 않음" />
              )}
            </div>
            <span className="text-[11px] font-medium text-text-secondary">
              {formatRelativeTime(item.occurred_at)}
            </span>
          </div>
          <p className="mt-1.5 break-words text-[14px] font-bold leading-snug text-text-primary">
            {message}
          </p>
          {item.crew_name && (
            <p className="mt-1.5 break-words text-xs font-semibold leading-tight text-text-secondary">
              {item.crew_name}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

type FilterTab = "전체" | BadgeCategory;

const FILTER_TABS: Array<{ value: FilterTab; label: string }> = [
  { value: "전체", label: "전체" },
  { value: "미션", label: "미션" },
  { value: "정산", label: "정산" },
  { value: "리액션", label: "리액션" },
  { value: "크루", label: "크루" },
];

// ── 페이지 ────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("전체");
  const setStoreUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [{ data }, { data: unreadData }] = await Promise.all([
        getNotifications({ limit: 20 }),
        getUnreadCount(),
      ]);
      setNotifications(data.items);
      setNextCursor(data.next_cursor);
      setUnreadCount(unreadData.unread_count);
      setStoreUnreadCount(unreadData.unread_count);
      if (process.env.NODE_ENV === 'development') {
        console.log('[Notifications] unread_count from API:', unreadData.unread_count);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, {}, "알림을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
    } finally {
      setLoading(false);
    }
  }, [setStoreUnreadCount]);

  useEffect(() => {
    // 마운트 1회 로드. effect 동기 구간에서 setState가 실행되지 않도록 마이크로태스크로 지연
    // (set-state-in-effect 방지 — 인증 이력 페이지와 동일 패턴)
    void Promise.resolve().then(() => fetchInitial());
  }, [fetchInitial]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await getNotifications({ cursor: nextCursor, limit: 20 });
      setNotifications((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
    } finally {
      setLoadingMore(false);
    }
  };

  const markAllRead = async () => {
    await readAllNotifications();
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: now })));
    setUnreadCount(0);
    setStoreUnreadCount(0);
  };

  const handleCardClick = (item: NotificationItem) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[handleCardClick]', item.notification_id, item.event_type);
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('[handleCardClick] read_at:', item.read_at, '| type:', typeof item.read_at, '| isNull:', item.read_at === null);
    }
    if (item.read_at === null) {
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => n.notification_id === item.notification_id ? { ...n, read_at: now } : n)
      );
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      setStoreUnreadCount(newCount);
      if (process.env.NODE_ENV === 'development') {
        console.log('[handleCardClick] calling readNotification:', item.notification_id);
      }
      void readNotification(item.notification_id).catch(() => {});
    }
    const deeplink = getDeepLink(item);
    if (deeplink) router.push(deeplink);
  };

  const filtered =
    activeFilter === "전체"
      ? notifications
      : notifications.filter((n) => getCategory(n.event_type) === activeFilter);

  const groups = groupByDate(filtered);

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-background flex flex-col items-center">
      <div className="w-full max-w-[430px] min-w-0 flex flex-col pb-28">
        <Header
          title="알림"
          showBackButton
          rightElement={
            <Link
              href="/notifications/settings"
              aria-label="알림 설정"
              className="p-1 -mr-1 hover:opacity-75 active:scale-95 transition-all"
            >
              <Settings size={22} className="text-text-primary" />
            </Link>
          }
        />

        {/* 모두 읽음 버튼 */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <p className="text-sm font-semibold text-text-secondary">
            {loading
              ? "알림을 불러오는 중..."
              : unreadCount > 0
              ? `읽지 않은 알림 ${unreadCount}개`
              : "모두 읽었어요"}
          </p>
          {!loading && unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-extrabold text-primary-blue hover:opacity-75 transition-opacity"
            >
              모두 읽음
            </button>
          )}
        </div>

        {/* 카테고리 필터 탭 */}
        <div className="flex gap-2 overflow-x-auto px-5 pt-3 pb-1 no-scrollbar">
          {FILTER_TABS.map(({ value, label }) => {
            const isActive = activeFilter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setActiveFilter(value)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-colors ${
                  isActive
                    ? "bg-text-primary text-background"
                    : "bg-card text-text-secondary border border-text-secondary/20"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 알림 목록 */}
        <div className="flex flex-col gap-4 px-5 pt-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-sm font-semibold text-text-secondary">불러오는 중...</p>
            </div>
          ) : errorMessage ? (
            <EmptyState
              icon="⚠️"
              title={errorMessage}
              actionButtonText="다시 시도"
              onActionClick={fetchInitial}
              className="py-20 px-6"
            />
          ) : groups.length === 0 ? (
            <EmptyState
              icon="🔔"
              title={activeFilter === "전체" ? "알림이 없어요" : `${activeFilter} 알림이 없어요`}
              className="py-20 px-6"
            />
          ) : (
            <>
              {groups.map(({ label, items }) => (
                <section key={label}>
                  <h2 className="mb-2 px-1 text-[11px] font-extrabold text-text-secondary">{label}</h2>
                  <div className="flex flex-col gap-1.5 rounded-2xl border border-text-secondary/10 bg-card overflow-hidden shadow-sm">
                    {items.map((item) => (
                      <NotificationCard key={item.notification_id} item={item} onClick={handleCardClick} />
                    ))}
                  </div>
                </section>
              ))}

              {nextCursor && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-3 text-sm font-semibold text-primary-green border border-primary-green/30 rounded-2xl hover:bg-primary-green/5 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? "불러오는 중..." : "더 보기"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
