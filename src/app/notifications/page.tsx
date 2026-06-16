"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Settings,
  TrendingUp,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { Header } from "@/components/common/Header";

interface NotificationItem {
  id: number;
  event_type: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
}

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
    iconBoxClassName: "bg-[#FBF1E1]",
    iconClassName: "text-[#D89B4C]",
    badgeClassName: "bg-[#FBF1E1] text-[#D89B4C]",
  },
  정산: {
    icon: WalletCards,
    iconBoxClassName: "bg-[#E8F2EB]",
    iconClassName: "text-primary-green",
    badgeClassName: "bg-[#E8F2EB] text-primary-green",
  },
  크루: {
    icon: Users,
    iconBoxClassName: "bg-[#E0E8FA]",
    iconClassName: "text-[#4d73d9]",
    badgeClassName: "bg-[#E0E8FA] text-[#4d73d9]",
  },
  리액션: {
    icon: Heart,
    iconBoxClassName: "bg-[#FCE8E4]",
    iconClassName: "text-[#D9735E]",
    badgeClassName: "bg-[#FCE8E4] text-[#D9735E]",
  },
};

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

// ── 조사 자동 선택 ────────────────────────────────────────────────────────────
function josa(word: string, form: "이/가" | "은/는" | "을/를" | "으로/로"): string {
  const code = word.charCodeAt(word.length - 1);
  const isKorean = code >= 0xac00 && code <= 0xd7a3;
  const hasBatchim = isKorean && (code - 0xac00) % 28 !== 0;
  const [withBatchim, withoutBatchim] = form.split("/");
  if (form === "으로/로") {
    const isRieul = isKorean && (code - 0xac00) % 28 === 8;
    return word + (hasBatchim && !isRieul ? withBatchim : withoutBatchim);
  }
  return word + (hasBatchim ? withBatchim : withoutBatchim);
}

// ── 목데이터 ────────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  // 오늘
  {
    id: 1,
    event_type: "CREW_APPLICATION_PENDING",
    title: "새로운 가입 신청이 있어요",
    body: "홍길동님이 독서 1챕터 가입을 신청했습니다. 지금 확인해보세요 →",
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    is_read: false,
  },
  {
    id: 9,
    event_type: "MISSION_DEADLINE_MEMBER",
    title: "인증 마감까지 1시간 남았어요",
    body: "독서 1챕터 인증 마감까지 1시간 남았습니다. 아직 인증을 완료하지 않으셨어요 ⏰",
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    is_read: false,
  },
  {
    id: 11,
    event_type: "MISSION_LOG_VERIFICATION_RESULT",
    title: "인증이 성공 처리됐어요",
    body: "독서 1챕터 5/21 인증이 성공 처리되었습니다 ✅",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    is_read: false,
  },
  {
    id: 18,
    event_type: "FEED_REACTION",
    title: "리액션이 달렸어요",
    body: "홍길동님이 내 인증에 🔥 리액션을 달았습니다",
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    is_read: true,
  },
  // 어제
  {
    id: 3,
    event_type: "CREW_APPLICATION_APPROVED",
    title: "크루 가입이 승인됐어요",
    body: "독서 1챕터 가입이 승인되었습니다! 보증금을 예치하고 미션을 시작하세요 →",
    created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: 5,
    event_type: "CREW_NOTICE",
    title: "새 공지가 등록됐어요",
    body: "독서 1챕터에 새로운 공지가 등록되었습니다. 확인해보세요 →",
    created_at: new Date(Date.now() - 27 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: 12,
    event_type: "MISSION_LOG_VERIFICATION_RESULT",
    title: "인증이 실패 처리됐어요",
    body: "독서 1챕터 5/21 인증이 실패 처리되었습니다 ❌",
    created_at: new Date(Date.now() - 30 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: 14,
    event_type: "MISSION_DEADLINE_HOST",
    title: "인증 마감 30분 전이에요",
    body: "독서 1챕터 — 인증 마감 30분 전입니다. 아직 검토하지 않은 인증이 3건 있습니다. 정산 전 확인해주세요 →",
    created_at: new Date(Date.now() - 33 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: 15,
    event_type: "SETTLEMENT_DAILY",
    title: "예상 환급금이 상승했어요",
    body: "독서 1챕터 5/21 미션 성공! 크루원 2명 인증 실패 → 예상 환급금 5,000도딘으로 상승했습니다 💪",
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    is_read: true,
  },
  // 이틀 전
  {
    id: 6,
    event_type: "CREW_MISSION_END_SOON",
    title: "미션 종료가 3일 남았어요",
    body: "독서 1챕터 미션이 3일 후 종료됩니다. 마지막까지 인증을 완료하세요 💪",
    created_at: new Date(Date.now() - 50 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: 7,
    event_type: "CREW_DISSOLVED",
    title: "크루가 해체됐어요",
    body: `${josa("독서 1챕터", "이/가")} 해체되었습니다. 예치하신 보증금 50,000도딘이 환급되었습니다.`,
    created_at: new Date(Date.now() - 52 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: 16,
    event_type: "SETTLEMENT_COMPLETED",
    title: "최종 정산이 완료됐어요",
    body: "독서 1챕터 미션 종료. 최종 환급금 50,000도딘이 지급되었습니다. 결과 보기 →",
    created_at: new Date(Date.now() - 55 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: 17,
    event_type: "SETTLEMENT_COMPLETED",
    title: "포인트가 지급됐어요",
    body: "50,000도딘이 지급되었습니다. 현재 잔액을 확인해보세요 →",
    created_at: new Date(Date.now() - 56 * 3600000).toISOString(),
    is_read: true,
  },
];

// ── 날짜별 그루핑 ────────────────────────────────────────────────────────────
function groupByDate(items: NotificationItem[]): Array<{ label: string; items: NotificationItem[] }> {
  const map = new Map<string, NotificationItem[]>();
  for (const item of items) {
    const label = getDateLabel(item.created_at);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(item);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

// ── 알림 카드 ────────────────────────────────────────────────────────────────
function NotificationCard({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: number) => void;
}) {
  const category = getCategory(item.event_type);
  const categoryMeta = CATEGORY_META[category];
  const CategoryIcon = categoryMeta.icon;

  return (
    <button
      type="button"
      onClick={() => onRead(item.id)}
      className={`w-full text-left rounded-2xl px-4 py-3.5 transition-colors ${
        item.is_read ? "bg-card" : "bg-[#F4F7FF]"
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
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${categoryMeta.badgeClassName}`}>
                {category}
              </span>
              {!item.is_read && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue" aria-label="읽지 않음" />
              )}
            </div>
            <span className="text-[11px] font-medium text-text-secondary">
              {formatRelativeTime(item.created_at)}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-extrabold text-text-primary">{item.title}</p>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-text-secondary">{item.body}</p>
        </div>
      </div>
    </button>
  );
}

// ── 페이지 ────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

  const markRead = (id: number) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));

  const groups = groupByDate(notifications);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background flex flex-col items-center">
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
            {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "모두 읽었어요"}
          </p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-extrabold text-primary-blue hover:opacity-75 transition-opacity"
            >
              모두 읽음
            </button>
          )}
        </div>

        {/* 알림 목록 */}
        <div className="flex flex-col gap-4 px-5 pt-3">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm font-semibold text-text-secondary">알림이 없어요</p>
            </div>
          ) : (
            groups.map(({ label, items }) => (
              <section key={label}>
                <h2 className="mb-2 px-1 text-[11px] font-extrabold text-text-secondary">{label}</h2>
                <div className="flex flex-col gap-1.5 rounded-2xl border border-text-secondary/10 bg-card overflow-hidden shadow-sm">
                  {items.map((item) => (
                    <NotificationCard key={item.id} item={item} onRead={markRead} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

    </main>
  );
}
