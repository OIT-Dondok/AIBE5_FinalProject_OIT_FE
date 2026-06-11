import { api } from '@/lib/axios';
import type { FeedResponse } from '@/types/domain';

export interface GetFeedParams {
  /** 특정 크루 필터. 생략 시 내가 참여 중인 전체 크루 */
  crew_id?: number;
  /** 조회 시작일 YYYY-MM-DD */
  from?: string;
  /** 조회 종료일 YYYY-MM-DD. from만 주면 단일 날짜, from~to면 기간. 항상 from <= to */
  to?: string;
  /** feed_items 페이지 크기. 기본 20 */
  limit?: number;
  /** 페이지네이션 커서. 형식: {server_time}_{mission_log_id} */
  cursor?: string;
}

// GET /api/feed — 내가 참여 중인 크루들의 인증 피드 조회
// undefined 파라미터는 axios가 쿼리에서 자동 제외한다.
export const getFeed = (params?: GetFeedParams) => {
  return api.get<FeedResponse>('/feed', { params });
};