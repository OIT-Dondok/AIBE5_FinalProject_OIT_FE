import type { CrewCategory } from '@/mocks/data/crews';

export type CertificationStatus = 'SUCCESS' | 'PENDING_REVIEW' | 'FAILED';

export interface FeedReaction {
  emoji: string;
  count: number;
}

export interface FeedItem {
  feed_id: number;
  crew_id: number;
  crew_title: string;
  category: CrewCategory;
  nickname: string;
  certified_at: string;
  share_ratio: number;
  certification_status: CertificationStatus;
  image_url: string | null;
  caption: string;
  reactions: FeedReaction[];
}

export interface FeedPeriod {
  start_date: string;
  end_date: string;
}

export const MOCK_FEED_PERIOD: FeedPeriod = {
  start_date: '2026-05-15',
  end_date: '2026-05-19',
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
    feed_id: 1,
    crew_id: 2,
    crew_title: '독서 1챕터',
    category: 'READING',
    nickname: '갓생러',
    certified_at: '2026-05-19T09:23:00+09:00',
    share_ratio: 25.0,
    certification_status: 'SUCCESS',
    image_url: null,
    caption: '오늘도 한 챕터 완독! 꾸준함이 최고야 📚',
    reactions: [
      { emoji: '👍', count: 5 },
      { emoji: '🔥', count: 3 },
    ],
  },
  {
    feed_id: 2,
    crew_id: 3,
    crew_title: '홈트 30분',
    category: 'EXERCISE',
    nickname: '근육맨',
    certified_at: '2026-05-19T07:45:00+09:00',
    share_ratio: 18.5,
    certification_status: 'SUCCESS',
    image_url: null,
    caption: '오늘 런지 200개 완료! 🏃 다리가 후들후들',
    reactions: [
      { emoji: '💪', count: 8 },
      { emoji: '😅', count: 2 },
    ],
  },
  {
    feed_id: 3,
    crew_id: 2,
    crew_title: '독서 1챕터',
    category: 'READING',
    nickname: '책벌레',
    certified_at: '2026-05-19T22:10:00+09:00',
    share_ratio: 12.5,
    certification_status: 'PENDING_REVIEW',
    image_url: null,
    caption: '자기 전에 겨우 한 챕터... 그래도 했다!',
    reactions: [
      { emoji: '😴', count: 4 },
    ],
  },
  {
    feed_id: 4,
    crew_id: 1,
    crew_title: '갓생 6시 기상',
    category: 'MORNING',
    nickname: '새벽감성',
    certified_at: '2026-05-19T08:15:00+09:00',
    share_ratio: 9.0,
    certification_status: 'FAILED',
    image_url: null,
    caption: '오늘은 7시에 눈 떴어요... 내일은 꼭 6시에!',
    reactions: [
      { emoji: '😭', count: 6 },
      { emoji: '🫂', count: 3 },
    ],
  },
];
