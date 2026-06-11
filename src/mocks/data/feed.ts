import type { CrewCategory } from '@/mocks/data/crews';
import type { FeedItem } from '@/types/domain';

export interface FeedPeriod {
  start_date: string;
  end_date: string;
}

export const MOCK_FEED_PERIOD: FeedPeriod = {
  start_date: '2026-05-19',
  end_date: '2026-06-01',
};

export interface MyCrewItem {
  crew_id: number;
  crew_title: string;
  category: CrewCategory;
}

export const MOCK_MY_CREWS: MyCrewItem[] = [
  { crew_id: 1, crew_title: '갓생 6시 기상', category: 'MORNING' },
  { crew_id: 2, crew_title: '독서 1챕터', category: 'READING' },
  { crew_id: 3, crew_title: '홈트 30분', category: 'EXERCISE' },
];

export const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    mission_log_id: 1,
    crew_id: 2,
    crew_name: '독서 1챕터',
    crew_participant_id: 201,
    member_uuid: '018f4fd2-0000-7a41-9f58-000000000001',
    nickname: '갓생러',
    profile_image_url: null,
    image_url: null,
    caption: '오늘도 한 챕터 완독! 꾸준함이 최고야 📚',
    server_time: '2026-05-19T09:23:00+09:00',
    certification_status: 'SUCCESS',
    reaction_counts: { '👍': 5, '🔥': 3 },
    my_reactions: ['👍'],
  },
  {
    mission_log_id: 2,
    crew_id: 3,
    crew_name: '홈트 30분',
    crew_participant_id: 301,
    member_uuid: '018f4fd2-0000-7a41-9f58-000000000002',
    nickname: '근육맨',
    profile_image_url: null,
    image_url: null,
    caption: '오늘 런지 200개 완료! 🏃 다리가 후들후들',
    server_time: '2026-05-19T07:45:00+09:00',
    certification_status: 'SUCCESS',
    reaction_counts: { '💪': 8, '😅': 2 },
    my_reactions: [],
  },
  {
    mission_log_id: 3,
    crew_id: 2,
    crew_name: '독서 1챕터',
    crew_participant_id: 202,
    member_uuid: '018f4fd2-0000-7a41-9f58-000000000003',
    nickname: '책벌레',
    profile_image_url: null,
    image_url: null,
    caption: '자기 전에 겨우 한 챕터... 그래도 했다!',
    server_time: '2026-05-19T22:10:00+09:00',
    certification_status: 'PENDING_REVIEW',
    reaction_counts: { '😴': 4 },
    my_reactions: [],
  },
  {
    mission_log_id: 4,
    crew_id: 1,
    crew_name: '갓생 6시 기상',
    crew_participant_id: 101,
    member_uuid: '018f4fd2-0000-7a41-9f58-000000000004',
    nickname: '새벽감성',
    profile_image_url: null,
    image_url: null,
    caption: '오늘은 7시에 눈 떴어요... 내일은 꼭 6시에!',
    server_time: '2026-05-19T08:15:00+09:00',
    certification_status: 'FAILED',
    reaction_counts: { '😭': 6, '🫂': 3 },
    my_reactions: [],
  },
  {
    mission_log_id: 5,
    crew_id: 1,
    crew_name: '갓생 6시 기상',
    crew_participant_id: 102,
    member_uuid: '018f4fd2-0000-7a41-9f58-000000000005',
    nickname: '미라클모닝',
    profile_image_url: null,
    image_url: null,
    caption: '6시 정각 기상 성공! 상쾌한 아침이에요 🌅',
    server_time: '2026-06-01T06:05:00+09:00',
    certification_status: 'SUCCESS',
    reaction_counts: { '🔥': 7, '👏': 4 },
    my_reactions: ['🔥'],
  },
];