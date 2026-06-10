import { api } from "@/lib/axios";
import type {
  HostReviewableMissionLogResponse,
  HostReviewBucketRequest,
  ModerationApproveResponse,
  ModerationRejectRequest,
  ModerationRejectResponse,
} from "@/types/domain";

export const getHostReviewableMissionLogs = (
  crewId: number,
  params: {
    bucket: HostReviewBucketRequest;
    cursor?: string | null;
    limit?: number;
  },
) => {
  return api.get<HostReviewableMissionLogResponse>(
    `/crews/${crewId}/host/mission-logs/reviewable`,
    {
      params: {
        bucket: params.bucket,
        cursor: params.cursor ?? undefined,
        limit: params.limit,
      },
    },
  );
};

export const approveMissionLogModeration = (missionLogId: number) => {
  return api.post<ModerationApproveResponse>(
    `/mission-logs/${missionLogId}/moderation/approve`,
  );
};

export const rejectMissionLogModeration = (
  missionLogId: number,
  payload: ModerationRejectRequest,
) => {
  return api.post<ModerationRejectResponse>(
    `/mission-logs/${missionLogId}/moderation/reject`,
    payload,
  );
};
