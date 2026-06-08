// 💡 @/lib/instance 에서 @/lib/api/instance 로 정밀 조준 완료!
import { api } from '@/lib/axios';

/**
 * 1. 크루 목록 조회 (동적 쿼리 파라미터 매핑)
 * GET /api/crews
 */
export const getCrews = (status: string, category: string, keyword: string) => {
    return api.get('/crews', {
        params: { status, category, keyword }
    });
};

/**
 * 2. 크루 생성 (유저가 입력한 폼 데이터 전송)
 * POST /api/crews
 */
export const createCrew = (crewData: any) => {
    return api.post('/crews', crewData);
};