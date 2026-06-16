"use client";

import { useState } from "react";
import { Settings } from "lucide-react";

import { Header } from "@/components/common/Header";
import { NotificationSettingsModal } from "@/components/domain/notification/NotificationSettingsModal";
import type { NotificationEventType } from "@/types/domain";

interface NotificationItem {
  id: number;
  event_type: NotificationEventType;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
}

// ── 카테고리 매핑 ────────────────────────────────────────────────────────────
type BadgeCategory = "미션" | "정산" | "크루";

function getCategory(event_type: NotificationEventType): BadgeCategory {
  if (event_type === "MISSION_LOG_VERIFICATION_RESULT") return "미션";
  if (event_type === "SETTLEMENT_COMPLETED") return "정산";
  return "크루";
}

const BADGE_STYLES: Record<BadgeCategory, string> = {
  미션: "bg-[#FBF1E1] text-[#D89B4C]",
  정산: "bg-[#E8F2EB] text-primary-green",
  크루: "bg-[#E0E8FA] text-[#4d73d9]",
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

// ── 목데이터 ────────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    event_type: "MISSION_LOG_VERIFICATION_RESULT",
    title: "인증이 승인됐어요",
    body: "오늘의 독서 미션 인증이 방장에게 승인됐어요.",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    is_read: false,
  },
  {
    id: 2,
    event_type: "CREW_APPLICATION_APPROVED",
    title: "크루 가입이 승인됐어요",
    body: "독서 1챕터 크루 가입 신청이 승인됐어요. 함께 달려봐요!",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    is_read: false,
  },
  {
    id: 3,
    event_type: "SETTLEMENT_COMPLETED",
    title: "정산이 완료됐어요",
    body: "오늘의 미션 정산이 완료됐어요. 포인트를 확인해보세요.",
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: 4,
    event_type: "CREW_ACTIVATED",
    title: "크루가 시작됐어요",
    body: "러닝 30분 크루가 활성화됐어요. 오늘부터 미션을 인증하세요!",
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    is_read: true,
  },
  {
    id: 5,
    event_type: "CREW_APPLICATION_REJECTED",
    title: "크루 가입이 거절됐어요",
    body: "아침 조깅 크루 가입 신청이 거절됐어요.",
    created_at: new Date(Date.now() - 50 * 3600000).toISOString(),
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
  return (
    <button
      type="button"
      onClick={() => onRead(item.id)}
      className={`w-full text-left rounded-2xl px-4 py-3.5 transition-colors ${
        item.is_read ? "bg-card" : "bg-[#F4F7FF]"
      }`}
    >
      <div className="flex items-start gap-3">
        {!item.is_read && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-blue" aria-label="읽지 않음" />
        )}
        {item.is_read && <span className="mt-1.5 h-2 w-2 shrink-0" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${BADGE_STYLES[category]}`}>
              {category}
            </span>
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
            <button
              type="button"
              aria-label="알림 설정"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 -mr-1 hover:opacity-75 active:scale-95 transition-all"
            >
              <Settings size={22} className="text-text-primary" />
            </button>
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

      <NotificationSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </main>
  );
}
