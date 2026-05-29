export type CrewStatus = 'RECRUITING' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';

export type CrewCategory =
    | 'MORNING'
    | 'READING'
    | 'EXERCISE'
    | 'STUDY'
    | 'DIET'
    | 'MIND'
    | 'HEALTH';

export interface MockCrew {
    crew_id: number;
    title: string;
    category: CrewCategory;
    status: CrewStatus;
    deposit_amount: number;
    min_participants: number;
    max_participants: number;
    current_participants: number;
    start_at: string;
    end_at: string;
    daily_settlement_type: 'A' | 'B' | 'C';
}

export const MOCK_CREWS: MockCrew[] = [
    {
        crew_id: 1,
        title: '갓생 6시 기상',
        category: 'MORNING',
        status: 'RECRUITING',
        deposit_amount: 20000,
        min_participants: 3,
        max_participants: 10,
        current_participants: 8,
        start_at: '2026-06-01T00:00:00+09:00',
        end_at: '2026-06-30T23:59:59+09:00',
        daily_settlement_type: 'A',
    },
    {
        crew_id: 2,
        title: '독서 1챕터',
        category: 'READING',
        status: 'ACTIVE',
        deposit_amount: 10000,
        min_participants: 3,
        max_participants: 8,
        current_participants: 6,
        start_at: '2026-05-14T00:00:00+09:00',
        end_at: '2026-06-14T23:59:59+09:00',
        daily_settlement_type: 'B',
    },
    {
        crew_id: 3,
        title: '홈트 30분',
        category: 'EXERCISE',
        status: 'ACTIVE',
        deposit_amount: 15000,
        min_participants: 3,
        max_participants: 12,
        current_participants: 5,
        start_at: '2026-05-21T00:00:00+09:00',
        end_at: '2026-06-21T23:59:59+09:00',
        daily_settlement_type: 'A',
    },
    {
        crew_id: 4,
        title: '영어 단어 50',
        category: 'STUDY',
        status: 'RECRUITING',
        deposit_amount: 20000,
        min_participants: 5,
        max_participants: 10,
        current_participants: 3,
        start_at: '2026-06-05T00:00:00+09:00',
        end_at: '2026-07-05T23:59:59+09:00',
        daily_settlement_type: 'B',
    },
    {
        crew_id: 5,
        title: '식단 기록',
        category: 'DIET',
        status: 'CLOSED',
        deposit_amount: 10000,
        min_participants: 3,
        max_participants: 8,
        current_participants: 8,
        start_at: '2026-04-01T00:00:00+09:00',
        end_at: '2026-04-30T23:59:59+09:00',
        daily_settlement_type: 'C',
    },
];