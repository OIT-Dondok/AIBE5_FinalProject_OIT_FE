import type { NotificationEventType } from "@/types/domain";

export interface NotificationItem {
  notification_id: string;
  event_type: NotificationEventType;
  title: string;
  body: string;
  is_read: boolean;
  crew_id?: number;
  crew_name?: string;
  mission_log_id?: number;
  created_at: string;
}

export interface NotificationsResponse {
  items: NotificationItem[];
  next_cursor: string | null;
  unread_count: number;
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    notification_id: "notif-001",
    event_type: "MISSION_LOG_VERIFICATION_RESULT",
    title: "인증이 승인되었어요 ✅",
    body: "갓생 6시 기상 — 오늘 인증이 승인됐어요. 지분율이 올라갈 예정이에요.",
    is_read: false,
    crew_id: 1,
    crew_name: "갓생 6시 기상",
    mission_log_id: 1001,
    created_at: "2026-06-12T12:01:00+09:00",
  },
  {
    notification_id: "notif-002",
    event_type: "MISSION_LOG_VERIFICATION_RESULT",
    title: "인증이 반려되었어요 ❌",
    body: "독서 1챕터 — 이미지가 기준에 맞지 않아 반려됐어요. 다시 인증해 보세요.",
    is_read: false,
    crew_id: 2,
    crew_name: "독서 1챕터",
    mission_log_id: 1008,
    created_at: "2026-06-11T23:10:00+09:00",
  },
  {
    notification_id: "notif-003",
    event_type: "SETTLEMENT_COMPLETED",
    title: "정산이 완료됐어요 💰",
    body: "갓생 6시 기상 — 오늘 정산 결과 22,400원이 도딘에 적립됐어요.",
    is_read: false,
    crew_id: 1,
    crew_name: "갓생 6시 기상",
    created_at: "2026-06-11T12:00:00+09:00",
  },
  {
    notification_id: "notif-004",
    event_type: "CREW_ACTIVATED",
    title: "크루가 시작됐어요 🚀",
    body: "영어 단어 50 — 미션이 시작됐어요. 오늘 첫 번째 인증에 도전해 보세요!",
    is_read: true,
    crew_id: 4,
    crew_name: "영어 단어 50",
    created_at: "2026-06-05T00:00:00+09:00",
  },
  {
    notification_id: "notif-005",
    event_type: "CREW_APPLICATION_APPROVED",
    title: "크루 신청이 승인됐어요 🎉",
    body: "독서 1챕터 — 방장이 신청을 승인했어요. 미션 시작일을 확인해 보세요.",
    is_read: true,
    crew_id: 2,
    crew_name: "독서 1챕터",
    created_at: "2026-05-13T16:30:00+09:00",
  },
  {
    notification_id: "notif-006",
    event_type: "SETTLEMENT_COMPLETED",
    title: "정산이 완료됐어요 💰",
    body: "식단 기록 — 4월 정산 완료. 최종 환급금 9,200원이 도딘에 적립됐어요.",
    is_read: true,
    crew_id: 5,
    crew_name: "식단 기록",
    created_at: "2026-05-01T12:00:00+09:00",
  },
  {
    notification_id: "notif-007",
    event_type: "CREW_APPLICATION_REJECTED",
    title: "크루 신청이 거절됐어요",
    body: "새벽 러닝 크루 — 아쉽게도 이번 신청이 거절됐어요. 다른 크루를 찾아보세요.",
    is_read: true,
    crew_id: 7,
    crew_name: "새벽 러닝 크루",
    created_at: "2026-04-28T10:14:00+09:00",
  },
];

export const MOCK_NOTIFICATIONS_RESPONSE: NotificationsResponse = {
  items: MOCK_NOTIFICATIONS,
  next_cursor: null,
  unread_count: MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length,
};

// 읽음 처리 시뮬레이션용 헬퍼 (상태를 변경하지 않는 순수 함수)
export function markAsRead(items: NotificationItem[], notificationId: string): NotificationItem[] {
  return items.map((n) =>
    n.notification_id === notificationId ? { ...n, is_read: true } : n,
  );
}

export function markAllAsRead(items: NotificationItem[]): NotificationItem[] {
  return items.map((n) => ({ ...n, is_read: true }));
}
