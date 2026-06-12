import { api } from '@/lib/axios';
import type { FeedResponse, ReactionResponse } from '@/types/domain';

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

// POST /api/mission-logs/{missionLogId}/reactions — 인증 로그에 이모지 리액션 추가
// 응답으로 갱신된 my_reactions / reaction_counts 전체를 반환한다.
export const addReaction = (missionLogId: number, reactionType: string) => {
  return api.post<ReactionResponse>(
    `/mission-logs/${missionLogId}/reactions`,
    { reaction_type: reactionType },
  );
};

// DELETE /api/mission-logs/{missionLogId}/reactions/me — 내가 누른 리액션 삭제
// reaction_type은 query로 전달(axios params가 URL 인코딩 처리).
// 이미 없는 리액션이어도 서버는 200으로 응답한다.
export const removeReaction = (missionLogId: number, reactionType: string) => {
  return api.delete<ReactionResponse>(
    `/mission-logs/${missionLogId}/reactions/me`,
    { params: { reaction_type: reactionType } },
  );
};
