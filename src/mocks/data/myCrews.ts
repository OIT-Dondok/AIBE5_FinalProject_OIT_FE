import type { MyCrew, MyCrewsResponse } from "@/types/domain";

export const MOCK_MY_CREWS: MyCrew[] = [
  {
    crew_id: 1,
    title: "갓생 6시 기상",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
    category: "MORNING",
    status: "ACTIVE",
    deposit_amount: 20000,
    my_role: "HOST",
    my_status: "LOCKED",
    start_at: "2026-06-01T00:00:00+09:00",
    end_at: "2026-06-30T23:59:59+09:00",
  },
  {
    crew_id: 2,
    title: "독서 1챕터",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
    category: "READING",
    status: "ACTIVE",
    deposit_amount: 10000,
    my_role: "MEMBER",
    my_status: "LOCKED",
    start_at: "2026-05-14T00:00:00+09:00",
    end_at: "2026-06-14T23:59:59+09:00",
  },
  {
    crew_id: 3,
    title: "홈트 30분",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
    category: "EXERCISE",
    status: "ACTIVE",
    deposit_amount: 15000,
    my_role: "MEMBER",
    my_status: "LOCKED",
    start_at: "2026-05-21T00:00:00+09:00",
    end_at: "2026-06-21T23:59:59+09:00",
  },
  {
    crew_id: 4,
    title: "영어 단어 50",
    image_url: null,
    category: "STUDY",
    status: "RECRUITING",
    deposit_amount: 20000,
    my_role: "MEMBER",
    my_status: "PENDING",
    start_at: "2026-06-05T00:00:00+09:00",
    end_at: "2026-07-05T23:59:59+09:00",
  },
  {
    crew_id: 5,
    title: "식단 기록",
    image_url: null,
    category: "DIET",
    status: "CLOSED",
    deposit_amount: 10000,
    my_role: "MEMBER",
    my_status: "LOCKED",
    start_at: "2026-04-01T00:00:00+09:00",
    end_at: "2026-04-30T23:59:59+09:00",
  },
  {
    crew_id: 6,
    title: "아침 명상 10분",
    image_url: null,
    category: "MORNING",
    status: "CLOSED",
    deposit_amount: 5000,
    my_role: "HOST",
    my_status: "LOCKED",
    start_at: "2026-03-01T00:00:00+09:00",
    end_at: "2026-03-31T23:59:59+09:00",
  },
];

export const MOCK_MY_CREWS_RESPONSE: MyCrewsResponse = {
  items: MOCK_MY_CREWS,
  next_cursor: null,
};

// 탭 필터 헬퍼
export function getMockMyCrews(myStatus?: "PENDING" | "LOCKED" | "ALL"): MyCrewsResponse {
  if (!myStatus || myStatus === "ALL") {
    return MOCK_MY_CREWS_RESPONSE;
  }

  return {
    items: MOCK_MY_CREWS.filter((c) => c.my_status === myStatus),
    next_cursor: null,
  };
}
