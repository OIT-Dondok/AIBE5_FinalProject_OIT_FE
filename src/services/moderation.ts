import { api } from "@/lib/axios";
import type {
  MissionLogReviewBucket,
  ModerationApproveResponse,
  ModerationRejectRequest,
  ModerationRejectResponse,
  ReviewableMissionLogResponse,
} from "@/types/domain";

export interface ReviewableMissionLogParams {
  bucket: MissionLogReviewBucket;
  cursor?: string;
  limit?: number;
}

export const getReviewableMissionLogs = (
  crewId: number,
  params: ReviewableMissionLogParams,
) =>
  api.get<ReviewableMissionLogResponse>(
    `/crews/${crewId}/host/mission-logs/reviewable`,
    { params },
  );

export const approveMissionLog = (missionLogId: number) =>
  api.post<ModerationApproveResponse>(
    `/mission-logs/${missionLogId}/moderation/approve`,
  );

export const rejectMissionLog = (
  missionLogId: number,
  body: ModerationRejectRequest,
) =>
  api.post<ModerationRejectResponse>(
    `/mission-logs/${missionLogId}/moderation/reject`,
    body,
  );
