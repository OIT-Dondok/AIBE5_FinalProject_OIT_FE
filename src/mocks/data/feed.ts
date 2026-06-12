import type { AvailableCrew, FeedItem, FeedResponse } from "@/types/domain";

// 현재 로그인 유저 UUID (authStore mock 기준)
const MY_MEMBER_UUID = "018f4fd2-6d7a-7a41-9f58-me000000001";

export const MOCK_AVAILABLE_CREWS: AvailableCrew[] = [
  { crew_id: 1, crew_name: "갓생 6시 기상" },
  { crew_id: 2, crew_name: "독서 1챕터" },
  { crew_id: 3, crew_name: "홈트 30분" },
];

export const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    mission_log_id: 1001,
    crew_id: 1,
    crew_name: "갓생 6시 기상",
    crew_participant_id: 101,
    member_uuid: MY_MEMBER_UUID,
    nickname: "갓생러",
    profile_image_url: null,
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
    caption: "오늘도 6시 기상 성공! 아침 햇살이 너무 좋아요.",
    server_time: "2026-06-12T06:03:00+09:00",
    certification_status: "SUCCESS",
    reaction_counts: { "🔥": 4, "👍": 2 },
    my_reactions: ["🔥"],
  },
  {
    mission_log_id: 1002,
    crew_id: 2,
    crew_name: "독서 1챕터",
    crew_participant_id: 201,
    member_uuid: MY_MEMBER_UUID,
    nickname: "갓생러",
    profile_image_url: null,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
    caption: "어린왕자 3챕터 완독. 생각보다 여운이 길다.",
    server_time: "2026-06-12T08:21:00+09:00",
    certification_status: "PENDING_REVIEW",
    reaction_counts: {},
    my_reactions: [],
  },
  {
    mission_log_id: 1003,
    crew_id: 3,
    crew_name: "홈트 30분",
    crew_participant_id: 301,
    member_uuid: MY_MEMBER_UUID,
    nickname: "갓생러",
    profile_image_url: null,
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
    caption: "스쿼트 100개 + 플랭크 3세트 완료.",
    server_time: "2026-06-11T07:45:00+09:00",
    certification_status: "SUCCESS",
    reaction_counts: { "💪": 5, "🔥": 3 },
    my_reactions: [],
  },
  {
    mission_log_id: 1004,
    crew_id: 1,
    crew_name: "갓생 6시 기상",
    crew_participant_id: 102,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-member002",
    nickname: "새벽왕",
    profile_image_url: null,
    image_url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80",
    caption: "5시 58분 기상. 2분 남겨두고 성공.",
    server_time: "2026-06-12T05:58:00+09:00",
    certification_status: "SUCCESS",
    reaction_counts: { "🔥": 7, "👏": 3 },
    my_reactions: ["👏"],
  },
  {
    mission_log_id: 1005,
    crew_id: 2,
    crew_name: "독서 1챕터",
    crew_participant_id: 202,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-member003",
    nickname: "책벌레",
    profile_image_url: null,
    image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    caption: "오늘은 사피엔스 2장 읽었어요. 내용이 너무 흥미롭네요.",
    server_time: "2026-06-12T09:10:00+09:00",
    certification_status: "PENDING_REVIEW",
    reaction_counts: { "📚": 2 },
    my_reactions: [],
  },
  {
    mission_log_id: 1006,
    crew_id: 3,
    crew_name: "홈트 30분",
    crew_participant_id: 302,
    member_uuid: "018f4fd2-6d7a-7a41-9f58-member004",
    nickname: "헬스왕",
    profile_image_url: null,
    image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
    caption: "버피 50개 완료. 오늘도 땀 흘렸다.",
    server_time: "2026-06-11T06:30:00+09:00",
    certification_status: "FAILED",
    reaction_counts: {},
    my_reactions: [],
  },
  {
    mission_log_id: 1007,
    crew_id: 1,
    crew_name: "갓생 6시 기상",
    crew_participant_id: 101,
    member_uuid: MY_MEMBER_UUID,
    nickname: "갓생러",
    profile_image_url: null,
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
    caption: null,
    server_time: "2026-06-11T06:02:00+09:00",
    certification_status: "SUCCESS",
    reaction_counts: { "🔥": 1 },
    my_reactions: [],
  },
  {
    mission_log_id: 1008,
    crew_id: 2,
    crew_name: "독서 1챕터",
    crew_participant_id: 201,
    member_uuid: MY_MEMBER_UUID,
    nickname: "갓생러",
    profile_image_url: null,
    image_url: null,
    caption: "전쟁과 평화 1챕터. 러시아 귀족 이름이 너무 많아서 힘들다.",
    server_time: "2026-06-10T22:14:00+09:00",
    certification_status: "FAILED",
    reaction_counts: {},
    my_reactions: [],
  },
];

// MY_MEMBER_UUID 기준으로 필터링한 내 인증 목록
export const MOCK_MY_FEED_ITEMS: FeedItem[] = MOCK_FEED_ITEMS.filter(
  (item) => item.member_uuid === MY_MEMBER_UUID,
);

export const MOCK_FEED_RESPONSE: FeedResponse = {
  available_crews: MOCK_AVAILABLE_CREWS,
  feed_items: MOCK_FEED_ITEMS,
  next_cursor: null,
};

// 크루 ID로 필터링된 피드 응답 생성 헬퍼
export function getMockFeedResponse(crewId?: number): FeedResponse {
  const filtered = crewId
    ? MOCK_FEED_ITEMS.filter((item) => item.crew_id === crewId)
    : MOCK_FEED_ITEMS;

  return {
    available_crews: MOCK_AVAILABLE_CREWS,
    feed_items: filtered,
    next_cursor: null,
  };
}
